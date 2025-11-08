import { s3, type S3File } from "bun";

const s3file: S3File = s3.file("123.json");
await s3file.write("Hello World!");
