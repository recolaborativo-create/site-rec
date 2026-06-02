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
