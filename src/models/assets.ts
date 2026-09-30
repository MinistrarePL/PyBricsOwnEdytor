const ASSET = 'https://assets.education.lego.com/v3/assets/blt293eea581807678a';

export function legoPdf(path: string): string {
  return `${ASSET}/${path}?locale=en-us`;
}
