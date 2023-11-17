import { ipfsFetch } from "./ipfs.js";

export async function decodeUri(uri: string) {
    if (uri.startsWith('data:application/json;base64,')) {
      const base64 = uri.split(',')[1];
      const decoded = Buffer.from(base64, 'base64').toString('utf8');
      return JSON.parse(decoded);
    } else if (uri.startsWith('ipfs://')) {
      return ipfsFetch(uri);
    }
}