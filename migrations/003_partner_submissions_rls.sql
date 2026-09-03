-- =============================================================
-- RLS (Row Level Security) — protege partner_submissions
-- Acesso só via SERVICE_ROLE key (servidor), nunca direto do browser.
-- Mesmo padrão de scripts/blog-auto/migrations/001_blog_drafts.sql:
-- nenhuma policy pública é criada, então anon/cliente não tem acesso
-- nenhum; o service_role bypassa RLS automaticamente e mantém o
-- servidor REC com acesso total.
--
-- Aplicar manualmente no SQL Editor do Supabase de produção
-- (esta migration não foi aplicada automaticamente por esta auditoria).
-- =============================================================

ALTER TABLE partner_submissions ENABLE ROW LEVEL SECURITY;
