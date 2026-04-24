// Cloudflare Stream helper — Direct Creator Upload + signed playback tokens.
//
// Required environment variables (production):
//   CLOUDFLARE_ACCOUNT_ID                 — 32-char account id
//   CLOUDFLARE_STREAM_API_TOKEN           — API token with "Stream: Edit"
//   CLOUDFLARE_STREAM_SIGNING_KEY_ID      — id returned by POST /stream/keys
//   CLOUDFLARE_STREAM_SIGNING_KEY_PEM     — RSA PRIVATE KEY PEM returned alongside
//   CLOUDFLARE_STREAM_CUSTOMER_SUBDOMAIN  — e.g. customer-abc123.cloudflarestream.com
//
// Docs: https://developers.cloudflare.com/stream/
import jwt from "jsonwebtoken";

function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env ${name}`);
  return v;
}

export function isStreamConfigured(): boolean {
  return Boolean(
    process.env.CLOUDFLARE_ACCOUNT_ID &&
      process.env.CLOUDFLARE_STREAM_API_TOKEN &&
      process.env.CLOUDFLARE_STREAM_SIGNING_KEY_ID &&
      process.env.CLOUDFLARE_STREAM_SIGNING_KEY_PEM &&
      process.env.CLOUDFLARE_STREAM_CUSTOMER_SUBDOMAIN,
  );
}

export function getCustomerSubdomain(): string {
  return required("CLOUDFLARE_STREAM_CUSTOMER_SUBDOMAIN");
}

/**
 * Request a one-time Direct Creator Upload URL that the browser posts the
 * video file to. The uid returned is the permanent Cloudflare Stream asset id
 * we store against the lesson.
 *
 * @param maxDurationSeconds hard ceiling on accepted video length
 * @param requireSignedURLs if true (recommended) the asset cannot be played
 *                          without a signed token after upload completes
 */
export async function createDirectUploadUrl(opts: {
  maxDurationSeconds?: number;
  requireSignedURLs?: boolean;
  creatorId?: string;
  name?: string;
}): Promise<{ uploadURL: string; uid: string }> {
  const accountId = required("CLOUDFLARE_ACCOUNT_ID");
  const token = required("CLOUDFLARE_STREAM_API_TOKEN");
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream/direct_upload`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        maxDurationSeconds: opts.maxDurationSeconds ?? 3600,
        requireSignedURLs: opts.requireSignedURLs ?? true,
        creator: opts.creatorId,
        meta: opts.name ? { name: opts.name } : undefined,
      }),
    },
  );
  const data = (await res.json()) as {
    success: boolean;
    errors?: Array<{ code: number; message: string }>;
    result?: { uploadURL: string; uid: string };
  };
  if (!res.ok || !data.success || !data.result) {
    const msg = data.errors?.[0]?.message ?? "Cloudflare Stream upload request failed";
    throw new Error(msg);
  }
  return { uploadURL: data.result.uploadURL, uid: data.result.uid };
}

/**
 * Sign a short-lived JWT for a given video uid. Grants playback until exp.
 * Use in iframe src: https://<subdomain>/<signedToken>/iframe
 */
export function signPlaybackToken(videoUid: string, ttlSeconds = 2 * 3600): string {
  const kid = required("CLOUDFLARE_STREAM_SIGNING_KEY_ID");
  // The PEM may be stored in env with literal \n escapes (Vercel UI often does that).
  const pem = required("CLOUDFLARE_STREAM_SIGNING_KEY_PEM").replace(/\\n/g, "\n");
  const now = Math.floor(Date.now() / 1000);
  return jwt.sign(
    {
      sub: videoUid,
      kid,
      exp: now + ttlSeconds,
      // no `downloadable` claim -> downloads disabled by default
    },
    pem,
    { algorithm: "RS256", header: { alg: "RS256", kid, typ: "JWT" } },
  );
}

/** Delete a Stream asset (called when a lesson with a Stream video is removed). */
export async function deleteStreamAsset(uid: string): Promise<void> {
  const accountId = required("CLOUDFLARE_ACCOUNT_ID");
  const token = required("CLOUDFLARE_STREAM_API_TOKEN");
  await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream/${uid}`,
    { method: "DELETE", headers: { Authorization: `Bearer ${token}` } },
  ).catch(() => {
    /* best-effort cleanup — don't fail the request */
  });
}
