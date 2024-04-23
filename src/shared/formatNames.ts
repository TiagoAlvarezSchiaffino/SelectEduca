import nzh from 'nzh';

export function formatGroupName(name: string | null, userCount: number): string {
  return name ?? (userCount <= 2 ? '' : `${nzh.cn.encodeS(userCount)}`);
}

export function formatUserName(name: string | null, mood: 'friendly' | 'formal') {
  if (!name) return '';
  return mood === 'friendly' ? name.substring(Math.max(0, name.length - 2)) : name;
}