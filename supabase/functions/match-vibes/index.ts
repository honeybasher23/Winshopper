import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

// Required for React to talk to the Edge Function without browser errors
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
    // 1. Get the vibes from the React app
    const { vibes } = await req.json()
    const vibeString = vibes.join(", ")

    // 2. Ask Gemini to translate the vibes into a vector
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${GEMINI_API_KEY}`

    const geminiResponse = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "models/text-embedding-004",
        content: {
          parts: [{ text: `A premium product fitting these aesthetics: ${vibeString}` }]
        },
        // MAGIC: Tell Gemini to shrink the math to fit our existing 384-dimension database!
        outputDimensionality: 384 
      })
    })

    const embeddingData = await geminiResponse.json()
    
    if (embeddingData.error) {
      throw new Error(`Gemini API Error: ${embeddingData.error.message}`)
    }

    const vector = embeddingData.embedding.values

    // 3. Connect to your Supabase Database
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    // 4. Run the vector math function to find the closest products
    const { data: products, error } = await supabase.rpc('get_matching_products', {
      query_embedding: vector,
      match_limit: 10 // Get the top 10 most relevant cards
    })

    if (error) throw error

    // 5. Send the perfect products back to React
    return new Response(JSON.stringify(products), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})