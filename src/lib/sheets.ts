import { APPS_SCRIPT_URL } from '../config/wedding';

export interface WishRecord {
  name: string;
  message: string;
  timestamp: string;
}

function requireUrl(): string {
  if (!APPS_SCRIPT_URL) throw new Error('VITE_GOOGLE_APPS_SCRIPT_URL is not configured.');
  return APPS_SCRIPT_URL;
}

// text/plain keeps this a "simple" request, so Apps Script needs no CORS preflight.
export async function submitToSheet(sheet: 'RSVP' | 'WISHES', data: Record<string, string>) {
  const res = await fetch(requireUrl(), {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ sheet, ...data }),
  });
  const json = await res.json();
  if (!json.ok) throw new Error(json.error || 'Submission failed');
}

export async function fetchWishes(): Promise<WishRecord[]> {
  const res = await fetch(`${requireUrl()}?sheet=WISHES`);
  const json = await res.json();
  if (!json.ok) throw new Error(json.error || 'Could not load wishes');
  return json.wishes as WishRecord[];
}
