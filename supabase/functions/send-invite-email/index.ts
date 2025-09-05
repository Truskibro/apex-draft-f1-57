import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.0';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface InviteEmailRequest {
  leagueId: string;
  inviteEmail: string;
  leagueName: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get auth header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Get user from auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    const { leagueId, inviteEmail, leagueName }: InviteEmailRequest = await req.json();

    // Verify user owns the league
    const { data: league, error: leagueError } = await supabase
      .from('leagues')
      .select('owner_id')
      .eq('id', leagueId)
      .single();

    if (leagueError || !league || league.owner_id !== user.id) {
      return new Response(
        JSON.stringify({ error: 'League not found or access denied' }),
        { status: 403, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Get user's profile for the sender name
    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('id', user.id)
      .single();

    const senderName = profile?.display_name || 'A league organizer';
    const inviteLink = `${req.headers.get('origin') || 'https://your-app.com'}/join-league/${leagueId}`;

    const emailResponse = await resend.emails.send({
      from: "F1 Fantasy League <onboarding@resend.dev>",
      to: [inviteEmail],
      subject: `You're invited to join ${leagueName}!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1a1a1a; margin-bottom: 10px;">🏁 F1 Fantasy League</h1>
            <h2 style="color: #666; font-weight: normal;">You're Invited!</h2>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <p style="font-size: 16px; margin-bottom: 15px;">
              <strong>${senderName}</strong> has invited you to join their F1 Fantasy League:
            </p>
            <h3 style="color: #1a1a1a; margin: 0;">${leagueName}</h3>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${inviteLink}" 
               style="background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
              Join League
            </a>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="font-size: 14px; color: #666; margin-bottom: 10px;">
              Or copy and paste this link into your browser:
            </p>
            <p style="font-size: 12px; color: #888; word-break: break-all; background: #f3f4f6; padding: 10px; border-radius: 4px;">
              ${inviteLink}
            </p>
          </div>
          
          <div style="margin-top: 30px; font-size: 12px; color: #888; text-align: center;">
            <p>If you didn't expect this invitation, you can safely ignore this email.</p>
          </div>
        </div>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Invitation sent successfully" 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-invite-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);