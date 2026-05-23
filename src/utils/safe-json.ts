// Stringifica um valor pra embedar dentro de <script type="application/json"> ou
// <script type="application/ld+json"> sem risco de XSS. JSON.stringify cru pode
// ser quebrado por dados contendo "</script>" ou "<!--" — esses padrões fecham
// o bloco e permitem injeção de HTML/JS subsequente.
//
// Estratégia: trocar caracteres perigosos pela forma escapada \uXXXX,
// que mantém o JSON 100% válido e idêntico quando parseado, mas não é
// reconhecido pelo HTML parser como tag/comment delimiter. Também escapamos
// U+2028 e U+2029 (LINE/PARAGRAPH SEPARATOR) porque eles são válidos em JSON
// mas quebram o parser JavaScript se o JSON for inline em <script>.
//
// Uso:
//   <script type="application/json" set:html={safeJson(data)}></script>
const U2028 = new RegExp('\\u2028', 'g')
const U2029 = new RegExp('\\u2029', 'g')

export function safeJson(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(U2028, '\\u2028')
    .replace(U2029, '\\u2029')
}
