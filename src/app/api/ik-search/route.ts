import { NextRequest, NextResponse } from "next/server"
import {
    searchIndianKanoon,
    getDocumentMetadata,
    getTopCasesWithMetadata
} from "@/src/lib/indian-law"

// export async function GET() {
//     try {
//         const results = await searchIndianKanoon(
//             "anticipatory bail Section 318 BNS"
//         )

//         const enriched = await Promise.all(
//             results.map(async (item: any) => {
//                 const meta = await getDocumentMetadata(item.docid)

//                 return {
//                     ...item,
//                     metadata: meta
//                 }
//             })
//         )

//         return NextResponse.json({
//             success: true,
//             results: enriched
//         })
//     } catch (error) {
//         return NextResponse.json({
//             success: false,
//             error
//         })
//     }
// }

export async function GET(req: NextRequest) {
    try {
        const searchParams = req.nextUrl.searchParams;

        const query =
            searchParams.get('query') ||
            'anticipatory bail Section 318 BNS';

        const results = await getTopCasesWithMetadata(query);

        return NextResponse.json({
            success: true,
            results,
        });
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            {
                success: false,
                error: 'Failed to search Indian Kanoon',
            },
            { status: 500 }
        );
    }
}