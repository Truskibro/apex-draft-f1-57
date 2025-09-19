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
      .select('id, name, championship_points')

    if (driversError) {
      throw driversError
    }

    console.log(`Found ${drivers?.length} drivers in database`)

    // Process each completed race
    const pointsUpdates = []
    let totalPointsAwarded = 0

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
      for (const result of racePositions) {
        const driver = drivers?.find(d => d.name === result.driver)
        if (driver) {
          const points = F1_POINTS_SYSTEM[result.position] || 0
          if (points > 0) {
            const existingDriver = pointsUpdates.find(u => u.id === driver.id)
            if (existingDriver) {
              existingDriver.points += points
            } else {
              pointsUpdates.push({
                id: driver.id,
                name: driver.name,
                points: points,
                currentTotal: driver.championship_points || 0
              })
            }
            totalPointsAwarded += points
            console.log(`${driver.name}: +${points} points for P${result.position} in ${race.name}`)
          }
        } else {
          console.warn(`Driver not found in database: ${result.driver}`)
        }
      }
    }

    // Update driver points in database
    if (pointsUpdates.length > 0) {
      for (const update of pointsUpdates) {
        const newTotal = update.currentTotal + update.points
        
        const { error: updateError } = await supabaseClient
          .from('drivers')
          .update({ championship_points: newTotal })
          .eq('id', update.id)

        if (updateError) {
          console.error(`Error updating driver ${update.name}:`, updateError)
        } else {
          console.log(`✓ Updated ${update.name}: ${update.currentTotal} + ${update.points} = ${newTotal} points`)
        }
      }

      // Recalculate all prediction points after driver updates
      console.log('Recalculating user prediction points...')
      const { error: recalcError } = await supabaseClient.rpc('recalculate_all_prediction_points')
      if (recalcError) {
        console.error('Error recalculating prediction points:', recalcError)
      } else {
        console.log('✓ User prediction points recalculated')
      }

      console.log(`Updated ${pointsUpdates.length} drivers with ${totalPointsAwarded} total points awarded`)
    }

    // Log the update
    console.log('Driver points update completed successfully')

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Updated ${pointsUpdates.length} drivers`,
        updatedDrivers: pointsUpdates.length
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