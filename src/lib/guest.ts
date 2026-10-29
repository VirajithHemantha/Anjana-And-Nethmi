import { WEDDING } from '../config/wedding';

export const PREFIXES = [
  { key: 'mr', label: 'Mr.' },
  { key: 'mrs', label: 'Mrs.' },
  { key: 'miss', label: 'Miss' },
  { key: 'mr-mrs', label: 'Mr. & Mrs.' },
  { key: 'family', label: 'Family' },
  { key: 'dear', label: 'Dear' },
] as const;

export type PrefixKey = (typeof PREFIXES)[number]['key'];

export const isPrefixKey = (value: unknown): value is PrefixKey =>
  PREFIXES.some((p) => p.key === value);

export const cleanName = (name: string) => name.trim().replace(/\s+/g, ' ');

// "Dear" is a message style, not a title: the greeting already starts with "Dear".
export function buildDisplayName(prefix: PrefixKey, rawName: string): string {
  const name = cleanName(rawName);
  if (!name) return '';
  switch (prefix) {
    case 'mr': return `Mr. ${name}`;
    case 'mrs': return `Mrs. ${name}`;
    case 'miss': return `Miss ${name}`;
    case 'mr-mrs': return `Mr. & Mrs. ${name}`;
    case 'family': return `${name} and Family`;
    case 'dear': return name;
  }
}

export const buildGreeting = (displayName: string) => `Dear ${displayName} ❤️`;

// {baseURL}/{guestName}; the prefix rides along as ?p= so the invitation can show the full title.
export function buildInviteLink(baseUrl: string, prefix: PrefixKey, rawName: string): string {
  const base = baseUrl.replace(/\/+$/, '');
  const path = encodeURIComponent(cleanName(rawName));
  return prefix === 'dear' ? `${base}/${path}` : `${base}/${path}?p=${prefix}`;
}

export function buildInviteMessage(displayName: string, link: string): string {
  return `${buildGreeting(displayName)}

With joyful hearts, we warmly invite you to celebrate one of the most special days of our lives as we begin our journey together.

Please view our wedding invitation and all the event details through the link below 🌐:

${link}

Your presence would truly mean the world to us, and we would be honored to celebrate this beautiful moment together.

With love,
❤️ ${WEDDING.groom.name} & ${WEDDING.bride.name}`;
}

// Reads the guest from the current URL (e.g. /Sanjaya?p=mr). Returns '' when there is none.
export function getGuestFromLocation(loc: Location = window.location): string {
  const segment = loc.pathname.split('/').filter(Boolean)[0];
  if (!segment) return '';
  let name: string;
  try {
    name = decodeURIComponent(segment);
  } catch {
    return '';
  }
  const p = new URLSearchParams(loc.search).get('p');
  return buildDisplayName(isPrefixKey(p) ? p : 'dear', name);
}
