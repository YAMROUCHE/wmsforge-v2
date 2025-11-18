/**
 * Cryptography utilities using Web Crypto API (Cloudflare Workers compatible)
 */

/**
 * Hash a password using SHA-256
 * Note: For production, consider using a KV store with rate limiting
 */
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);

  // Add salt
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const saltedPassword = new Uint8Array([...salt, ...data]);

  // Hash with SHA-256
  const hashBuffer = await crypto.subtle.digest('SHA-256', saltedPassword);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  // Return salt + hash (salt is first 32 chars)
  const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('');
  return saltHex + hashHex;
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  // Extract salt (first 32 chars = 16 bytes)
  const saltHex = storedHash.substring(0, 32);
  const salt = new Uint8Array(saltHex.match(/.{2}/g)!.map(byte => parseInt(byte, 16)));

  // Hash the input password with the same salt
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const saltedPassword = new Uint8Array([...salt, ...data]);

  const hashBuffer = await crypto.subtle.digest('SHA-256', saltedPassword);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  const computedHash = saltHex + hashHex;

  // Compare hashes
  return computedHash === storedHash;
}

/**
 * Generate a JWT token
 * Uses HMAC SHA-256 for signing
 */
export async function generateJWT(payload: any, secret: string, expiresIn: number = 86400): Promise<string> {
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };

  const now = Math.floor(Date.now() / 1000);
  const jwtPayload = {
    ...payload,
    iat: now,
    exp: now + expiresIn
  };

  // Encode header and payload
  const encodedHeader = btoa(JSON.stringify(header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const encodedPayload = btoa(JSON.stringify(jwtPayload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

  const message = `${encodedHeader}.${encodedPayload}`;

  // Sign with HMAC SHA-256
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(message)
  );

  const signatureArray = Array.from(new Uint8Array(signature));
  const signatureBase64 = btoa(String.fromCharCode(...signatureArray))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return `${message}.${signatureBase64}`;
}

/**
 * Verify and decode a JWT token
 */
export async function verifyJWT(token: string, secret: string): Promise<any> {
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid token format');
  }

  const [encodedHeader, encodedPayload, signature] = parts;
  const message = `${encodedHeader}.${encodedPayload}`;

  // Verify signature
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify']
  );

  // Decode signature
  const signatureBytes = Uint8Array.from(
    atob(signature.replace(/-/g, '+').replace(/_/g, '/')),
    c => c.charCodeAt(0)
  );

  const isValid = await crypto.subtle.verify(
    'HMAC',
    key,
    signatureBytes,
    encoder.encode(message)
  );

  if (!isValid) {
    throw new Error('Invalid token signature');
  }

  // Decode payload
  const payload = JSON.parse(
    atob(encodedPayload.replace(/-/g, '+').replace(/_/g, '/'))
  );

  // Check expiration
  const now = Math.floor(Date.now() / 1000);
  if (payload.exp && payload.exp < now) {
    throw new Error('Token expired');
  }

  return payload;
}
