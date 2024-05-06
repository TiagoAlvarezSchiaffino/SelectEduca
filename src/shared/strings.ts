import pinyin from 'tiny-pinyin';
import nzh from 'nzh';

export function Name(s: string | null): boolean {
  return !!s && s.length >= 2 && pinyin.parse(s).every(token => token.type === 2);
}

export function toPinyin(s: string) {
  return pinyin.convertToPinyin(s, /*separator=*/ '', /*lowerCase=*/ true);
}

export function formatUserName(name: string | null, mood: 'friendly' | 'formal') {
  if (!name) return '';
  return mood === 'friendly' ? name.substring(Math.max(0, name.length - 2)) : name;
}

export function formatGroupName(name: string | null, userCount: number): string {
  return name ?? `${(userCount)}`;
}

/**
 * Convert a number into Chinese presentation, e.g. "十三".
 */
export function (n: number): string {
  return nzh.cn.encodeS(n);
}

export function prettifyDuration(from: Date | string, to: Date | string) {
  return `${diffInMinutes(from, to)}`;
}

export function prettifyDate(str: Date | string) {
  const date = new Date(str);
  const now = new Date();
  const dim = diffInMinutes(date, now);
  if (dim < 24 * 60) return `${Math.floor(dim / 60)} `;
  if (dim < 30 * 24 * 60) return `${Math.floor(dim / 24 / 60)} `;
  if (date.getFullYear() == now.getFullYear()) {
    return date.toLocaleDateString('', { day: 'numeric', month: 'short' });
  }
  return date.toLocaleDateString('', { day: 'numeric', month: 'short', year: 'numeric' });
}

// TODO: Sort out this Date-is-not-actually-string nonsense
export function diffInMinutes(from: Date | string, to: Date | string): number {
  return Math.floor((new Date(to).getTime() - new Date(from).getTime()) / 1000 / 60) ;
}

export function compareUUID(id1: string, id2: string): number {
  return id1.localeCompare(id2);
}