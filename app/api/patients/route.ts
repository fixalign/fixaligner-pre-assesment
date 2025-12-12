import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

// GET /api/patients - Get all patients
export async function GET() {
  try {
    const { data, error } = await supabase
      .from("patients")
      .select(
        `id, name, expo_token, video_url, is_eligible, estimated_steps, notes, assessed_at, created_at, updated_at`
      )
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch patients" },
      { status: 500 }
    );
  }
}

// POST /api/patients - Create new patient
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { data, error } = await supabase
      .from("patients")
      .insert([
        {
          name: body.name,
          email: body.email || null,
          phone: body.phone || null,
          expo_token: body.expo_token || null,
          video_url: body.video_url || null,
        },
      ])
      .select(
        `id, name, expo_token, video_url, is_eligible, estimated_steps, notes, assessed_at, created_at, updated_at`
      )
      .single();

    if (error) throw error;

    // If client provided assessed_at in body (pre-assessment submitted), send webhook
    if (body.assessed_at) {
      try {
        const payload = {
          id: data.id,
          name: data.name,
          email: body.email || null,
          phone: body.phone || null,
          expo_token: data.expo_token || null,
          video_url: data.video_url || null,
          estimated_steps: data.estimated_steps || null,
          is_eligible: data.is_eligible,
          notes: data.notes || null,
          assessed_at: data.assessed_at,
        };

        const webhookUrl = process.env.NEXT_PUBLIC_WEBHOOK_URL;
        if (webhookUrl) {
          const res = await fetch(webhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

          if (!res.ok) {
            console.error(
              "Failed to deliver webhook from POST /api/patients",
              await res.text()
            );
          }
        } else {
          console.error("Webhook URL is not configured");
        }
      } catch (err) {
        console.error("Webhook delivery error from POST /api/patients", err);
      }
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create patient" },
      { status: 500 }
    );
  }
}
