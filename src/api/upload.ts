import { identificarUsuario } from "../faces";
import { completePayment } from "../lib/paymentws";
import { ClientResponse } from "src/lib/Response";
import { s3, type BunRequest, type S3File } from "bun";
import { getClientById, getGrantById, insertTransaction } from "../lib/db";
import { makePayment } from "src/payment-partial";

export async function upload(req: BunRequest) {
  // https://uploaded-thousands-input-toe.trycloudflare.com/api/upload
  const formdata = await req.formData();
  const amount = formdata.get("amount");
  const currency = formdata.get("currency");
  const transcript = formdata.get("transcript");

  if (typeof amount !== "string" || typeof currency !== "string") {
    throw new Error("Amount and currency must be strings.");
  }
  const currentAmount = parseFloat(amount) * 100;

  console.log("Received formdata:", formdata);
  // const name = formdata.get("name");
  const snapshot = formdata.get("snapshot");
  if (!snapshot) throw new Error("Must upload a snapshot.");
  // write snapshot to disk
  const randomId = Bun.randomUUIDv7();

  const fileName = `snapshot-${randomId}.png`;
  const s3file: S3File = s3.file(fileName);
  await s3file.write(snapshot);

  const voice = formdata.get("voice");
  if (voice) {
    const voiceFileName = `voice-${randomId}.wav`;
    const s3voicefile: S3File = s3.file(voiceFileName);
    await s3voicefile.write(voice);
  }

  const userIdDetectado = await identificarUsuario(fileName);

  console.log("ID de usuario identificado:", userIdDetectado);

  if (!userIdDetectado) {
    return ClientResponse.json(
      {
        message: "File uploaded, but no user identified",
        // transaction,
      },
      { status: 400 }
    );
  }

  const client = await getClientById(userIdDetectado);

  if (!client) {
    return ClientResponse.json(
      {
        message: "User identified but not found in database",
        // transaction,
        userIdDetectado,
      },
      { status: 404 }
    );
  }

  // payment
  try {
    await makePayment(currentAmount);
    console.log("Payment completed successfully.");
  } catch (e) {
    console.warn("Error completing payment:", e);
  }

  // save transaction
  const transaction = await insertTransaction({
    amount: currentAmount, // store in cents
    currency,
    store: 1,
    snapshot_id: randomId,
    transcript: typeof transcript === "string" ? transcript : null,
  });

  return ClientResponse.json({
    message: "File uploaded successfully",
    transaction,
    userIdDetectado,
    // payment,
  });
}
