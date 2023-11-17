import type * as s from "zapatos/schema";
import { z } from "zod";
import { decodeUri } from "./utils/uri.js";
import { Entry } from "./zod.js";

export const populateEntries = async (entries: z.infer<typeof Entry>[]) => {
  const entriesWithActions = await Promise.all(
    entries.map(async (entry) => {
      const actions = await decodeUri(entry.uri);
      return { ...entry, actions };
    })
  );

  const accounts: s.accounts.Insertable[] = [];
  const actions: s.actions.Insertable[] = [];
  const cursors: s.cursors.Insertable[] = [];
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

  entriesWithActions.forEach((entry) => {});
};
