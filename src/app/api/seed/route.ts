
import { NextResponse } from "next/server";

import { supabase } from "@/src/lib/supabase";

import { knowledgeNodes } from "@/src/data/seedKnowledge";

export async function GET() {

    const { data, error } = await supabase
        .from("knowledge_nodes")
        .insert(knowledgeNodes)
        .select();

    return NextResponse.json({
        success: true,
        data,
        error
    });
}