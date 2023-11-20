export const generateTripleId = ({
  space_id,
  entity_id,
  attribute_id,
  value_id,
}: {
  space_id: string;
  entity_id: string;
  attribute_id: string;
  value_id: string;
}) =>
  `${space_id.toLowerCase()}:${entity_id.toLowerCase()}:${attribute_id.toLowerCase()}:${value_id.toLowerCase()}`;

export const generateProposalId = ({
  idx,
  cursor,
}: {
  idx: number;
  cursor: string;
}) => `${idx}:${cursor}`;

export const generateProposedVersionId = ({
  entityId,
  cursor,
}: {
  entityId: string;
  cursor: string;
}) => `${entityId}:${cursor}`;

export const generateVersionId = ({
  entityId,
  cursor,
}: {
  entityId: string;
  cursor: string;
}) => `${entityId}:${cursor}`;
