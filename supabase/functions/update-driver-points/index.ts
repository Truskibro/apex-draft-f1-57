import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// F1 championship points system
const F1_POINTS_SYSTEM: { [key: number]: number } = {
  1: 25,  // Winner
  2: 18,  // 2nd place
  3: 15,  // 3rd place
  4: 12,  // 4th place
  5: 10,  // 5th place
  6: 8,   // 6th place
  7: 6,   // 7th place
  8: 4,   // 8th place
  9: 2,   // 9th place
  10: 1   // 10th place
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

    console.log('Starting automatic driver points update...')

    // Fetch latest completed races that need points updates
    const { data: completedRaces, error: racesError } = await supabaseClient
      .from('races')
      .select('*')
      .eq('status', 'completed')
      .not('winner', 'is', null)

    if (racesError) {
      throw new Error(`Error fetching races: ${racesError.message}`)
    }

    if (!completedRaces || completedRaces.length === 0) {
      console.log('No completed races found with results')
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No completed races to process',
          updatedDrivers: 0
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    // Get all drivers from the database
    const { data: drivers, error: driversError } = await supabaseClient
      .from('drivers')
      .select('id, name')

    if (driversError) {
      throw driversError
    }

    console.log(`Found ${drivers?.length} drivers in database`)

    // Helper to normalize names (handles accents, casing, extra spaces)
    const normalize = (s: string | null): string =>
      (s || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim()
        .replace(/\s+/g, ' ')

    // Map of normalized driver name -> driver record
    const driverByNormName = new Map<string, { id: string; name: string }>()
    drivers?.forEach((d) => driverByNormName.set(normalize(d.name), d))

    // Reset all driver points to 0 before recalculating
    console.log('Resetting all driver points to 0...')
    const { error: resetError } = await supabaseClient
      .from('drivers')
      .update({ championship_points: 0 })
      .neq('id', '00000000-0000-0000-0000-000000000000') // Update all drivers

    if (resetError) {
      console.error('Error resetting driver points:', resetError)
      throw resetError
    }

    // Track total points per driver across all races
    const driverPointsMap = new Map<string, number>()
    
    // Initialize all drivers with 0 points
    drivers?.forEach(driver => {
      driverPointsMap.set(driver.id, 0)
    })

    for (const race of completedRaces) {
      console.log(`Processing race: ${race.name}`)
      
      // Create array of race positions from the race data
      const racePositions = [
        { driver: race.winner, position: 1 },
        { driver: race.second_place, position: 2 },
        { driver: race.third_place, position: 3 },
        { driver: race.fourth_place, position: 4 },
        { driver: race.fifth_place, position: 5 },
        { driver: race.sixth_place, position: 6 },
        { driver: race.seventh_place, position: 7 },
        { driver: race.eighth_place, position: 8 },
        { driver: race.ninth_place, position: 9 },
        { driver: race.tenth_place, position: 10 }
      ].filter(result => result.driver) // Filter out null/undefined positions

      // Award points based on finishing positions
      const top10NormNames = new Set<string>()
      for (const result of racePositions) {
        const norm = normalize(result.driver as string)
        if (norm) top10NormNames.add(norm)
        const driver = driverByNormName.get(norm)
        if (driver) {
          const points = F1_POINTS_SYSTEM[result.position] || 0
          if (points > 0) {
            // Add points to the driver's total in the map
            const currentPoints = driverPointsMap.get(driver.id) || 0
            driverPointsMap.set(driver.id, currentPoints + points)
            console.log(`${driver.name}: +${points} points for P${result.position} in ${race.name}`)
          }
        } else {
          console.warn(`Driver not found in database: ${result.driver}`)
        }
      }

      // Award fastest lap point (1) only if driver finished in top 10
      if (race.fastest_lap_driver) {
        const flNorm = normalize(race.fastest_lap_driver)
        if (top10NormNames.has(flNorm)) {
          const flDriver = driverByNormName.get(flNorm)
          if (flDriver) {
            const current = driverPointsMap.get(flDriver.id) || 0
            driverPointsMap.set(flDriver.id, current + 1)
            console.log(`${flDriver.name}: +1 point for Fastest Lap in ${race.name}`)
          }
        }
      }
    }

    // Update driver points in database with final totals
    let driversUpdated = 0
    for (const [driverId, totalPoints] of driverPointsMap.entries()) {
      if (totalPoints > 0) {
        const driver = drivers?.find(d => d.id === driverId)
        const { error: updateError } = await supabaseClient
          .from('drivers')
          .update({ championship_points: totalPoints })
          .eq('id', driverId)

        if (updateError) {
          console.error(`Error updating driver ${driver?.name}:`, updateError)
        } else {
          console.log(`✓ Updated ${driver?.name}: ${totalPoints} total points`)
          driversUpdated++
        }
      }
    }

    if (driversUpdated > 0) {

      // Recalculate all prediction points after driver updates
      console.log('Recalculating user prediction points...')
      const { error: recalcError } = await supabaseClient.rpc('recalculate_all_prediction_points')
      if (recalcError) {
        console.error('Error recalculating prediction points:', recalcError)
      } else {
        console.log('✓ User prediction points recalculated')
      }

      console.log(`Updated ${driversUpdated} drivers with championship points`)
    }

    // Log the update
    console.log('Driver points update completed successfully')

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Updated ${driversUpdated} drivers`,
        updatedDrivers: driversUpdated
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error updating driver points:', error)
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