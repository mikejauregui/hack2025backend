import { serve } from "bun";
import index from "./index.html";
import { s3, type S3File } from "bun";
import { getTransactions, insertTransaction } from "./lib/db";

const server = serve({
  routes: {
    // Serve index.html for all unmatched routes.
    "/*": index,

    "/api/upload": {
      async POST(req) {
        // https://uploaded-thousands-input-toe.trycloudflare.com/api/upload
        const formdata = await req.formData();
        const amount = formdata.get("amount");
        const currency = formdata.get("currency");
        const transcript = formdata.get("transcript");

        if (typeof amount !== "string" || typeof currency !== "string") {
          throw new Error("Amount and currency must be strings.");
        }

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

        const transaction = await insertTransaction({
          amount: parseInt(amount) * 100, // store in cents
          currency,
          store: 1,
          snapshot_id: randomId,
        });

        return Response.json({
          message: "File uploaded successfully",
          transaction,
        });
      },
    },

    "/api/transactions": {
      async GET(req) {
        const transactions = await getTransactions();
        return Response.json(transactions);
      },
    },

    "/api/hello": {
      async GET(req) {
        return Response.json({
          message: "Hello, world!",
          method: "GET",
        });
      },
      async PUT(req) {
        return Response.json({
          message: "Hello, world!",
          method: "PUT",
        });
      },
    },

    "/api/hello/:name": async (req) => {
      const name = req.params.name;
      return Response.json({
        message: `Hello, ${name}!`,
      });
    },
  },

  development: process.env.NODE_ENV !== "production" && {
    // Enable browser hot reloading in development
    hmr: true,

    // Echo console logs from the browser to the server
    console: true,
  },
});

console.log(`🚀 Server running at ${server.url}`);
