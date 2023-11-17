import {
  ATTRIBUTE,
  ATTRIBUTES,
  AVATAR_ATTRIBUTE,
  BLOCKS,
  COVER_ATTRIBUTE,
  DATE,
  DESCRIPTION,
  FILTER,
  FOREIGN_TYPES,
  IMAGE,
  IMAGE_ATTRIBUTE,
  IMAGE_BLOCK,
  MARKDOWN_CONTENT,
  NAME,
  PARENT_ENTITY,
  PERSON_TYPE,
  RELATION,
  RELATION_VALUE_RELATIONSHIP_TYPE,
  ROW_TYPE,
  SCHEMA_TYPE,
  SHOWN_COLUMNS,
  SPACE,
  SPACE_CONFIGURATION,
  TABLE_BLOCK,
  TEXT,
  TEXT_BLOCK,
  TYPES,
  VALUE_TYPE,
  WALLETS_ATTRIBUTE,
  WEB_URL,
} from "../constants/systemIds.js";
import type { StringValue } from "../types.js";
//   import {
//     createProposedVersion,
//     createVersion,
//     getOrCreateActionCount,
//     handleAction,
//   } from './actions'
//   import { getEntityId, getOrCreateProposal } from './add-entry'

const entities: string[] = [
  TYPES,
  ATTRIBUTES,
  SCHEMA_TYPE,
  VALUE_TYPE,
  RELATION,
  TEXT,
  IMAGE,
  IMAGE_ATTRIBUTE,
  DESCRIPTION,
  NAME,
  SPACE,
  ATTRIBUTE,
  SPACE_CONFIGURATION,
  FOREIGN_TYPES,
  TABLE_BLOCK,
  SHOWN_COLUMNS,
  TEXT_BLOCK,
  IMAGE_BLOCK,
  BLOCKS,
  MARKDOWN_CONTENT,
  ROW_TYPE,
  PARENT_ENTITY,
  RELATION_VALUE_RELATIONSHIP_TYPE,
  DATE,
  WEB_URL,
  PERSON_TYPE,
];

const toStringValue = (id: string, value: string): StringValue => {
  return {
    type: "string",
    id,
    value,
  };
};

const names: [string, StringValue][] = [
  [TYPES, toStringValue(TYPES, "Types")],
  [NAME, toStringValue(NAME, "Name")],
  [ATTRIBUTE, toStringValue(ATTRIBUTE, "Attribute")],
  [SPACE, toStringValue(SPACE, "Indexed Space")],
  [ATTRIBUTES, toStringValue(ATTRIBUTES, "Attributes")],
  [SCHEMA_TYPE, toStringValue(SCHEMA_TYPE, "Type")],
  [VALUE_TYPE, toStringValue(VALUE_TYPE, "Value type")],
  [RELATION, toStringValue(RELATION, "Relation")],
  [TEXT, toStringValue(TEXT, "Text")],
  [IMAGE, toStringValue(IMAGE, "Image")],
  [DATE, toStringValue(DATE, "Date")],
  [WEB_URL, toStringValue(WEB_URL, "Web URL")],
  [IMAGE_ATTRIBUTE, toStringValue(IMAGE_ATTRIBUTE, "Image")],
  [DESCRIPTION, toStringValue(DESCRIPTION, "Description")],
  [SPACE_CONFIGURATION, toStringValue(SPACE_CONFIGURATION, "Space")],
  [FOREIGN_TYPES, toStringValue(FOREIGN_TYPES, "Foreign Types")],
  [TABLE_BLOCK, toStringValue(TABLE_BLOCK, "Table Block")],
  [SHOWN_COLUMNS, toStringValue(SHOWN_COLUMNS, "Shown Columns")],
  [TEXT_BLOCK, toStringValue(TEXT_BLOCK, "Text Block")],
  [IMAGE_BLOCK, toStringValue(IMAGE_BLOCK, "Image Block")],
  [BLOCKS, toStringValue(BLOCKS, "Blocks")],
  [PARENT_ENTITY, toStringValue(PARENT_ENTITY, "Parent Entity")],
  [PERSON_TYPE, toStringValue(PERSON_TYPE, "Person")],
  [MARKDOWN_CONTENT, toStringValue(MARKDOWN_CONTENT, "Markdown Content")],
  [ROW_TYPE, toStringValue(ROW_TYPE, "Row Type")],
  [AVATAR_ATTRIBUTE, toStringValue(AVATAR_ATTRIBUTE, "Avatar")],
  [COVER_ATTRIBUTE, toStringValue(COVER_ATTRIBUTE, "Cover")],
  [FILTER, toStringValue(FILTER, "Filter")],
  [WALLETS_ATTRIBUTE, toStringValue(WALLETS_ATTRIBUTE, "Wallets")],
  [
    RELATION_VALUE_RELATIONSHIP_TYPE,
    toStringValue(RELATION_VALUE_RELATIONSHIP_TYPE, "Relation Value Types"),
  ],
];

