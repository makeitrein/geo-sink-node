import { ipfsFetch } from "./ipfs.js";

export async function actionsFromURI(uri: string) {
  if (uri.startsWith("data:application/json;base64,")) {
    const base64 = uri.split(",")[1];
    const decoded = JSON.parse(Buffer.from(base64, "base64").toString("utf8"));
    return decoded;
  } else if (uri.startsWith("ipfs://")) {
    const fetched = await ipfsFetch(uri);
    return fetched;
  }
}
