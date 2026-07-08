# REC site

Rebuild of somosrecoficial.com.br on Astro.

- Spec: `../docs/superpowers/specs/2026-04-25-rec-site-rebuild-design.md`
- Plan: `../docs/superpowers/plans/2026-04-25-rec-site-rebuild.md`

## Comandos

| Comando | Faz |
|---|---|
| `npm run dev` | dev server em http://localhost:4321 |
| `npm run build` | build de produção em `dist/` |
| `npm run preview` | preview local do build |
| `npm run test` | testes unitários (vitest) |
| `npm run test:e2e` | testes E2E (playwright) |
| `npm run lint` | type-check (astro check) |

## Stack

- Astro 6 - static site generator
- TypeScript strict
- Plain CSS com custom properties (sem framework de utility)
- d3-force - constelação de parceiros
- vitest - testes unitários
- playwright - testes E2E + snapshots
- Vercel - hosting

## Progresso — SEO, Analytics e Performance

> Log de mudanças de infraestrutura de marketing/dados (Google Search Console, Google Analytics, performance). Não confundir com o changelog de features do site — isso aqui é sobre "o site está pronto pra receber tráfego pago?".

### 2026-07-08 — Preparação pré-tráfego pago

**Contexto:** antes de rodar campanhas pagas, foi feita uma auditoria completa de SEO técnico, Analytics e performance pra garantir que o dinheiro investido em tráfego não seja desperdiçado por problemas de indexação, medição ou velocidade.

**Google Search Console**
- Domínio `somosrecoficial.com.br` verificado e sitemap (`sitemap-index.xml`) enviado.
- Auditoria completa: Páginas, Vídeos, Sitemaps, Core Web Vitals, HTTPS, Links, Segurança.
- Achado crítico: só 2 páginas estavam indexadas (home + 1 post de blog) apesar do site ter dezenas de páginas. Causa: sitemap recém-enviado, Google ainda não tinha rastreado o resto.
- Ação: solicitada indexação prioritária manual via "Inspeção de URL" para `/planos`, `/hub`, `/comunidade`, `/empresas`, `/eventos`, `/blog`.
- HTTPS: 100% ok, zero erros.
- Links externos: **0** (nenhum backlink conhecido ainda) — ponto de atenção para SEO de médio prazo.
- Core Web Vitals (dados de campo/CrUX): sem dados suficientes ainda (tráfego baixo) — deve popular sozinho conforme o volume crescer.
- GSC vinculado ao GA4 (Admin → Vínculos de produtos → Search Console).

**Google Analytics 4**
- Auditoria completa de aquisição, engajamento, retenção, tecnologia e geografia.
- Achados: tráfego majoritariamente mobile (106 vs 62 desktop), "Direct" inflado por falta de UTM em links compartilhados, indícios de tráfego de bot (Council Bluffs/IA, Warsaw) misturado nos dados, taxa de engajamento geral de 45,68%.
- Indicadores do Google (dados demográficos/interesses agregados) ativados.
- Filtro de tráfego interno configurado (regra de IP da equipe REC) — deixado em modo "Teste" por alguns dias antes de ativar exclusão definitiva.
- 2 públicos-alvo criados: "Usuários inativos por 7 dias" (reengajamento) e "Visitou Planos sem conversão" (remarketing).
- Eventos de conversão corrigidos: `qualify_lead` (clique em qualquer link de WhatsApp do site) e `close_convert_lead` (clique nos CTAs "Quero o plano semestral/anual" em `/planos`) implementados no código — antes existiam como "evento-chave" configurado no GA mas nunca disparavam porque não havia código nenhum enviando esses eventos.

**Performance mobile**
- Diagnóstico inicial (PageSpeed Insights): nota de Desempenho mobile 67/100 vs 95/100 desktop. LCP de 6,4s (meta: <2,5s).
- 3 rodadas de otimização:
  1. Imagens comprimidas/redimensionadas (~850KB economizados), fontes do Google Fonts carregando de forma assíncrona.
  2. Poster do hero comprimido (144KB→45KB) e priorizado (`fetchpriority="high"` + preload), scripts de tracking movidos para o fim do `<body>`.
  3. Meta Pixel adiado para rodar só após o `load` da página. CSS crítico inline foi avaliado e **descartado** por segurança — os bundles de CSS por página chegam a 57KB, extração manual de "crítico" sem ferramenta automatizada (`critters`) tinha risco alto de FOUC.
- Resultado: nota estagnou em 66-69/100 — o gargalo remanescente é o CSS de layout (`BaseLayout.css`, `index.css`) que segue bloqueando ~1,5s de renderização de propósito, para não arriscar flash de conteúdo sem estilo.
- CLS (Cumulative Layout Shift) mantido em 0.001 (perfeito) durante todas as rodadas — nenhuma regressão visual.

### Pendências / próximos passos

1. **Confirmar indexação** das páginas solicitadas manualmente (checar `Páginas` no GSC em ~1 semana).
2. **Decidir sobre CSS crítico**: instalar `critters` (ou equivalente) para extração automática, se quiser buscar nota 90+ no mobile.
3. **Construir backlinks**: 0 links externos hoje — considerar diretórios locais, parcerias, imprensa, Perfil da Empresa no Google.
4. **Ativar o filtro de tráfego interno** no GA (hoje em modo "Teste") depois de confirmar que a regra de IP está correta.
5. **Revisar o funil de conversão no GA** (`qualify_lead`/`close_convert_lead`) depois de alguns dias de dados reais — confirmar que os números batem com a expectativa do time.

### Outras ferramentas recomendadas (SEO/Analytics complementares)

- **Google Tag Manager** — hoje o Meta Pixel e o GA4 estão hardcoded no `BaseLayout.astro`. Migrar para GTM centraliza a gestão de tags sem precisar mexer em código toda vez, e facilita adicionar/remover pixels de campanha.
- **Google Merchant Center / Perfil da Empresa no Google** — como o REC tem presença local (Porto Alegre/Canoas), reivindicar e otimizar o Perfil da Empresa no Google ajuda em buscas locais e é gratuito.
- **Bing Webmaster Tools** — réplica gratuita do que foi feito no GSC, mas para o Bing (parcela pequena mas não-zero de buscas no Brasil).
- **Microsoft Clarity ou Hotjar** — heatmaps e gravações de sessão gratuitas, úteis para entender *por que* a taxa de rejeição da Home é alta antes de gastar em tráfego pago para essa página.
- **PageSpeed Insights API / monitoramento contínuo** — configurar um cron simples (ou usar o Search Console mesmo) para reavaliar a performance mensalmente, já que o Core Web Vitals de campo só vai aparecer com volume de tráfego.
- **Google Ads (Conversion Linking)** — ao criar a campanha, linkar as conversões do GA4 (`qualify_lead`, `close_convert_lead`) direto no Google Ads via "Importar do Google Analytics", em vez de recriar tags de conversão do zero.
