import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('Starting race results fetch...')

    // Get the latest race session from OpenF1 API
    const latestSessionResponse = await fetch('https://api.openf1.org/v1/sessions?session_type=Race&year=2024', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    })

    if (!latestSessionResponse.ok) {
      throw new Error(`Failed to fetch sessions: ${latestSessionResponse.statusText}`)
    }

    const sessions = await latestSessionResponse.json()
    console.log(`Found ${sessions.length} race sessions for 2024`)

    // Get the most recent session that has ended
    const now = new Date()
    const completedSessions = sessions.filter((session: any) => 
      new Date(session.date_end) < now
    ).sort((a: any, b: any) => 
      new Date(b.date_end).getTime() - new Date(a.date_end).getTime()
    )

    if (completedSessions.length === 0) {
      console.log('No completed race sessions found')
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No completed races to process',
          updatedRaces: 0
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    let racesUpdated = 0

    // Process the most recent completed race
    for (const session of completedSessions.slice(0, 3)) { // Process last 3 races
      console.log(`Processing session: ${session.session_name} at ${session.location}`)

      // Get session results
      const resultsResponse = await fetch(`https://api.openf1.org/v1/session_result?session_key=${session.session_key}`)
      
      if (!resultsResponse.ok) {
        console.warn(`Failed to fetch results for session ${session.session_key}`)
        continue
      }

      const results = await resultsResponse.json()
      
      if (!results || results.length === 0) {
        console.warn(`No results found for session ${session.session_key}`)
        continue
      }

      // Sort results by position
      results.sort((a: any, b: any) => a.position - b.position)

      // Get driver information for this session
      const driversResponse = await fetch(`https://api.openf1.org/v1/drivers?session_key=${session.session_key}`)
      const driversData = await driversResponse.json()

      // Create driver lookup map
      const driverMap = new Map()
      driversData.forEach((driver: any) => {
        driverMap.set(driver.driver_number, driver.full_name || driver.broadcast_name)
      })

      // Extract race results
      const raceResult = {
        winner: null as string | null,
        second_place: null as string | null,
        third_place: null as string | null,
        fourth_place: null as string | null,
        fifth_place: null as string | null,
        sixth_place: null as string | null,
        seventh_place: null as string | null,
        eighth_place: null as string | null,
        ninth_place: null as string | null,
        tenth_place: null as string | null,
        dnf_drivers: [] as string[]
      }

      // Process top 10 positions
      for (let i = 0; i < Math.min(results.length, 10); i++) {
        const result = results[i]
        const driverName = driverMap.get(result.driver_number)
        
        if (driverName) {
          switch (i + 1) {
            case 1: raceResult.winner = driverName; break
            case 2: raceResult.second_place = driverName; break
            case 3: raceResult.third_place = driverName; break
            case 4: raceResult.fourth_place = driverName; break
            case 5: raceResult.fifth_place = driverName; break
            case 6: raceResult.sixth_place = driverName; break
            case 7: raceResult.seventh_place = driverName; break
            case 8: raceResult.eighth_place = driverName; break
            case 9: raceResult.ninth_place = driverName; break
            case 10: raceResult.tenth_place = driverName; break
          }
        }
      }

      // Collect DNF drivers
      raceResult.dnf_drivers = results
        .filter((result: any) => result.dnf)
        .map((result: any) => driverMap.get(result.driver_number))
        .filter((name: string) => name)

      // Find corresponding race in database
      const { data: dbRaces, error: raceError } = await supabaseClient
        .from('races')
        .select('*')
        .ilike('location', `%${session.location}%`)
        .eq('status', 'upcoming')

      if (raceError) {
        console.error('Error fetching races from database:', raceError)
        continue
      }

      if (dbRaces && dbRaces.length > 0) {
        const race = dbRaces[0]
        console.log(`Updating race: ${race.name}`)

        // Update race with results
        const { error: updateError } = await supabaseClient
          .from('races')
          .update({
            ...raceResult,
            status: 'completed',
            updated_at: new Date().toISOString()
          })
          .eq('id', race.id)

        if (updateError) {
          console.error(`Error updating race ${race.name}:`, updateError)
        } else {
          console.log(`✓ Updated race: ${race.name} with winner: ${raceResult.winner}`)
          racesUpdated++

          // Trigger driver points update
          console.log('Triggering driver points update...')
          const pointsResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/update-driver-points`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ trigger: 'race_results_update' })
          })

          if (!pointsResponse.ok) {
            console.error('Failed to trigger driver points update')
          } else {
            console.log('✓ Driver points update triggered')
          }
        }
      } else {
        console.warn(`No matching race found in database for: ${session.location}`)
      }
    }

    console.log(`Race results fetch completed. Updated ${racesUpdated} races.`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Processed race results and updated ${racesUpdated} races`,
        updatedRaces: racesUpdated
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error fetching race results:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})