import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { DOMParser } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// F1 championship points system
const F1_POINTS_SYSTEM: { [key: number]: number } = {
  1: 25,
  2: 18,
  3: 15,
  4: 12,
  5: 10,
  6: 8,
  7: 6,
  8: 4,
  9: 2,
  10: 1,
}

const RESULTS_INDEX_URL = 'https://www.formula1.com/en/results/2025/races'

const normalize = (s: string | null | undefined): string =>
  (s || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('[F1 2025] Fetching official results index...')
    const indexRes = await fetch(RESULTS_INDEX_URL, { headers: { 'User-Agent': 'Mozilla/5.0' } })
    if (!indexRes.ok) throw new Error(`Failed to fetch index: ${indexRes.status}`)
    const indexHtml = await indexRes.text()

    const indexDoc = new DOMParser().parseFromString(indexHtml, 'text/html')
    if (!indexDoc) throw new Error('Failed to parse results index HTML')

    const links = Array.from(indexDoc.querySelectorAll('a'))
      .map((a: any) => a.getAttribute('href') as string | null)
      .filter((href): href is string => !!href && /\/en\/results\/2025\/races\/.+\/race-result$/.test(href))

    const raceUrls = Array.from(new Set(links)).map((href) => new URL(href, 'https://www.formula1.com').toString())
    console.log(`[F1 2025] Found ${raceUrls.length} race result pages`)

    // Load drivers from DB and build normalized lookup
    const { data: drivers, error: driversError } = await supabase
      .from('drivers')
      .select('id, name')
    if (driversError) throw driversError

    const driverByNormName = new Map<string, { id: string; name: string }>()
    drivers?.forEach((d) => driverByNormName.set(normalize(d.name), d))

    // Aggregate points per driver across all races
    const pointsByDriverId = new Map<string, number>()

    for (const raceUrl of raceUrls) {
      try {
        console.log(`[F1 2025] Processing race: ${raceUrl}`)
        const res = await fetch(raceUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } })
        if (!res.ok) {
          console.warn(`Failed to fetch race page: ${raceUrl}`)
          continue
        }
        const html = await res.text()
        const doc = new DOMParser().parseFromString(html, 'text/html')
        if (!doc) {
          console.warn('Failed to parse race page HTML')
          continue
        }

        const table = doc.querySelector('table.resultsarchive-table') as any
        if (!table) {
          console.warn('No results table found on page')
          continue
        }

        const rows = Array.from(table.querySelectorAll('tbody tr')) as any[]
        const top10NormNames = new Set<string>()

        // Parse top 10 finishing order
        for (let i = 0; i < Math.min(rows.length, 10); i++) {
          const row = rows[i]
          const tds = Array.from(row.querySelectorAll('td')) as any[]
          if (tds.length < 3) continue
          const driverCell = tds[2]
          const driverText = driverCell.textContent?.replace(/\n|\t/g, ' ') || ''
          const driverName = driverText.replace(/\s+/g, ' ').trim()
          const norm = normalize(driverName)
          if (!norm) continue
          top10NormNames.add(norm)

          const dbDriver = driverByNormName.get(norm)
          if (dbDriver) {
            const position = i + 1
            const pts = F1_POINTS_SYSTEM[position] || 0
            if (pts > 0) {
              const current = pointsByDriverId.get(dbDriver.id) || 0
              pointsByDriverId.set(dbDriver.id, current + pts)
              console.log(` +${pts} ${dbDriver.name} (P${position})`)
            }
          } else {
            console.warn(`Driver not found in DB (finishing order): ${driverName}`)
          }
        }

        // Try to fetch fastest lap page for this race
        const flUrl = raceUrl.replace(/race-result$/, 'fastest-laps')
        try {
          const flRes = await fetch(flUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } })
          if (flRes.ok) {
            const flHtml = await flRes.text()
            const flDoc = new DOMParser().parseFromString(flHtml, 'text/html')
            const flTable = flDoc?.querySelector('table.resultsarchive-table') as any
            const flFirstRow = flTable?.querySelector('tbody tr') as any
            if (flFirstRow) {
              const tds = Array.from(flFirstRow.querySelectorAll('td')) as any[]
              if (tds.length >= 3) {
                const driverCell = tds[2]
                const flText = driverCell.textContent?.replace(/\n|\t/g, ' ') || ''
                const flName = flText.replace(/\s+/g, ' ').trim()
                const flNorm = normalize(flName)
                if (top10NormNames.has(flNorm)) {
                  const dbDriver = driverByNormName.get(flNorm)
                  if (dbDriver) {
                    const current = pointsByDriverId.get(dbDriver.id) || 0
                    pointsByDriverId.set(dbDriver.id, current + 1)
                    console.log(` +1 (FL) ${dbDriver.name}`)
                  }
                }
              }
            }
          }
        } catch (e) {
          console.warn('Failed to process fastest lap page:', e)
        }
      } catch (e) {
        console.warn('Race page processing error:', e)
      }
    }

    // Reset all driver points to 0, then apply totals
    console.log('[F1 2025] Resetting championship points to 0...')
    const { error: resetErr } = await supabase
      .from('drivers')
      .update({ championship_points: 0 })
      .neq('id', '00000000-0000-0000-0000-000000000000')
    if (resetErr) throw resetErr

    console.log(`[F1 2025] Applying totals to ${pointsByDriverId.size} drivers...`)
    let updated = 0
    for (const [driverId, total] of pointsByDriverId.entries()) {
      const { error: upErr } = await supabase
        .from('drivers')
        .update({ championship_points: total })
        .eq('id', driverId)
      if (!upErr) updated++
    }

    // Recalculate user prediction points and standings
    const { error: recalcError } = await supabase.rpc('recalculate_all_prediction_points')
    if (recalcError) console.warn('RPC recalc error:', recalcError.message)

    console.log(`[F1 2025] Done. Updated ${updated} drivers.`)
    return new Response(
      JSON.stringify({ success: true, updatedDrivers: updated }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    console.error('Error fetching official F1 results:', error)
    return new Response(
      JSON.stringify({ success: false, error: (error as Error).message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})