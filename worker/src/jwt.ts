/**
 * Supabase JWT verification using WebCrypto.
 *
 * Newer Supabase projects sign access tokens with asymmetric keys (ES256/RS256)
 * and expose the public keys at /auth/v1/.well-known/jwks.json; legacy projects
 * use HS256 with the shared JWT secret. Both are supported.
 */

import type { Env } from "./types";

interface JwtClaims {
  sub?: string;
  email?: string;
  exp?: number;
  aud?: string | string[];
  role?: string;
  [k: string]: unknown;
}

const enc = new TextEncoder();

function b64urlToBytes(input: string): Uint8Array {
  const pad = input.length % 4 === 0 ? "" : "=".repeat(4 - (input.length % 4));
  const b64 = (input + pad).replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function b64urlToString(input: string): string {
  return new TextDecoder().decode(b64urlToBytes(input));
}

async function hmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"],
  );
}

let jwksCache: { at: number; keys: any[] } | null = null;

async function fetchJwks(env: Env): Promise<any[]> {
  const now = Date.now();
  if (jwksCache && now - jwksCache.at < 600_000) return jwksCache.keys;
  try {
    const res = await fetch(`${env.SUPABASE_URL}/auth/v1/.well-known/jwks.json`, {
      headers: env.SUPABASE_ANON_KEY
        ? { apikey: env.SUPABASE_ANON_KEY }
        : undefined,
    });
    if (!res.ok) return [];
    const data = (await res.json()) as { keys?: any[] };
    jwksCache = { at: now, keys: data.keys ?? [] };
    return jwksCache.keys;
  } catch {
    return [];
  }
}

async function verifyWithJwks(
  header: any,
  signingInput: string,
  signature: Uint8Array,
  env: Env,
): Promise<boolean> {
  const keys = await fetchJwks(env);
  for (const jwk of keys) {
    if (jwk.kid && header.kid && jwk.kid !== header.kid) continue;
    try {
      const key = await crypto.subtle.importKey(
        "jwk",
        jwk,
        { name: jwk.alg?.startsWith("ES") ? "ECDSA" : "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
        false,
        ["verify"],
      );
      const alg =
        jwk.alg === "ES256"
          ? { name: "ECDSA", hash: "SHA-256" }
          : { name: "RSASSA-PKCS1-v1_5" };
      const ok = await crypto.subtle.verify(alg as any, key, signature, enc.encode(signingInput));
      if (ok) return true;
    } catch {
      // try the next key
    }
  }
  return false;
}

export async function verifySupabaseJwt(token: string, env: Env): Promise<JwtClaims | null> {
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  let header: any;
  let claims: JwtClaims;
  try {
    header = JSON.parse(b64urlToString(parts[0]));
    claims = JSON.parse(b64urlToString(parts[1]));
  } catch {
    return null;
  }

  const signingInput = `${parts[0]}.${parts[1]}`;
  const signature = b64urlToBytes(parts[2]);

  let valid = false;
  if (header.alg === "HS256") {
    // Legacy shared-secret projects. Without the secret we cannot verify, so we
    // fall back to an authoritative check against Supabase itself (below).
    if (env.SUPABASE_JWT_SECRET) {
      const key = await hmacKey(env.SUPABASE_JWT_SECRET);
      valid = await crypto.subtle.verify("HMAC", key, signature, enc.encode(signingInput));
    }
  } else if (header.alg === "ES256" || header.alg === "RS256") {
    valid = await verifyWithJwks(header, signingInput, signature, env);
  }

  if (!valid) {
    valid = await verifyViaSupabase(token, env);
  }
  if (!valid) return null;

  if (typeof claims.exp === "number" && claims.exp * 1000 < Date.now()) return null;
  return claims;
}

/**
 * Authoritative fallback: ask Supabase who this token belongs to. Slightly slower
 * but always correct, and it works no matter how the project signs tokens.
 */
async function verifyViaSupabase(token: string, env: Env): Promise<boolean> {
  if (!env.SUPABASE_ANON_KEY && !env.SUPABASE_SERVICE_KEY) return false;
  try {
    const res = await fetch(`${env.SUPABASE_URL}/auth/v1/user`, {
      headers: {
        authorization: `Bearer ${token}`,
        apikey: env.SUPABASE_ANON_KEY || env.SUPABASE_SERVICE_KEY || "",
      },
    });
    if (!res.ok) return false;
    const user = (await res.json()) as { id?: string };
    return typeof user?.id === "string" && user.id.length > 0;
  } catch {
    return false;
  }
}
