import { NextResponse } from "next/server";

import { supabase } from "@/src/lib/supabase";

import { legalTemplates } from "@/src/lib/templates";

export async function GET() {

    const { data, error } = await supabase
        .from("legal_templates")
        .insert(legalTemplates)
        .select();

    return NextResponse.json({
        success: true,
        data,
        error
    });
}