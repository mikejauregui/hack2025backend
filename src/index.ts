import { serve } from "bun";
import index from "./index.html";
import { s3, type S3File } from "bun";

const server = serve({
  routes: {
    // Serve index.html for all unmatched routes.
    "/*": index,

    "/api/upload": {
      async POST(req) {
        // https://uploaded-thousands-input-toe.trycloudflare.com/api/upload
        const formdata = await req.formData();
        console.log("Received formdata:", formdata);
        // const name = formdata.get("name");
        const snapshot = formdata.get("snapshot");
        if (!snapshot) throw new Error("Must upload a snapshot.");
        // write snapshot to disk
        const randomId = Bun.randomUUIDv7();
        const fileName = `snapshot-${randomId}.png`;
        const s3file: S3File = s3.file(fileName);
        await s3file.write(snapshot);
        return Response.json({
          message: "File uploaded successfully",
          fileName,
        });
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
