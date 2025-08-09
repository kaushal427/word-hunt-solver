import { NextRequest } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("image");
    if (!file || !(file instanceof File)) {
      return new Response(JSON.stringify({ error: "No image uploaded" }), { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const mime = file.type || "image/png";

    return Response.json({ dataUrl: `data:${mime};base64,${base64}` });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message ?? "Unexpected error" }), { status: 500 });
  }
}


