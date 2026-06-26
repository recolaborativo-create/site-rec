export function instagramLink(handle: string): string {
  return `https://instagram.com/${handle.replace('@', '')}`
}