/* Multi-dimensional array of [EntityId, ValueType] */
const attributes: [string, string][] = [
  [TYPES, RELATION],
  [ATTRIBUTES, RELATION],
  [VALUE_TYPE, RELATION],
  [IMAGE_ATTRIBUTE, TEXT],
  [DESCRIPTION, TEXT],
  [NAME, TEXT],
  [SPACE, TEXT],
  [FOREIGN_TYPES, RELATION],
  [MARKDOWN_CONTENT, TEXT],
  [ROW_TYPE, RELATION],
  [BLOCKS, RELATION],
  [PARENT_ENTITY, RELATION],
  [FILTER, TEXT],
  [RELATION_VALUE_RELATIONSHIP_TYPE, RELATION],
  [AVATAR_ATTRIBUTE, IMAGE],
  [COVER_ATTRIBUTE, IMAGE],
  [WALLETS_ATTRIBUTE, RELATION],
];

/* Multi-dimensional array of [TypeId, [Attributes]] */
const types: [string, string[]][] = [
  [TEXT, []],
  [RELATION, []],
  [IMAGE, []],
  [DATE, []],
  [WEB_URL, []],
  [ATTRIBUTE, [VALUE_TYPE]],
  [SCHEMA_TYPE, [ATTRIBUTES]],
  [SPACE_CONFIGURATION, [FOREIGN_TYPES]],
  [IMAGE_BLOCK, [IMAGE_ATTRIBUTE, PARENT_ENTITY]],
  [TABLE_BLOCK, [ROW_TYPE, PARENT_ENTITY]],
  [TEXT_BLOCK, [MARKDOWN_CONTENT, PARENT_ENTITY]],
  [PERSON_TYPE, [AVATAR_ATTRIBUTE, COVER_ATTRIBUTE]],
];

// export function bootstrapRootSpaceCoreTypes(
//   space: string,
//   createdAtBlock: BigInt,
//   createdAtTimestamp: BigInt,
//   createdBy: Address
// ): void {
//   log.debug(`Bootstrapping root space ${space}!`, []);

//   const proposalId = getOrCreateActionCount().count.toString();

//   getOrCreateProposal(
//     proposalId,
//     createdBy,
//     createdAtTimestamp,
//     space,
//     `Creating initial types for ${space}`,
//     createdAtBlock
//   );

//   const entityToActionIds = new Map<string, string[]>();

//   /* Create all of our entities */
//   for (let i = 0; i < entities.length; i++) {
//     const action = new CreateEntityAction(entities[i]);
//     const entityId = getEntityId(action);
//     const actionId = handleAction(action, space, createdAtBlock);

//     if (entityId && actionId) {
//       const isSet = entityToActionIds.has(entityId);
//       if (isSet) {
//         const actions = entityToActionIds.get(entityId);
//         entityToActionIds.set(entityId, actions.concat([actionId]));
//       } else {
//         entityToActionIds.set(entityId, [actionId]);
//       }
//     }
//   }

//   /* Name all of our entities */
//   for (let i = 0; i < names.length; i++) {
//     const action = new CreateTripleAction(
//       names[i]._0 as string,
//       NAME,
//       names[i]._1 as StringValue
//     );
//     const entityId = getEntityId(action);
//     const actionId = handleAction(action, space, createdAtBlock);

