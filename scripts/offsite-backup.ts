// Copies backup files off the server, to DigitalOcean Spaces (design document §15.6), and deletes copies
// older than BACKUP_RETENTION_DAYS (30). Run by `ti backup` after each dump; does nothing until the
// DO_SPACES_* settings exist. DO_SPACES_BACKUP_BUCKET picks a separate (private) bucket; default: the
// uploads bucket, under backups/.
// Usage: npx tsx scripts/offsite-backup.ts FILE [FILE...]
import { createReadStream, statSync } from "node:fs";
import { basename } from "node:path";
import { DeleteObjectCommand, ListObjectsV2Command, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const { DO_SPACES_ENDPOINT: endpoint, DO_SPACES_KEY: key, DO_SPACES_SECRET: secret } = process.env;
const bucket = process.env.DO_SPACES_BACKUP_BUCKET || process.env.DO_SPACES_BUCKET;
const days = Number(process.env.BACKUP_RETENTION_DAYS) || 30;
const prefix = "backups/";

async function main() {
  const files = process.argv.slice(2);
  if (!endpoint || !key || !secret || !bucket) {
    console.log("off-site copy skipped: DO_SPACES_* not set");
    return;
  }
  const s3 = new S3Client({ endpoint, region: process.env.DO_SPACES_REGION || "us-east-1", forcePathStyle: false, credentials: { accessKeyId: key, secretAccessKey: secret } });
  for (const file of files) {
    await s3.send(
      new PutObjectCommand({ Bucket: bucket, Key: prefix + basename(file), Body: createReadStream(file), ContentLength: statSync(file).size, ACL: "private", ContentType: "application/octet-stream" }),
    );
    console.log(`off-site: ${basename(file)} -> ${bucket}/${prefix}`);
  }
  const cutoff = Date.now() - days * 86_400_000;
  let token: string | undefined;
  let removed = 0;
  do {
    const page = await s3.send(new ListObjectsV2Command({ Bucket: bucket, Prefix: prefix, ContinuationToken: token }));
    for (const o of page.Contents ?? []) {
      if (o.Key && o.LastModified && o.LastModified.getTime() < cutoff) {
        await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: o.Key }));
        removed++;
      }
    }
    token = page.IsTruncated ? page.NextContinuationToken : undefined;
  } while (token);
  if (removed) console.log(`off-site: removed ${removed} copies older than ${days} days`);
}

main().catch((error) => {
  console.error("off-site copy failed:", (error as Error).message);
  process.exit(1);
});
