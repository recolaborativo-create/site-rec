-- =============================================================
-- Blog Automation — Tabela de Rascunhos Semanais
-- Rodar no SQL Editor do Supabase: https://supabase.com/dashboard/project/ooufmzqdiehrxnqoqvsi/sql
-- =============================================================

CREATE TABLE IF NOT EXISTS blog_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Lote (data do domingo da semana: '2026-05-31'). Agrupa os 9 posts da semana.
  -- Nome histórico 'batch_month' mantido; hoje guarda a semana, não o mês.
  batch_month TEXT NOT NULL,
  -- Posição 1-9 dentro do lote (para ordem visual estável).
  position INT NOT NULL,
  -- Categoria do post (mesmas pilares do schema do site).
  pillar TEXT NOT NULL CHECK (pillar IN ('negocios','estrategia','comunidade','eventos','mentalidade','empreendedorismo')),
  -- Conteúdo
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,         -- markdown completo do post
  -- Imagem de capa (vinda do Unsplash)
  cover_url TEXT,
  cover_alt TEXT,
  cover_credit TEXT,             -- "Foto por NOME em Unsplash"
  cover_search_query TEXT,       -- termo usado pra buscar (rastreabilidade)
  -- Autoria
  author TEXT NOT NULL DEFAULT 'Equipe REC',
  -- Estado do post
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','approved','rejected','published')),
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  -- Metadata pra auditoria
  source_topic TEXT,             -- tópico/notícia original que inspirou
  generation_model TEXT,         -- 'claude-haiku-4' ou similar
  generation_tokens INT,         -- custo aproximado
  -- Sem unicidade rígida (posição pode mudar se draft for deletado e regenerado)
  UNIQUE (batch_month, slug)
);

-- Índices para queries comuns
CREATE INDEX IF NOT EXISTS idx_drafts_batch ON blog_drafts(batch_month);
CREATE INDEX IF NOT EXISTS idx_drafts_status ON blog_drafts(status);
CREATE INDEX IF NOT EXISTS idx_drafts_batch_status ON blog_drafts(batch_month, status);

-- Trigger para atualizar updated_at automaticamente em UPDATEs
CREATE OR REPLACE FUNCTION update_blog_drafts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_blog_drafts_updated_at ON blog_drafts;
CREATE TRIGGER trg_blog_drafts_updated_at
  BEFORE UPDATE ON blog_drafts
  FOR EACH ROW
  EXECUTE FUNCTION update_blog_drafts_updated_at();

-- =============================================================
-- RLS (Row Level Security) — protege a tabela
-- Acesso só via SERVICE_ROLE key (servidor), nunca direto do browser.
-- =============================================================
ALTER TABLE blog_drafts ENABLE ROW LEVEL SECURITY;

-- Nenhuma policy criada = ninguém via anon/cliente consegue ler nem escrever.
-- O service_role bypass RLS automaticamente, então o servidor REC tem acesso total.

-- =============================================================
-- Comentários úteis pra futuros mantenedores
-- =============================================================
COMMENT ON TABLE blog_drafts IS 'Rascunhos de posts gerados automaticamente pela IA semanalmente. Após aprovação manual, viram arquivos .md no repositório.';
COMMENT ON COLUMN blog_drafts.batch_month IS 'Formato YYYY-MM-DD (domingo da semana). Agrupa os 9 posts gerados num mesmo ciclo semanal.';
COMMENT ON COLUMN blog_drafts.position IS 'Posição visual 1-9 dentro do batch (mantém ordem na página de aprovação).';
COMMENT ON COLUMN blog_drafts.content IS 'Markdown completo do post (sem frontmatter — a publicação adiciona).';
COMMENT ON COLUMN blog_drafts.status IS 'pending = aguarda revisão | approved = decidido publicar | rejected = descartado | published = já está no /blog do site.';
