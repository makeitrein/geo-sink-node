-- 
-- Initial Schemas for GeoSink
--
CREATE SCHEMA IF NOT EXISTS public;
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

CREATE UNIQUE INDEX idx_actions_unique ON cache.actions (
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
    blockNumber text NOT NULL,
);

CREATE UNIQUE INDEX idx_roles_unique ON cache.roles (
    role,
    account,
    sender,
    space,
    type,
    blockNumber
    cursor text NOT NULL
);

-- 
-- Database Setup
--
CREATE TABLE IF NOT EXISTS public.accounts (
    id text NOT NULL
);

CREATE TABLE IF NOT EXISTS public.actions (
    id text NOT NULL,
    action_type text NOT NULL,
    entity text NOT NULL,
    attribute text,
    value_type text,
    value_id text,
    number_value text,
    string_value text,
    entity_value text,
    array_value text[],
    proposed_version_id text,
    version_id text
);

CREATE TABLE IF NOT EXISTS public.cursors (
    id integer NOT NULL,
    cursor text NOT NULL,
    block_number text
);

COMMENT ON TABLE public.cursors IS '@name substreamCursor';

CREATE TABLE IF NOT EXISTS public.entities (
    id text NOT NULL,
    name character varying,
    description character varying,
    is_type boolean DEFAULT false,
    is_attribute boolean DEFAULT false,
    defined_in text,
    attribute_value_type_id text,
    version_id text
);

CREATE TABLE IF NOT EXISTS public.log_entries (
    id text NOT NULL,
    created_at_block text NOT NULL,
    uri text NOT NULL,
    created_by text NOT NULL,
    space text NOT NULL,
    mime_type text,
    decoded text,
    json text
);


CREATE TABLE IF NOT EXISTS public.proposals (
    id text NOT NULL,
    space text NOT NULL,
    name text,
    description text,
    created_at integer NOT NULL,
    created_at_block integer NOT NULL,
    created_by text,
    status text NOT NULL
);


CREATE TABLE IF NOT EXISTS public.proposed_versions (
    id text NOT NULL,
    name text,
    description text,
    created_at integer NOT NULL,
    created_at_block integer NOT NULL,
    created_by text NOT NULL,
    entity text NOT NULL,
    proposal_id text
);

CREATE TABLE IF NOT EXISTS public.spaces (
    id text NOT NULL,
    address text NOT NULL,
    created_at_block text,
    is_root_space boolean,
    admins text,
    editor_controllers text,
    editors text,
    entity text,
    cover text
);


CREATE TABLE IF NOT EXISTS public.space_admins (
    space text NOT NULL,
    account text NOT NULL
);

CREATE TABLE IF NOT EXISTS public.space_editors (
    space text NOT NULL,
    account text NOT NULL
);


CREATE TABLE IF NOT EXISTS public.space_editor_controllers (
    space text NOT NULL,
    account text NOT NULL
);


CREATE TABLE IF NOT EXISTS public.subspaces (
    id text NOT NULL,
    parent_space text NOT NULL,
    child_space text NOT NULL
);

CREATE TABLE IF NOT EXISTS public.triples (
    id text NOT NULL,
    entity_id text NOT NULL,
    attribute_id text NOT NULL,
    value_id text NOT NULL,
    value_type text NOT NULL,
    defined_in text NOT NULL,
    is_protected boolean NOT NULL,
    deleted boolean DEFAULT false NOT NULL,
    number_value text,
    array_value text,
    string_value text,
    entity_value text
);

CREATE TABLE IF NOT EXISTS public.versions (
    id text NOT NULL,
    name text,
    description text,
    created_at integer NOT NULL,
    created_at_block integer NOT NULL,
    created_by text NOT NULL,
    proposed_version text NOT NULL,
    entity_id text
);

-- 
-- Primary Key + Foreign Key Constraints
--
ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.actions
    ADD CONSTRAINT actions_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.cursors
    ADD CONSTRAINT cursors_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.entities
    ADD CONSTRAINT entities_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.log_entries
    ADD CONSTRAINT log_entries_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.proposals
    ADD CONSTRAINT proposals_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.proposed_versions
    ADD CONSTRAINT proposed_versions_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.spaces
    ADD CONSTRAINT spaces_address_key UNIQUE (address);

