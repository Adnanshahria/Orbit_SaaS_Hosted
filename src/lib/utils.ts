import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function ensureAbsoluteUrl(url: string | undefined): string {
  if (!url) return '#';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `https://${url}`;
}

export type RichSegment = {
  text: string;
  bold: boolean;
  card: boolean;
  whiteCard: boolean;
  greenCard?: boolean;
  color?: 'green' | 'gold' | 'white';
};

/** Parse rich markers:
 * **bold**, [[gold-card]], {{white-card}}, ==green-card==
 * **[[bold+gold-card]]**, **{{bold+white-card}}**, **==bold+green-card==**
 * <<green-text>>, **<<bold+green-text>>**
 * ((gold-text)), **((bold+gold-text))**
 * ||white-text||, **||bold+white-text||**
 */
export function parseRichText(str: string): RichSegment[] {
  if (!str) return [];
  const parts: RichSegment[] = [];

  // 1: **[[card]]**, 2: **{{whiteCard}}**, 3: **==greenCard==**, 4: **<<greenText>>**, 5: **((goldText))**, 6: **||whiteText||**, 7: **bold**
  // 8: [[card]], 9: {{whiteCard}}, 10: ==greenCard==, 11: <<greenText>>, 12: ((goldText)), 13: ||whiteText||
  const regex = /\*\*\[\[(.+?)\]\]\*\*|\*\*\{\{(.+?)\}\}\*\*|\*\*\=\=(.+?)\=\=\*\*|\*\*\<\<(.+?)\>\>\*\*|\*\*\(\((.+?)\)\)\*\*|\*\*\|\|(.+?)\|\|\*\*|\*\*(.+?)\*\*|\[\[(.+?)\]\]|\{\{(.+?)\}\}|\=\=(.+?)\=\=|\<\<(.+?)\>\>|\(\((.+?)\)\)|\|\|(.+?)\|\|/g;
  let last = 0;
  let m: RegExpExecArray | null;

  while ((m = regex.exec(str)) !== null) {
    if (m.index > last) parts.push({ text: str.slice(last, m.index), bold: false, card: false, whiteCard: false });

    if (m[1] !== undefined) parts.push({ text: m[1], bold: true, card: true, whiteCard: false }); // **[[ ]]**
    else if (m[2] !== undefined) parts.push({ text: m[2], bold: true, card: false, whiteCard: true }); // **{{ }}**
    else if (m[3] !== undefined) parts.push({ text: m[3], bold: true, card: false, whiteCard: false, greenCard: true }); // **== ==**
    else if (m[4] !== undefined) parts.push({ text: m[4], bold: true, card: false, whiteCard: false, color: 'green' }); // **<< >>**
    else if (m[5] !== undefined) parts.push({ text: m[5], bold: true, card: false, whiteCard: false, color: 'gold' }); // **(( ))**
    else if (m[6] !== undefined) parts.push({ text: m[6], bold: true, card: false, whiteCard: false, color: 'white' }); // **|| ||**
    else if (m[7] !== undefined) parts.push({ text: m[7], bold: true, card: false, whiteCard: false }); // ** **

    else if (m[8] !== undefined) parts.push({ text: m[8], bold: false, card: true, whiteCard: false }); // [[ ]]
    else if (m[9] !== undefined) parts.push({ text: m[9], bold: false, card: false, whiteCard: true }); // {{ }}
    else if (m[10] !== undefined) parts.push({ text: m[10], bold: false, card: false, whiteCard: false, greenCard: true }); // == ==
    else if (m[11] !== undefined) parts.push({ text: m[11], bold: false, card: false, whiteCard: false, color: 'green' }); // << >>
    else if (m[12] !== undefined) parts.push({ text: m[12], bold: false, card: false, whiteCard: false, color: 'gold' }); // (( ))
    else if (m[13] !== undefined) parts.push({ text: m[13], bold: false, card: false, whiteCard: false, color: 'white' }); // || ||

    last = m.index + m[0].length;
  }

  if (last < str.length) parts.push({ text: str.slice(last), bold: false, card: false, whiteCard: false });
  return parts.length ? parts : [{ text: str, bold: false, card: false, whiteCard: false }];
}
