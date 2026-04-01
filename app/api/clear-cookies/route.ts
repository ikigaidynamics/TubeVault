import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const cookieStore = cookies();
  const all = cookieStore.getAll();
  let cleared = 0;

  // Delete ALL cookies — nuclear option
  for (const cookie of all) {
    try {
      cookieStore.delete(cookie.name);
      cleared++;
    } catch {}
  }

  return NextResponse.json({
    cleared,
    total: all.length,
    names: all.map((c) => c.name),
    message: "ALL cookies cleared. Go to /login now.",
  });
}
