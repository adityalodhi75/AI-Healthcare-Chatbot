import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface AlertRequest {
  region?: string;
  severity?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { region, severity }: AlertRequest = await req.json();

    let query = supabase.from("health_alerts").select("*").eq("is_active", true);

    if (severity) {
      query = query.eq("severity", severity);
    }

    const { data: alerts, error } = await query;

    if (error) throw error;

    let filteredAlerts = alerts || [];

    if (region) {
      filteredAlerts = filteredAlerts.filter(alert =>
        alert.regions_affected.includes(region) || alert.regions_affected.includes("Global")
      );
    }

    const epidemicQuery = supabase
      .from("epidemic_data")
      .select("*")
      .order("date_reported", { ascending: false })
      .limit(10);

    const { data: epidemicData } = await epidemicQuery;

    return new Response(
      JSON.stringify({
        alerts: filteredAlerts,
        epidemicData: epidemicData || [],
        totalAlerts: filteredAlerts.length,
        timestamp: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch alerts" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
