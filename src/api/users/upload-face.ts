import { ClientResponse } from "../../lib/Response";
import { validateSession } from "../../lib/auth";
import { createFaceImage } from "../../lib/db";
import { indexarRostro } from "../../faces";
import { s3, type BunRequest, type S3File } from "bun";

export async function uploadFace(req: BunRequest) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
        return ClientResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const user = await validateSession(token);
    if (!user) {
        return ClientResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    const formdata = await req.formData();
    const face = formdata.get("face");
    const isPrimary = formdata.get("is_primary") === "true";

    if (!face) {
        return ClientResponse.json({ error: "No face image provided" }, { status: 400 });
    }

    // Upload to S3
    const randomId = Bun.randomUUIDv7();
    const fileName = `face-${user.id}-${randomId}.png`; // Unique name
    const s3file: S3File = s3.file(fileName);
    
    // Bun S3 write expects string, ArrayBuffer, or Blob. File from FormData is Blob-like.
    await s3file.write(face);

    // Index in Rekognition
    const faceRecords = await indexarRostro(fileName, user.id);

    if (!faceRecords || faceRecords.length === 0) {
        // Failed to detect face, maybe delete from S3?
        return ClientResponse.json({ error: "No face detected in image" }, { status: 400 });
    }

    const rekognitionImageId = faceRecords[0].Face?.FaceId;

    // Save to DB
    const faceImage = await createFaceImage({
        user_id: user.id,
        s3_key: fileName,
        rekognition_image_id: rekognitionImageId,
        is_primary: isPrimary,
        status: "active"
    });

    return ClientResponse.json({
        message: "Face uploaded successfully",
        face_image: faceImage
    });

  } catch (error) {
    console.error("Upload face error:", error);
    return ClientResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
