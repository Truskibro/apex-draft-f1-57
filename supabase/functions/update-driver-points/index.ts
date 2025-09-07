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

    console.log('Starting driver points update...')

    // Points system for F1 (based on finishing position)
    const pointsSystem: { [key: number]: number } = {
      1: 25,  // 1st place
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

    // Mock race results data - in a real system this would come from an external API
    const raceResults = [
      {
        raceName: 'Italian Grand Prix',
        results: [
          { driver: 'Max Verstappen', position: 1 },
          { driver: 'Lando Norris', position: 2 },
          { driver: 'Charles Leclerc', position: 3 },
          { driver: 'Lewis Hamilton', position: 4 },
          { driver: 'George Russell', position: 5 },
          { driver: 'Carlos Sainz', position: 6 },
          { driver: 'Sergio Pérez', position: 7 },
          { driver: 'Fernando Alonso', position: 8 },
          { driver: 'Lance Stroll', position: 9 },
          { driver: 'Yuki Tsunoda', position: 10 }
        ]
      }
    ]

    // Get all drivers from the database
    const { data: drivers, error: driversError } = await supabaseClient
      .from('drivers')
      .select('id, name, championship_points')

    if (driversError) {
      throw driversError
    }

    console.log(`Found ${drivers?.length} drivers in database`)

    // Calculate points for each driver based on race results
    const pointsUpdates = []

    for (const raceResult of raceResults) {
      console.log(`Processing race: ${raceResult.raceName}`)
      
      for (const result of raceResult.results) {
        const driver = drivers?.find(d => d.name === result.driver)
        if (driver) {
          const points = pointsSystem[result.position] || 0
          const newTotal = (driver.championship_points || 0) + points
          
          pointsUpdates.push({
            id: driver.id,
            championship_points: newTotal
          })
          
          console.log(`${driver.name}: +${points} points (total: ${newTotal})`)
        }
      }
    }

    // Update driver points in batch
    if (pointsUpdates.length > 0) {
      for (const update of pointsUpdates) {
        const { error: updateError } = await supabaseClient
          .from('drivers')
          .update({ championship_points: update.championship_points })
          .eq('id', update.id)

        if (updateError) {
          console.error(`Error updating driver ${update.id}:`, updateError)
        }
      }

      console.log(`Updated ${pointsUpdates.length} drivers successfully`)
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