//     if (entityId && actionId) {
//       const isSet = entityToActionIds.has(entityId);
//       if (isSet) {
//         const actions = entityToActionIds.get(entityId);
//         entityToActionIds.set(entityId, actions.concat([actionId]));
//       } else {
//         entityToActionIds.set(entityId, [actionId]);
//       }
//     }
//   }

//   /* Create our attributes of type "attribute" */
//   for (let i = 0; i < attributes.length; i++) {
//     const action = new CreateTripleAction(
//       attributes[i]._0 as string,
//       TYPES,
//       new EntityValue(ATTRIBUTE)
//     );
//     const entityId = getEntityId(action);
//     const actionId = handleAction(action, space, createdAtBlock);

//     if (entityId && actionId) {
//       const isSet = entityToActionIds.has(entityId);
//       if (isSet) {
//         const actions = entityToActionIds.get(entityId);
//         entityToActionIds.set(entityId, actions.concat([actionId]));
//       } else {
//         entityToActionIds.set(entityId, [actionId]);
//       }
//     }

//     const action2 = new CreateTripleAction(
//       attributes[i]._0 as string,
//       VALUE_TYPE,
//       new EntityValue(attributes[i]._1 as string)
//     );
//     const entityId2 = getEntityId(action2);
//     const actionId2 = handleAction(action2, space, createdAtBlock);

//     if (entityId2 && actionId2) {
//       const isSet = entityToActionIds.has(entityId2);
//       if (isSet) {
//         const actions = entityToActionIds.get(entityId2);
//         entityToActionIds.set(entityId2, actions.concat([actionId2]));
//       } else {
//         entityToActionIds.set(entityId2, [actionId2]);
//       }
//     }
//   }

//   /* Create our types of type "type" */
//   for (let i = 0; i < types.length; i++) {
//     const action = new CreateTripleAction(
//       types[i]._0 as string,
//       TYPES,
//       new EntityValue(SCHEMA_TYPE)
//     );
//     const entityId = getEntityId(action);
//     const actionId = handleAction(action, space, createdAtBlock);

//     if (entityId && actionId) {
//       const isSet = entityToActionIds.has(entityId);
//       if (isSet) {
//         const actions = entityToActionIds.get(entityId);
//         entityToActionIds.set(entityId, actions.concat([actionId]));
//       } else {
//         entityToActionIds.set(entityId, [actionId]);
//       }
//     }

//     /* Each type can have a set of attributes */
//     for (let j = 0; j < types[i]._1.length; j++) {
//       const action = new CreateTripleAction(
//         types[i]._0 as string,
//         ATTRIBUTES,
//         new EntityValue(types[i]._1[j] as string)
//       );
//       const entityId = getEntityId(action);
//       const actionId = handleAction(action, space, createdAtBlock);

//       if (entityId && actionId) {
//         const isSet = entityToActionIds.has(entityId);
//         if (isSet) {
//           const actions = entityToActionIds.get(entityId);
//           entityToActionIds.set(entityId, actions.concat([actionId]));
//         } else {
//           entityToActionIds.set(entityId, [actionId]);
//         }
//       }
//     }

//     // for every key in the map,
//     const entityIds = entityToActionIds.keys();

//     for (let i = 0; i < entityIds.length; i++) {
//       const entityId = entityIds[i];
//       const actionIds = entityToActionIds.get(entityIds[i]);

//       let proposedVersion = createProposedVersion(
//         getOrCreateActionCount().count.toString(),
//         createdAtTimestamp,
//         actionIds,
//         entityId,
//         createdBy,
//         proposalId,
//         `Creating initial types for ${space}`,
//         createdAtBlock
//       );

//       createVersion(
//         entityId + "-" + getOrCreateActionCount().count.toString(),
//         proposedVersion.id,
//         createdAtTimestamp,
//         entityId,
//         createdBy,
//         `Creating initial types for ${space}`,
//         createdAtBlock
//       );
//     }
//   }
// }
