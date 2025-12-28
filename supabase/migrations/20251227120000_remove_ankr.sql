-- Remove all Ankr-related tables, functions, and cleanup schema
-- This migration drops everything starting with the 'ankr_' prefix

-- ============================
-- 1. Drop Tables (in order of dependency)
-- ============================

drop table if exists public.ankr_embeddings cascade;
drop table if exists public.ankr_thread_state cascade;
drop table if exists public.ankr_message_citations cascade;
drop table if exists public.ankr_messages cascade;
drop table if exists public.ankr_thread_topics cascade;
drop table if exists public.ankr_threads cascade;
drop table if exists public.ankr_snippets cascade;
drop table if exists public.ankr_topics cascade;
drop table if exists public.ankr_actions cascade;
drop table if exists public.ankr_notes cascade;
drop table if exists public.ankr_message_flags cascade;
drop table if exists public.ankr_tags cascade;

-- ============================
-- 2. Drop Functions (ankr-specific)
-- ============================

drop function if exists public.ankr_snippets_set_hash() cascade;

-- Note: we do NOT drop public.set_updated_at() as it is shared by other CRM/Blog tables.
