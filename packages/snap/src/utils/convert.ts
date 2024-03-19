import { from, fromBytes } from '@iotexproject/iotex-address-ts';
import { type DomainLookupResult } from '@metamask/snaps-sdk';
import { bech32 } from 'bech32';

/**
 * Convert an IoTeX address to an Ethereum address.
 * @param address - The address to resolve.
 * @returns If successful, an object containing the resolvedAddress. Null otherwise.
 */
export function convertIoToOxAddress(
  address: string,
): DomainLookupResult | null {
  if (!address.startsWith('io')) {
    throw Error('Invalid io address');
  }

  try {
    const { prefix, words } = bech32.decode(address);
    if (prefix !== 'io') {
      throw new Error(`hrp ${prefix} and address prefix io don't match`);
    }
    const resolvedAddress = byteArrayToHexString(bech32.fromWords(words));

    return resolvedAddress
      ? {
          resolvedAddresses: [
            {
              protocol: 'ins',
              resolvedAddress: `0x${resolvedAddress}`,
            },
          ],
        }
      : null;
  } catch (error) {
    return null;
  }
}

/**
 * Convert an Ethereum address to an IoTeX address.
 * @param address - The address to resolve.
 * @returns If successful, an object containing the resolvedAddress. Null otherwise.
 */
export function convert0xToIoAddress(
  address: string,
): { resolvedAddress: string } | null {
  if (!address.startsWith('0x')) {
    throw Error('Invalid 0x address');
  }

  try {
    const addressBytes = hexStringToByteArray(address.substring(2));
    const resolvedAddress = fromBytes(addressBytes).string();

    return resolvedAddress ? { resolvedAddress } : null;
  } catch (error: any) {
    console.log(error);
    throw Error('Error converting 0x Address');
  }
}

/**
 * Helper function to convert hex string to bytes array.
 * @param hexString - Hex part of 0x address.
 * @returns If successful, an array of bytes.
 */
function hexStringToByteArray(hexString: string) {
  if (hexString.length % 2 !== 0) {
    throw new Error('Hex string has an odd length');
  }

  const numBytes = hexString.length / 2;
  const byteArray = new Uint8Array(numBytes);

  for (let i = 0; i < numBytes; i++) {
    const hexSubstring = hexString.substring(i * 2, i * 2 + 2);
    byteArray[i] = parseInt(hexSubstring, 16);
  }

  return byteArray;
}

/**
 * Helper function to convert bytes array to hex string.
 * @param byteArray - Array of bytes.
 * @returns Hex string.
 */
function byteArrayToHexString(byteArray: number[]) {
  return Array.from(byteArray, (byte) => {
    return ('0' + (byte & 0xff).toString(16)).slice(-2);
  }).join('');
}
