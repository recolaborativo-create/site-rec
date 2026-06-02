-- Estado das inscrições de empresas vindas do Google Form.
-- A planilha (CSV publicado) é a fonte dos dados; esta tabela só guarda
-- o que já foi PUBLICADO ou IGNORADO, pra não reaparecer na fila de revisão.

create table if not exists partner_submissions (
  id           bigint generated always as identity primary key,
  submission_key text not null unique,   -- chave estável vinda do CSV (timestamp|instagram|n)
  status       text not null default 'published' check (status in ('published','dismissed')),
  partner_id   text,                      -- id do JSON gerado em src/content/partners
  partner_name text,
  created_at   timestamptz not null default now()
);

create index if not exists partner_submissions_key_idx on partner_submissions (submission_key);
