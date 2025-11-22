import { s3 } from "bun";
import { Buffer } from "node:buffer";
import { ClientResponse } from "../../lib/Response";
import { validateSession } from "../../lib/auth";
import { getFaceImagesByUserId } from "../../lib/db";

function guessMimeType(key?: string | null) {
  if (!key) return "image/png";
  const ext = key.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "gif":
      return "image/gif";
    case "webp":
      return "image/webp";
    default:
      return "image/png";
  }
}

async function readImageDataUrl(key?: string | null) {
  if (!key) return null;
  try {
    const file = s3.file(key);
    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    return `data:${guessMimeType(key)};base64,${base64}`;
  } catch (error) {
    console.error(`Failed to read face image ${key}`, error);
    return null;
  }
}

export async function listFaceImages(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return ClientResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1]!;
    const user = await validateSession(token);
    if (!user) {
      return ClientResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    const faces = await getFaceImagesByUserId(user.id);
    const payload = await Promise.all(
      faces.map(async (face) => ({
        id: face.id,
        is_primary: face.is_primary,
        match_count: face.match_count,
        uploaded_at: (face as any).uploaded_at ?? face.created_at ?? null,
        last_used_at: face.last_used_at ?? null,
        s3_key: face.s3_key,
        image_data: await readImageDataUrl(face.s3_key),
      })),
    );

    return ClientResponse.json({ faceImages: payload });
  } catch (error) {
    console.error("List face images error", error);
    return ClientResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
