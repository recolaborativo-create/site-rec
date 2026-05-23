# 🤖 Blog Automático — REC Colaborativo

Sistema que gera 9 posts por mês usando IA, deixa pra revisão humana, e
publica os aprovados como `.md` no repositório (Vercel rebuilda automático).

## Como funciona, do dia 1 do mês até o post no ar

```
DIA 1, 06h BRT
   │
   ▼
1. Cron Vercel chama POST /api/cron/generate-blog-drafts
   ├─ Busca notícias do mês passado (Brave Search ou tópicos evergreen)
   ├─ Chama Claude com prompt master + regras de escrita
   ├─ Recebe 9 posts em JSON
   ├─ Pra cada um: busca imagem no Unsplash
   ├─ Salva 9 linhas em blog_drafts (Supabase, status=pending)
   └─ Manda email pro BLOG_NOTIFY_EMAIL com link pra aprovação
        │
        ▼
2. Você abre o link → /aprovacao-blog/2026-06
   ├─ Auth via cookie rec_mod (precisa ter logado em /moderacao antes)
   ├─ Vê os 9 posts no layout idêntico ao /blog
   ├─ Edita inline (clica no texto, edita, sai do foco = salva)
   ├─ Aprova/rejeita cada um (botões verde/vermelho)
   └─ Clica "publicar aprovados"
        │
        ▼
3. /api/blog-mod/publish faz pra cada aprovado:
   ├─ Monta arquivo .md com frontmatter correto
   ├─ Commita em site/src/content/blog/{slug}.md via GitHub API
   ├─ Marca status=published no Supabase
   └─ Vercel detecta push → rebuilda → post sai no ar (~2-3 min)
```

## Setup inicial (uma vez só)

### 1. Rodar a migration no Supabase
Abrir o SQL Editor do Supabase ([link](https://supabase.com/dashboard/project/ooufmzqdiehrxnqoqvsi/sql))
e colar o conteúdo de `migrations/001_blog_drafts.sql`. Executar.

### 2. Configurar env vars na Vercel
Painel → Settings → Environment Variables. Veja `.env.example` na raiz do `site/`
pra lista completa. As novas pro blog auto são:

- `ANTHROPIC_API_KEY` — chave da Anthropic (obrigatório)
- `ANTHROPIC_MODEL` — default `claude-haiku-4-5` (pode trocar pra sonnet)
- `UNSPLASH_ACCESS_KEY` — chave Unsplash
- `BRAVE_SEARCH_KEY` — opcional, busca notícias reais
- `GITHUB_PAT` — Personal Access Token com escopo `repo`
- `GITHUB_OWNER` — default `HenriqueCallefi`
- `GITHUB_REPO` — default `REC-HUB-COMPLETO`
- `GITHUB_BRANCH` — default `main`
- `CRON_SECRET` — qualquer string aleatória (token pra invocar manualmente)
- `BLOG_NOTIFY_EMAIL` — email pra receber notificação mensal

### 3. Cron já está configurado em `vercel.json`
```json
"crons": [
  { "path": "/api/cron/generate-blog-drafts", "schedule": "0 9 1 * *" }
]
```
Schedule `0 9 1 * *` = às 09:00 UTC do dia 1 de cada mês = 06:00 BRT.

## Rodar manualmente (testes)

### Gerar drafts localmente sem gravar no banco
```bash
node scripts/blog-auto/generate-monthly-drafts.mjs --month 2026-06 --dry-run
```

### Gerar e gravar no Supabase
```bash
node scripts/blog-auto/generate-monthly-drafts.mjs --month 2026-06
```

### Trigger do endpoint do cron via curl (com auth manual)
```bash
curl -X GET \
  -H "Authorization: Bearer $CRON_SECRET" \
  https://recolaborativo.com.br/api/cron/generate-blog-drafts
```

## Como editar as regras de escrita

`scripts/blog-auto/prompts/writing-rules.md` — arquivo markdown editável que vai
direto pro prompt da IA. Cada mudança aqui afeta o próximo ciclo automaticamente.

## Como mudar a distribuição dos 9 posts

`scripts/blog-auto/prompts/master-prompt.md` — tem a tabela de distribuição
(2 plataformas, 2 negócios, 2 networking, 2 histórias, 1 mentalidade). Editar
livremente.

## Custos esperados

| Item | Custo mensal |
|---|---|
| Anthropic (haiku, 9 posts) | R$ 3-8 |
| Brave Search (2000 free/mês) | R$ 0 |
| Unsplash (50 req/h) | R$ 0 |
| Vercel Cron | R$ 0 |
| **Total** | **~R$ 5-10/mês** |

## Troubleshooting

### "drafts não aparecem em /aprovacao-blog/AAAA-MM"
- Verifica se o cron rodou: Vercel Dashboard → Functions → Cron logs
- Verifica se tem linhas na tabela `blog_drafts` com `batch_month` igual
- Verifica logs do endpoint `/api/cron/generate-blog-drafts`

### "Página retorna 404"
- Você não tem o cookie `rec_mod` válido. Acesse `/moderacao?s=SEU_MOD_SECRET`
  uma vez pra "logar" (cookie dura 12h).

### "Erro ao publicar — GitHub 401/403"
- `GITHUB_PAT` ausente ou sem permissão `repo`
- PAT expirou (PATs clássicos têm validade configurável)

### "IA gerou texto com travessões / regras quebradas"
- Edita `prompts/writing-rules.md` pra reforçar a regra
- Aumenta `temperature` no `lib/anthropic.mjs` se quer mais variedade, ou baixa
  pra ser mais previsível
- Mudar pra modelo melhor: `ANTHROPIC_MODEL=claude-sonnet-4-5`

### "Cron Vercel não está rodando"
- Cron só funciona em projetos com plano Pro (gratuito não tem cron)
- Alternativa: usar GitHub Actions com schedule cron + chamar o endpoint
