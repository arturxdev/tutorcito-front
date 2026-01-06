/**
 * Utility to decode JWT tokens (header and payload) without validation
 * Useful for debugging authentication issues
 */

export interface JWTHeader {
  alg: string;
  typ: string;
  kid?: string;
}

export interface JWTPayload {
  sub?: string;
  email?: string;
  exp?: number;
  expFormatted?: string;
  iss?: string;
  aud?: string | string[];
  iat?: number;
  iatFormatted?: string;
  [key: string]: any;
}

export interface DecodedJWT {
  header: JWTHeader;
  payload: JWTPayload;
  signature: string;
}

/**
 * Decodes a JWT token without validating its signature
 * @param token - The JWT token string
 * @returns Decoded header, payload, and signature
 */
export function decodeJWT(token: string): DecodedJWT | null {
  try {
    const parts = token.split('.');
    
    if (parts.length !== 3) {
      console.error('Invalid JWT format: expected 3 parts separated by dots');
      return null;
    }

    const [headerB64, payloadB64, signature] = parts;

    // Decode header
    const header: JWTHeader = JSON.parse(atob(headerB64));

    // Decode payload
    const payload: JWTPayload = JSON.parse(atob(payloadB64));

    // Add formatted dates
    if (payload.exp) {
      payload.expFormatted = new Date(payload.exp * 1000).toISOString();
    }
    if (payload.iat) {
      payload.iatFormatted = new Date(payload.iat * 1000).toISOString();
    }

    return {
      header,
      payload,
      signature,
    };
  } catch (error) {
    console.error('Failed to decode JWT:', error);
    return null;
  }
}

/**
 * Logs detailed JWT information to console
 * @param token - The JWT token string
 */
export function logJWTInfo(token: string): void {
  console.log('='.repeat(60));
  console.log('🔍 JWT TOKEN ANALYSIS');
  console.log('='.repeat(60));

  const decoded = decodeJWT(token);

  if (!decoded) {
    console.error('❌ Failed to decode token');
    return;
  }

  console.log('\n📋 HEADER:');
  console.log('  Algorithm (alg):', decoded.header.alg);
  console.log('  Type (typ):', decoded.header.typ);
  if (decoded.header.kid) {
    console.log('  Key ID (kid):', decoded.header.kid);
  }
  console.log('  Full header:', decoded.header);

  console.log('\n👤 PAYLOAD:');
  console.log('  Subject (sub):', decoded.payload.sub || 'N/A');
  console.log('  Email:', decoded.payload.email || 'N/A');
  console.log('  Issuer (iss):', decoded.payload.iss || 'N/A');
  console.log('  Audience (aud):', decoded.payload.aud || 'N/A');
  
  if (decoded.payload.exp) {
    const isExpired = Date.now() > decoded.payload.exp * 1000;
    console.log('  Expires at (exp):', decoded.payload.expFormatted);
    console.log('  Token expired:', isExpired ? '❌ YES' : '✅ NO');
  }
  
  if (decoded.payload.iat) {
    console.log('  Issued at (iat):', decoded.payload.iatFormatted);
  }

  console.log('  Full payload:', decoded.payload);

  console.log('\n🔐 SIGNATURE:');
  console.log('  Signature (base64):', decoded.signature.substring(0, 50) + '...');

  console.log('\n📏 TOKEN INFO:');
  console.log('  Total length:', token.length, 'characters');
  console.log('  Header length:', decoded.header.alg ? 'valid' : 'invalid');
  console.log('  Payload length:', decoded.payload.sub ? 'valid' : 'invalid');

  console.log('='.repeat(60));
}

/**
 * Helper function to use in browser console
 * Usage: window.decodeJWT(yourTokenString)
 */
if (typeof window !== 'undefined') {
  (window as any).decodeJWT = decodeJWT;
  (window as any).logJWTInfo = logJWTInfo;
  console.log('💡 JWT utilities loaded! You can use:');
  console.log('   - window.decodeJWT(token) - Returns decoded object');
  console.log('   - window.logJWTInfo(token) - Logs detailed info');
}
