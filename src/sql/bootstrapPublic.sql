CREATE TABLE IF NOT EXISTS public.accounts (
    id text PRIMARY KEY NOT NULL
);



CREATE TABLE IF NOT EXISTS public.cursors (
    id integer PRIMARY KEY NOT NULL,
    cursor text NOT NULL,
    block_number text
);

COMMENT ON TABLE public.cursors IS '@name substreamCursor';

CREATE TABLE IF NOT EXISTS public.entities (
    id text PRIMARY KEY NOT NULL,
    name character varying,
    description character varying,
    is_type boolean DEFAULT false,
    is_attribute boolean DEFAULT false,
    defined_in text NOT NULL,
    attribute_value_type_id text,
    version_id text
);

CREATE TABLE IF NOT EXISTS public.log_entries (
    id text PRIMARY KEY NOT NULL,
    created_at_block text NOT NULL,
    uri text NOT NULL,
    created_by text NOT NULL,
    space text NOT NULL,
    mime_type text,
    decoded text,
    json text
);


CREATE TABLE IF NOT EXISTS public.proposals (
    id text PRIMARY KEY NOT NULL,
    space text NOT NULL,
    name text,
    description text,
    created_at integer NOT NULL,
    created_at_block integer NOT NULL,
    created_by text,
    status text NOT NULL
);


CREATE TABLE IF NOT EXISTS public.proposed_versions (
    id text PRIMARY KEY NOT NULL,
    name text,
    description text,
    created_at integer NOT NULL,
    created_at_block integer NOT NULL,
    created_by text NOT NULL,
    entity text NOT NULL,
    proposal_id text REFERENCES public.proposals(id)
);

CREATE TABLE IF NOT EXISTS public.spaces (
    id text PRIMARY KEY NOT NULL REFERENCES public.entities(id),
    address text UNIQUE NOT NULL,
    created_at_block text,
    is_root_space boolean,
    admins text,
    editor_controllers text,
    editors text,
    entity text,
    cover text
);


CREATE TABLE IF NOT EXISTS public.space_admins (
    space text NOT NULL REFERENCES public.spaces(address),
    account text NOT NULL REFERENCES public.accounts(id),
    CONSTRAINT space_admins_unique_account_space_pair UNIQUE (account, space)
);

CREATE TABLE IF NOT EXISTS public.space_editors (
    space text NOT NULL REFERENCES public.spaces(address),
    account text NOT NULL REFERENCES public.accounts(id),
    CONSTRAINT space_editors_unique_account_space_pair UNIQUE (account, space)
);


CREATE TABLE IF NOT EXISTS public.space_editor_controllers (
    space text NOT NULL REFERENCES public.spaces(address),
    account text NOT NULL REFERENCES public.accounts(id),
    CONSTRAINT space_editor_controllers_unique_account_space_pair UNIQUE (account, space)
);


CREATE TABLE IF NOT EXISTS public.subspaces (
    id text PRIMARY KEY NOT NULL,
    parent_space text NOT NULL REFERENCES public.spaces(id),
    child_space text NOT NULL REFERENCES public.spaces(id)
);

CREATE TABLE IF NOT EXISTS public.triples (
    id text PRIMARY KEY NOT NULL,
    entity_id text NOT NULL REFERENCES public.entities(id),
    attribute_id text NOT NULL REFERENCES public.entities(id),
    value_id text NOT NULL REFERENCES public.entities(id),
    value_type text NOT NULL,
    defined_in text NOT NULL,
    is_protected boolean NOT NULL,
    deleted boolean DEFAULT false NOT NULL,
    number_value text,
    array_value text,
    string_value text,
    entity_value text REFERENCES public.entities(id)
);

CREATE TABLE IF NOT EXISTS public.versions (
    id text PRIMARY KEY NOT NULL,
    name text,
    description text,
    created_at integer NOT NULL,
    created_at_block integer NOT NULL,
    created_by text NOT NULL,
    proposed_version text NOT NULL,
    entity_id text REFERENCES public.entities(id)
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

ALTER TABLE public.entities ADD CONSTRAINT defined_in_fk FOREIGN KEY (defined_in) REFERENCES public.spaces(address);
ALTER TABLE public.entities ADD CONSTRAINT attribute_value_type_id_fk FOREIGN KEY (attribute_value_type_id) REFERENCES public.entities(id);


-- 
-- Disable Foreign Key Constraints to allow for bulk loading + unordered inserts
-- 
ALTER TABLE public.accounts DISABLE TRIGGER ALL;
ALTER TABLE public.actions DISABLE TRIGGER ALL;
ALTER TABLE public.entities DISABLE TRIGGER ALL;
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
