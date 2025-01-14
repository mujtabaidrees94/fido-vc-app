import bs58 from 'bs58';


// Convert a Base64URL string to a Uint8Array
function base64URLToUint8Array(base64UrlString: string): Uint8Array {
    // Add padding if needed
    const padding = base64UrlString.length % 4;
    if (padding) {
      base64UrlString += '='.repeat(4 - padding);
    }
  
    // Convert Base64URL to Base64
    const base64String = base64UrlString
      .replace(/-/g, '+')  // Replace '-' with '+'
      .replace(/_/g, '/')  // Replace '_' with '/'
    
    // Decode the Base64 string to a Uint8Array
    const binaryString = atob(base64String);
    const byteArray = new Uint8Array(binaryString.length);
  
    for (let i = 0; i < binaryString.length; i++) {
      byteArray[i] = binaryString.charCodeAt(i);
    }
  
    return byteArray;
  }

export function encodePublicKeyToDID(publicKey: string): string {
// Simplified example for Base58 encoding (you might need a library like `bs58`):
return `did:key:${bs58.encode(base64URLToUint8Array(publicKey))}`;
}