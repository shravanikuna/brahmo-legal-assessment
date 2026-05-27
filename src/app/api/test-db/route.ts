import { NextResponse } from "next/server";
import { supabase } from "@/src/lib/supabase";

export async function GET() {

    const { data, error } = await supabase
        .from("legal_templates")
        .select("*");

    return NextResponse.json({
        success: true,
        data,
        error
    });
}