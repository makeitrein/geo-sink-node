CREATE SCHEMA IF NOT EXISTS cache;

-- 
-- Cache Setup
--
CREATE TABLE IF NOT EXISTS cache.entries (
    id serial PRIMARY KEY,
    block_number integer NOT NULL,
    cursor text NOT NULL,
    data jsonb NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_actions_unique ON cache.entries (block_number, cursor);

CREATE TABLE IF NOT EXISTS cache.roles (
    id serial PRIMARY KEY,
    role text NOT NULL,
    account text NOT NULL,
    sender text NOT NULL,
    space text NOT NULL,
    type text NOT NULL,
    block_number integer NOT NULL,
    cursor text NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_roles_unique ON cache.roles (
    role,
    account,
    sender,
    space,
    type,
    block_number,
    cursor
);