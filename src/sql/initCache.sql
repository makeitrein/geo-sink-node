CREATE SCHEMA IF NOT EXISTS cache;

-- 
-- Cache Setup
--
CREATE TABLE IF NOT EXISTS cache.actions (
    id serial PRIMARY KEY,
    type text NOT NULL,
    entityId text NOT NULL,
    attributeId text NOT NULL,
    valueType text NOT NULL,
    value text NOT NULL,
    valueId text NOT NULL,
    space text NOT NULL,
    author text NOT NULL,
    blockNumber text NOT NULL,
    proposalName text NOT NULL,
    cursor text NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_actions_unique ON cache.actions (
    blockNumber,
    type,
    entityId,
    attributeId,
    valueType,
    value,
    valueId
);


CREATE TABLE IF NOT EXISTS cache.roles (
    id serial PRIMARY KEY,
    role text NOT NULL,
    account text NOT NULL,
    sender text NOT NULL,
    space text NOT NULL,
    type text NOT NULL,
    blockNumber text NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_roles_unique ON cache.roles (
    role,
    account,
    sender,
    space,
    type,
    blockNumber
);
