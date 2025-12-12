import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

// GET /api/patients - Get all patients
export async function GET() {
  try {
    const { data, error } = await supabase
      .from("patients")
      .select("*")
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
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create patient" },
      { status: 500 }
    );
  }
}
