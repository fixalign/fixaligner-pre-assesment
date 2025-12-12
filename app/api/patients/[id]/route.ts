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
      .select("*")
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

    const { data, error } = await supabase
      .from("patients")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

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
