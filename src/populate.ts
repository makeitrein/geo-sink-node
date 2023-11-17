import { z } from 'zod'
import { decodeUri } from './utils/uri.js'
import { Entry } from './zod.js'

export const populateEntries = async (entries: z.infer<typeof Entry>[]) => {
   const entriesWithIpfs = await Promise.all(entries.map(async (entry) => {
        const actions = await decodeUri(entry.uri)
        return { ...entry, actions }
     }))


     console.log(entriesWithIpfs);
}
