import type * as s from "zapatos/schema";
import { z } from "zod";
import { actionsFromURI } from "./utils/actions.js";
import {
  ZodActionsResponse,
  ZodEntry,
  type EntryWithActionsResponse,
} from "./zod.js";

export const populateEntries = async (entries: z.infer<typeof ZodEntry>[]) => {
  const entriesWithActionResponse: EntryWithActionsResponse[] = [];
  for (const entry of entries) {
    const response = ZodActionsResponse.safeParse(
      await actionsFromURI(entry.uri)
    );
    if (response.success) {
      entriesWithActionResponse.push({ ...entry, ...response.data });
    } else {
      console.error(response.error);
    }
  }

  console.log(entriesWithActionResponse);

  const accounts: s.accounts.Insertable[] = [];
  const actions: s.actions.Insertable[] = [];
  const entities: s.entities.Insertable[] = [];
  const log_entries: s.log_entries.Insertable[] = [];
  const proposals: s.proposals.Insertable[] = [];
  const proposed_versions: s.proposed_versions.Insertable[] = [];
  const space_admins: s.space_admins.Insertable[] = [];
  const space_editor_controllers: s.space_editor_controllers.Insertable[] = [];
  const space_editors: s.space_editors.Insertable[] = [];
  const spaces: s.spaces.Insertable[] = [];
  const subspaces: s.subspaces.Insertable[] = [];
  const triples: s.triples.Insertable[] = [];
  const versions: s.versions.Insertable[] = [];

  //   entriesActions.forEach((entry) => {});
};
