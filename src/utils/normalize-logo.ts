// Normaliza a logo enviada (qualquer formato/tamanho) pro padrão da constelação:
// autocrop das bordas + centralizada numa caixa 400x240 com fundo branco.
import sharp from 'sharp'

const BOX_W = 400
const BOX_H = 240
const PAD = 22

export async function normalizeLogo(input: Buffer): Promise<Buffer> {
  const inner = sharp(input).flatten({ background: '#ffffff' })
  // remove margem uniforme em volta da arte
  let trimmed: Buffer
  try {
    trimmed = await inner.clone().trim({ threshold: 10 }).png().toBuffer()
  } catch {
    trimmed = await inner.clone().png().toBuffer()
  }
  // encaixa dentro da caixa (com respiro) sobre branco
  return sharp(trimmed)
    .resize(BOX_W - 2 * PAD, BOX_H - 2 * PAD, {
      fit: 'contain',
      background: '#ffffff',
    })
    .extend({ top: PAD, bottom: PAD, left: PAD, right: PAD, background: '#ffffff' })
    .flatten({ background: '#ffffff' })
    .png({ compressionLevel: 9 })
    .toBuffer()
}
