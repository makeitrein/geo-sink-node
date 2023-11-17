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
