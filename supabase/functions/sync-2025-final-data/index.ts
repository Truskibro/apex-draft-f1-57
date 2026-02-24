import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Final 2025 F1 Championship standings (official)
const DRIVER_POINTS: Record<string, number> = {
  'Lando Norris': 423,
  'Max Verstappen': 421,
  'Oscar Piastri': 410,
  'George Russell': 319,
  'Charles Leclerc': 242,
  'Lewis Hamilton': 156,
  'Kimi Antonelli': 150,
  'Alexander Albon': 73,
  'Carlos Sainz': 64,
  'Fernando Alonso': 56,
  'Nico Hülkenberg': 51,
  'Isack Hadjar': 51,
  'Oliver Bearman': 41,
  'Liam Lawson': 38,
  'Esteban Ocon': 38,
  'Lance Stroll': 33,
  'Yuki Tsunoda': 33,
  'Pierre Gasly': 22,
  'Gabriel Bortoleto': 19,
  'Franco Colapinto': 0,
  'Jack Doohan': 0,
}

// Race winners for all 24 races
const RACE_WINNERS: Record<string, string> = {
  'Australian Grand Prix': 'Lando Norris',
  'Chinese Grand Prix': 'Oscar Piastri',
  'Japanese Grand Prix': 'Max Verstappen',
  'Bahrain Grand Prix': 'Oscar Piastri',
  'Saudi Arabian Grand Prix': 'Oscar Piastri',
  'Miami Grand Prix': 'Oscar Piastri',
  'Emilia Romagna Grand Prix': 'Max Verstappen',
  'Monaco Grand Prix': 'Lando Norris',
  'Spanish Grand Prix': 'Oscar Piastri',
  'Canadian Grand Prix': 'George Russell',
  'Austrian Grand Prix': 'Lando Norris',
  'British Grand Prix': 'Lando Norris',
  'Belgian Grand Prix': 'Oscar Piastri',
  'Hungarian Grand Prix': 'Lando Norris',
  'Dutch Grand Prix': 'Oscar Piastri',
  'Italian Grand Prix': 'Max Verstappen',
  'Azerbaijan Grand Prix': 'Max Verstappen',
  'Singapore Grand Prix': 'George Russell',
  'United States Grand Prix': 'Max Verstappen',
  'Mexico City Grand Prix': 'Lando Norris',
  'São Paulo Grand Prix': 'Lando Norris',
  'Las Vegas Grand Prix': 'Max Verstappen',
  'Qatar Grand Prix': 'Max Verstappen',
  'Abu Dhabi Grand Prix': 'Max Verstappen',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Update driver championship points
    let driversUpdated = 0
    for (const [name, points] of Object.entries(DRIVER_POINTS)) {
      const { error } = await supabase
        .from('drivers')
        .update({ championship_points: points })
        .eq('name', name)
      if (!error) driversUpdated++
      else console.warn(`Failed to update ${name}:`, error.message)
    }
    console.log(`Updated ${driversUpdated} drivers`)

    // Update all races to completed with winners
    let racesUpdated = 0
    for (const [raceName, winner] of Object.entries(RACE_WINNERS)) {
      const { error } = await supabase
        .from('races')
        .update({ status: 'completed', winner })
        .eq('name', raceName)
      if (!error) racesUpdated++
      else console.warn(`Failed to update race ${raceName}:`, error.message)
    }
    console.log(`Updated ${racesUpdated} races`)

    return new Response(
      JSON.stringify({ success: true, driversUpdated, racesUpdated }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ success: false, error: (error as Error).message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
