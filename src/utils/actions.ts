import { NAME } from "../constants/systemIds.js";
import { ZodAction, type Action } from "../zod.js";
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

export function isValidAction(action: any): action is Action {
  const parsedAction = ZodAction.safeParse(action);
  if (parsedAction.success) {
    return true;
  } else {
    return false;
  }
}

export const isNameCreateAction = (action: Action) =>
  action.type === "createTriple" &&
  action.attributeId === NAME &&
  action.value.type === "string";
export const isNameDeleteAction = (action: Action) =>
  action.type === "deleteTriple" &&
  action.attributeId === NAME &&
  action.value.type === "string";
