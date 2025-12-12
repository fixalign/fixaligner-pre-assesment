import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

// GET /api/patients/[id] - Get single patient
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  const { params } = context;
  const resolvedParams = await Promise.resolve(params);
  const id = resolvedParams.id;
  try {
    const { data, error } = await supabase
      .from("patients")
      .select(
        `id, name, expo_token, video_url, is_eligible, estimated_steps, notes, assessed_at, created_at, updated_at`
      )
      .eq("id", id)
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Patient not found" }, { status: 404 });
  }
}

// PATCH /api/patients/[id] - Update patient assessment
export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  const { params } = context;
  const resolvedParams = await Promise.resolve(params);
  const id = resolvedParams.id;
  try {
    const body = await request.json();

    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (body.is_eligible !== undefined) {
      updateData.is_eligible = body.is_eligible;
    }
    if (body.estimated_steps !== undefined) {
      updateData.estimated_steps = body.estimated_steps;
    }
    if (body.notes !== undefined) {
      updateData.notes = body.notes;
    }
    if (body.assessed_at !== undefined) {
      updateData.assessed_at = body.assessed_at;
    }

    // Update patient and return non-sensitive columns to client
    const { data, error } = await supabase
      .from("patients")
      .update(updateData)
      .eq("id", id)
      .select(
        `id, name, expo_token, video_url, is_eligible, estimated_steps, notes, assessed_at, created_at, updated_at`
      )
      .single();

    // If an assessed_at timestamp was provided, post to the webhook
    if (body.assessed_at) {
      try {
        // Fetch sensitive fields separately for webhook delivery
        const { data: sensitiveData, error: sensitiveError } = await supabase
          .from("patients")
          .select(
            "email, phone, expo_token, video_url, name, is_eligible, estimated_steps, notes, assessed_at"
          )
          .eq("id", id)
          .single();

        if (sensitiveError) {
          console.error(
            "Failed to fetch sensitive fields for webhook",
            sensitiveError
          );
        } else {
          const payload = {
            id: id,
            name: sensitiveData.name,
            email: sensitiveData.email || null,
            phone: sensitiveData.phone || null,
            expo_token: sensitiveData.expo_token || null,
            video_url: sensitiveData.video_url || null,
            estimated_steps: sensitiveData.estimated_steps || null,
            is_eligible: sensitiveData.is_eligible,
            notes: sensitiveData.notes || null,
            assessed_at: sensitiveData.assessed_at,
          };

          // Send to webhook via server route to use configured URL
          const webhookUrl = process.env.NEXT_PUBLIC_WEBHOOK_URL;
          if (webhookUrl) {
            const res = await fetch(webhookUrl, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            });

            if (!res.ok) {
              console.error("Failed to deliver webhook", await res.text());
            }
          } else {
            console.error("Webhook URL is not configured");
          }
        }
      } catch (err) {
        console.error("Webhook delivery error", err);
      }
    }

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update patient" },
      { status: 500 }
    );
  }
}

// DELETE /api/patients/[id] - Delete patient
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  const { params } = context;
  const resolvedParams = await Promise.resolve(params);
  const id = resolvedParams.id;
  try {
    const { error } = await supabase.from("patients").delete().eq("id", id);

    if (error) throw error;

    return NextResponse.json({ message: "Patient deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete patient" },
      { status: 500 }
    );
  }
}
