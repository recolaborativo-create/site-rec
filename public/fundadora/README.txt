REC site - founder photography
==============================

Drop photos of the founder (Andiara Bohrer) here. The site reads from these
exact filenames — rename your photos to match before saving.

NOMES ESPERADOS PELO SITE
=========================

fundadora-home.jpg            Foto principal na seção "Fundadora" da home
                              Aspecto 4:5 (vertical/portrait)
                              ~1000x1250px ideal, qualidade JPEG 80
                              Se faltar: aparece um gradient teal com label

fundadora-sobre.jpg           Reservada pra futura página /sobre dedicada
                              Aspecto 16:9 (horizontal)
                              ~1600x900px ideal

fundadora-evento-1.jpg        Foto da fundadora em evento (livre)
fundadora-evento-2.jpg        Idem - segunda opção
fundadora-evento-3.jpg        Idem - terceira opção
                              Qualquer aspecto - usadas como secundárias
                              em blog/eventos quando publicar conteúdo

DICAS DE PRODUÇÃO
=================
- Iluminação natural quando possível (sem flash duro)
- Cores quentes / paleta da REC (verde teal + roxo combinam com fundo neutro)
- Sem filtros agressivos (preserva autenticidade)
- Salvar como JPEG qualidade 80 (~200-400KB cada)

ONDE CADA UMA APARECE NO SITE
==============================

| Arquivo                    | Aparece em               | Componente                        |
|---|---|---|
| fundadora-home.jpg         | Home → seção Fundadora   | src/pages/index.astro             |
| fundadora-sobre.jpg        | (reservada futura /sobre)| -                                  |
| fundadora-evento-1.jpg     | (livre - blog/agenda)    | -                                  |
| fundadora-evento-2.jpg     | (livre - blog/agenda)    | -                                  |
| fundadora-evento-3.jpg     | (livre - blog/agenda)    | -                                  |

FALLBACK
========
Se um arquivo faltar, o site não quebra — mostra um gradient com placeholder.
