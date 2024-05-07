import pinyin from 'tiny-pinyin';

import { NextRouter } from 'next/router';

export function Name(s: string | null): boolean {
  return !!s && s.length >= 2 && pinyin.parse(s).every(token => token.type === 2);
}

export function toPinyin(s: string) {
  return pinyin.convertToPinyin(s, /*separator=*/ '', /*lowerCase=*/ true);
}

export function formatUserName(name: string | null, mood?: 'friendly' | 'formal') {
  if (!name) return '（Anonymous）';
  return mood === 'friendly' ? name.substring(Math.max(0, name.length - 2)) : name;
}

export function prettifyDuration(from: Date | string, to: Date | string) {
  return `${diffInMinutes(from, to)} minutes`;
}

export function prettifyDate(str: Date | string) {
  const date = new Date(str);
  const now = new Date();
  const dim = diffInMinutes(date, now);
  if (dim < 1) return `Just now`;
  if (dim < 60) return `${dim} minutes ago`;
  if (dim < 24 * 60) return `${Math.floor(dim / 60)} hours ago`;
  if (dim < 30 * 24 * 60) return `${Math.floor(dim / 24 / 60)} days ago`;
  if (date.getFullYear() == now.getFullYear()) {
    return date.toLocaleDateString('en', { day: 'numeric', month: 'short' });
  }
  return date.toLocaleDateString('en', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function diffInMinutes(from: Date | string, to: Date | string): number {
  return Math.floor((new Date(to).getTime() - new Date(from).getTime()) / 1000 / 60);
}

export function compareUUID(id1: string, id2: string): number {
  return id1.localeCompare(id2);
}

export function parseQueryStringOrUnknown(router: NextRouter, slug: string): string {
  return parseQueryString(router, slug) ?? "unknown";
}

export function parseQueryString(router: NextRouter, slug: string): string | null {
  return typeof router.query[slug] === 'string' ? router.query[slug] as string : null;
}