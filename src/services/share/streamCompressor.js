/**
 * Stream compressor utility using native Web Standards (CompressionStream / DecompressionStream).
 * Handles raw deflate streams with Base64URL encoding/decoding.
 */

export function uint8ArrayToBase64Url(bytes) {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(bytes).toString('base64url');
  }
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function base64UrlToUint8Array(base64url) {
  if (typeof Buffer !== 'undefined') {
    return new Uint8Array(Buffer.from(base64url, 'base64url'));
  }
  let base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export const MAX_DECOMPRESSED_BYTES = 256 * 1024;

function createSizeLimitTransform(maxBytes = MAX_DECOMPRESSED_BYTES) {
  let totalBytes = 0;
  return new TransformStream({
    transform(chunk, controller) {
      totalBytes += chunk.byteLength;
      if (totalBytes > maxBytes) {
        throw new Error(`Decompressed payload exceeds maximum limit of ${maxBytes} bytes`);
      }
      controller.enqueue(chunk);
    },
  });
}

export async function compressStringToBase64Url(str) {
  const stream = new Response(str).body.pipeThrough(new CompressionStream('deflate-raw'));
  const compressedBuffer = await new Response(stream).arrayBuffer();
  return uint8ArrayToBase64Url(new Uint8Array(compressedBuffer));
}

export async function decompressBase64UrlToString(base64url, maxBytes = MAX_DECOMPRESSED_BYTES) {
  const bytes = base64UrlToUint8Array(base64url);
  const stream = new Response(bytes).body
    .pipeThrough(new DecompressionStream('deflate-raw'))
    .pipeThrough(createSizeLimitTransform(maxBytes));
  return await new Response(stream).text();
}
