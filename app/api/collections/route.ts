import { NextResponse } from "next/server";
import { getCachedCollections } from "@/lib/collections-cache";

export async function GET() {
  try {
    const collections = await getCachedCollections();
    return NextResponse.json(collections, {
      headers: {
        "Cache-Control": "public, max-age=300, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "warming", message: "Loading channels for the first time..." },
      { status: 503, headers: { "Retry-After": "5" } }
    );
  }
}
