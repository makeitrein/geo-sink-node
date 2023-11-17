CREATE TABLE IF NOT EXISTS public.accounts (
    id text PRIMARY KEY NOT NULL
);

CREATE TABLE IF NOT EXISTS public.cursors (
    id integer PRIMARY KEY NOT NULL,
    cursor text NOT NULL,
    block_number text
);

COMMENT ON TABLE public.cursors IS '@name substreamCursor';



CREATE TABLE IF NOT EXISTS public.spaces (
    id text PRIMARY KEY NOT NULL,
    created_at_block integer NOT NULL,
    is_root_space boolean NOT NULL,
    entity text,
    cover text
);

CREATE TABLE IF NOT EXISTS public.geo_entities (
    id text PRIMARY KEY NOT NULL,
    name character varying,
    description character varying,
    is_type boolean DEFAULT false,
    is_attribute boolean DEFAULT false,
    attribute_value_type_id text,
    version_id text
);

ALTER TABLE public.geo_entities ADD CONSTRAINT attribute_value_type_id_fk FOREIGN KEY (attribute_value_type_id) REFERENCES public.geo_entities(id);


CREATE TABLE IF NOT EXISTS public.log_entries (
    id text PRIMARY KEY NOT NULL,
    created_at_block text NOT NULL,
    uri text NOT NULL,
    created_by_id text NOT NULL REFERENCES public.accounts(id),
    space_id text NOT NULL REFERENCES public.spaces(id),
    mime_type text,
    decoded text,
    json text
);


CREATE TABLE IF NOT EXISTS public.proposals (
    id text PRIMARY KEY NOT NULL,
    space_id text NOT NULL REFERENCES public.spaces(id),
    name text,
    description text,
    created_at integer NOT NULL,
    created_at_block integer NOT NULL,
    created_by_id text NOT NULL REFERENCES public.accounts(id),
    status text NOT NULL
);


CREATE TABLE IF NOT EXISTS public.proposed_versions (
    id text PRIMARY KEY NOT NULL,
    name text,
    description text,
    created_at integer NOT NULL,
    created_at_block integer NOT NULL,
    created_by_id text NOT NULL REFERENCES public.accounts(id),
    entity text NOT NULL,
    proposal_id text REFERENCES public.proposals(id)
);



CREATE TABLE IF NOT EXISTS public.space_admins (
    space_id text NOT NULL REFERENCES public.spaces(id),
    account_id text NOT NULL REFERENCES public.accounts(id),
    CONSTRAINT space_admins_unique_account_space_pair UNIQUE (account_id, space_id)
);

CREATE TABLE IF NOT EXISTS public.space_editors (
    space_id text NOT NULL REFERENCES public.spaces(id),
    account_id text NOT NULL REFERENCES public.accounts(id),
    CONSTRAINT space_editors_unique_account_space_pair UNIQUE (account_id, space_id)
);


CREATE TABLE IF NOT EXISTS public.space_editor_controllers (
    space_id text NOT NULL REFERENCES public.spaces(id),
    account_id text NOT NULL REFERENCES public.accounts(id),
    CONSTRAINT space_editor_controllers_unique_account_space_pair UNIQUE (account_id, space_id)
);


CREATE TABLE IF NOT EXISTS public.subspaces (
    id text PRIMARY KEY NOT NULL,
    parent_space_id text NOT NULL REFERENCES public.spaces(id),
    child_space_id text NOT NULL REFERENCES public.spaces(id)
);

CREATE TABLE IF NOT EXISTS public.triples (
    id text PRIMARY KEY NOT NULL,
    entity_id text NOT NULL REFERENCES public.geo_entities(id),
    attribute_id text NOT NULL REFERENCES public.geo_entities(id),
    value_type text NOT NULL,
    value_id text NOT NULL,
    number_value text,
    string_value text,
    array_value text,
    entity_value_id text REFERENCES public.geo_entities(id),
    is_protected boolean NOT NULL,
    space_id text NOT NULL REFERENCES public.spaces(id),
    deleted boolean DEFAULT false NOT NULL
);

CREATE TABLE IF NOT EXISTS public.versions (
    id text PRIMARY KEY NOT NULL,
    name text,
    description text,
    created_at integer NOT NULL,
    created_at_block integer NOT NULL,
    created_by text NOT NULL,
    proposed_version text NOT NULL,
    entity_id text REFERENCES public.geo_entities(id)
);

CREATE TABLE IF NOT EXISTS public.actions (
    id serial PRIMARY KEY,
    action_type text NOT NULL,
    entity text NOT NULL,
    attribute text,
    value_type text,
    value_id text,
    number_value text,
    string_value text,
    entity_value text,
    array_value text[],
    proposed_version_id text REFERENCES public.proposed_versions(id),
    version_id text REFERENCES public.versions(id)
);



-- 
-- Disable Foreign Key Constraints to allow for bulk loading + unordered inserts
-- 
ALTER TABLE public.accounts DISABLE TRIGGER ALL;
ALTER TABLE public.actions DISABLE TRIGGER ALL;
ALTER TABLE public.geo_entities DISABLE TRIGGER ALL;
ALTER TABLE public.log_entries DISABLE TRIGGER ALL;
ALTER TABLE public.proposals DISABLE TRIGGER ALL;
ALTER TABLE public.proposed_versions DISABLE TRIGGER ALL;
ALTER TABLE public.triples DISABLE TRIGGER ALL;
ALTER TABLE public.subspaces DISABLE TRIGGER ALL;
ALTER TABLE public.spaces DISABLE TRIGGER ALL;
ALTER TABLE public.versions DISABLE TRIGGER ALL;
ALTER TABLE public.space_admins DISABLE TRIGGER ALL;
ALTER TABLE public.space_editors DISABLE TRIGGER ALL;
ALTER TABLE public.space_editor_controllers DISABLE TRIGGER ALL;

-- 
-- Create Indexes for Speedy Querying
-- 
CREATE INDEX idx_entity_attribute ON public.triples(entity_id, attribute_id);
CREATE INDEX idx_entity_attribute_value_id ON public.triples(entity_id, attribute_id, value_id);
