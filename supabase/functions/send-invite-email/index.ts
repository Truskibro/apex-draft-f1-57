import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.0';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InviteEmailRequest {
  email: string;
  leagueId: string;
  leagueName: string;
  inviterName: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, leagueId, leagueName, inviterName }: InviteEmailRequest = await req.json();

    const inviteLink = `https://klpuiqqyfemqzljqttnq.supabase.co/league/${leagueId}`;

    const emailResponse = await resend.emails.send({
      from: "F1 Fantasy <onboarding@resend.dev>",
      to: [email],
      subject: `${inviterName} invited you to join ${leagueName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #E10600; margin-bottom: 20px;">🏎️ F1 Fantasy League Invitation</h1>
          
          <p style="font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
            <strong>${inviterName}</strong> has invited you to join their F1 Fantasy League: <strong>${leagueName}</strong>
          </p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px; color: #666;">
              Join the excitement of Formula 1 fantasy racing! Pick your drivers, score points, and compete with friends.
            </p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${inviteLink}" 
               style="background: #E10600; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Join League
            </a>
          </div>
          
          <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px;">
            <p style="font-size: 12px; color: #666; margin: 0;">
              Can't click the button? Copy and paste this link: <br>
              <a href="${inviteLink}" style="color: #E10600;">${inviteLink}</a>
            </p>
          </div>
        </div>
      `,
    });

    console.log("Invite email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending invite email:", error);
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