ALTER TABLE public.space_admins
    ADD CONSTRAINT space_admins_unique_account_space_pair UNIQUE (account, space);

ALTER TABLE public.space_editors
    ADD CONSTRAINT space_editors_unique_account_space_pair UNIQUE (account, space);

ALTER TABLE public.space_editor_controllers
    ADD CONSTRAINT space_editor_controllers_unique_account_space_pair UNIQUE (account, space);

ALTER TABLE ONLY public.spaces
    ADD CONSTRAINT spaces_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.subspaces
    ADD CONSTRAINT subspaces_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.triples
    ADD CONSTRAINT triples_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.versions
    ADD CONSTRAINT versions_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.proposed_versions
    ADD CONSTRAINT proposed_versions_proposal_fkey FOREIGN KEY (proposal_id) REFERENCES public.proposals(id);

ALTER TABLE ONLY public.actions
    ADD CONSTRAINT actions_proposed_version_in_actions_fkey FOREIGN KEY (proposed_version_id) REFERENCES public.proposed_versions(id);

ALTER TABLE ONLY public.actions
    ADD CONSTRAINT actions_version_in_actions_fkey FOREIGN KEY (version_id) REFERENCES public.versions(id);

ALTER TABLE ONLY public.entities
    ADD CONSTRAINT entity_defined_in_spaces_address_fkey FOREIGN KEY (defined_in) REFERENCES public.spaces(address);

ALTER TABLE ONLY public.entities
    ADD CONSTRAINT entity_value_type_entity_id_fkey FOREIGN KEY (attribute_value_type_id) REFERENCES public.entities(id);

ALTER TABLE ONLY public.spaces
    ADD CONSTRAINT spaces_id_entity_id_fkey FOREIGN KEY (id) REFERENCES public.entities(id);
    
ALTER TABLE public.space_admins
    ADD CONSTRAINT space_admins_account_fkey FOREIGN KEY (account) REFERENCES public.accounts(id);

ALTER TABLE public.space_editors
    ADD CONSTRAINT space_editors_account_fkey FOREIGN KEY (account) REFERENCES public.accounts(id);

ALTER TABLE public.space_editor_controllers
    ADD CONSTRAINT space_editor_controllers_account_fkey FOREIGN KEY (account) REFERENCES public.accounts(id);

ALTER TABLE ONLY public.subspaces
    ADD CONSTRAINT subspaces_child_space_fkey FOREIGN KEY (child_space) REFERENCES public.spaces(id);

ALTER TABLE ONLY public.subspaces
    ADD CONSTRAINT subspaces_parent_space_fkey FOREIGN KEY (parent_space) REFERENCES public.spaces(id);

ALTER TABLE ONLY public.triples
    ADD CONSTRAINT triples_attribute_entity_id_fkey FOREIGN KEY (attribute_id) REFERENCES public.entities(id);

ALTER TABLE ONLY public.triples
    ADD CONSTRAINT triples_entity_entity_id_fkey FOREIGN KEY (entity_id) REFERENCES public.entities(id);

ALTER TABLE ONLY public.triples
    ADD CONSTRAINT triples_entity_value_id_fkey FOREIGN KEY (value_id) REFERENCES public.entities(id);    

ALTER TABLE ONLY public.triples
    ADD CONSTRAINT triples_entity_value_entity_id_fkey FOREIGN KEY (entity_value) REFERENCES public.entities(id);

ALTER TABLE ONLY public.versions
    ADD CONSTRAINT versions_to_entities_fkey FOREIGN KEY (entity_id) REFERENCES public.entities(id);

ALTER TABLE public.space_admins
    ADD CONSTRAINT space_admins_space_to_address FOREIGN KEY (space) REFERENCES public.spaces(address);

ALTER TABLE public.space_editors
    ADD CONSTRAINT space_editors_space_to_address FOREIGN KEY (space) REFERENCES public.spaces(address);

ALTER TABLE public.space_editor_controllers
    ADD CONSTRAINT space_editor_controllers_space_to_address FOREIGN KEY (space) REFERENCES public.spaces(address);

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
