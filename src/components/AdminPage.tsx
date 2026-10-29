import React, { useState } from 'react';
import { Link2, Copy, MessageCircle, Heart } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { COUPLE_NAMES } from '../config/wedding';
import {
  PREFIXES,
  PrefixKey,
  buildDisplayName,
  buildGreeting,
  buildInviteLink,
  buildInviteMessage,
  cleanName,
} from '../lib/guest';

interface Generated {
  displayName: string;
  link: string;
  message: string;
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    // Fallback for non-secure contexts (e.g. LAN IP over http)
    const el = document.createElement('textarea');
    el.value = text;
    el.style.position = 'fixed';
    el.style.opacity = '0';
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    el.remove();
  }
}

const fieldCls =
  'w-full bg-white px-5 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-brand-gold/30 focus:border-brand-mocha/40 outline-none transition-all text-brand-mocha';
const buttonCls =
  'flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-sans text-xs uppercase tracking-[0.15em] font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed';

export const AdminPage: React.FC = () => {
  const [prefix, setPrefix] = useState<PrefixKey>('mr');
  const [guestName, setGuestName] = useState('');
  const [generated, setGenerated] = useState<Generated | null>(null);

  // Any edit invalidates the previous link so stale text is never copied.
  const updatePrefix = (value: PrefixKey) => { setPrefix(value); setGenerated(null); };
  const updateName = (value: string) => { setGuestName(value); setGenerated(null); };

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cleanName(guestName)) {
      toast.error('Please enter a guest name.');
      return;
    }
    const displayName = buildDisplayName(prefix, guestName);
    const link = buildInviteLink(window.location.origin, prefix, guestName);
    setGenerated({ displayName, link, message: buildInviteMessage(displayName, link) });
  };

  const handleCopy = async (text: string, label: string) => {
    await copyText(text);
    toast.success(label);
  };

  return (
    <div className="min-h-screen bg-brand-champagne text-brand-mocha font-sans px-4 py-10 sm:py-16">
      <Toaster position="top-center" />
      <div className="max-w-2xl mx-auto">
        <header className="text-center mb-10">
          <Heart className="w-6 h-6 mx-auto mb-4 text-brand-gold fill-brand-gold/20" />
          <h1 className="font-display text-4xl sm:text-5xl mb-2">{COUPLE_NAMES}</h1>
          <p className="text-[11px] uppercase tracking-[0.35em] text-brand-sand font-semibold">Invitation Link Generator</p>
        </header>

        <form onSubmit={handleGenerate} className="bg-white/80 rounded-3xl border border-brand-gold/30 shadow-[0_20px_50px_rgba(197,160,89,0.12)] p-6 sm:p-10 space-y-6">
          <div className="grid sm:grid-cols-[180px_1fr] gap-4">
            <div>
              <label htmlFor="prefix" className="block text-[10px] uppercase tracking-[0.2em] font-bold text-brand-sand mb-2">Select Prefix</label>
              <select id="prefix" className={fieldCls} value={prefix} onChange={(e) => updatePrefix(e.target.value as PrefixKey)}>
                {PREFIXES.map((p) => (
                  <option key={p.key} value={p.key}>{p.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="guest" className="block text-[10px] uppercase tracking-[0.2em] font-bold text-brand-sand mb-2">Guest Name</label>
              <input
                id="guest"
                type="text"
                placeholder="e.g. Sanjaya"
                className={fieldCls}
                value={guestName}
                onChange={(e) => updateName(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button type="submit" className={`${buttonCls} bg-brand-mocha text-brand-champagne hover:bg-brand-mocha/90`}>
              <Link2 className="w-4 h-4 text-brand-gold" /> Generate Link
            </button>
            <button
              type="button"
              disabled={!generated}
              onClick={() => generated && handleCopy(generated.link, 'Link copied!')}
              className={`${buttonCls} border border-brand-mocha/30 hover:bg-brand-gold/10`}
            >
              <Copy className="w-4 h-4" /> Copy Link Only
            </button>
            <button
              type="button"
              disabled={!generated}
              onClick={() => generated && handleCopy(generated.message, 'Message copied!')}
              className={`${buttonCls} border border-brand-mocha/30 hover:bg-brand-gold/10`}
            >
              <MessageCircle className="w-4 h-4" /> Copy Full Message
            </button>
          </div>

          {generated && (
            <div className="space-y-5 pt-2">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-brand-sand mb-2">Generated Link</p>
                <a
                  href={generated.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block break-all bg-brand-champagne/70 border border-brand-gold/30 rounded-xl px-4 py-3 text-sm underline decoration-brand-gold/50"
                >
                  {generated.link}
                </a>
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-brand-sand mb-2">Greeting</p>
                <p className="font-serif text-2xl">{buildGreeting(generated.displayName)}</p>
                <p className="font-serif italic text-brand-sand mt-1">
                  Website: “We cordially invite {generated.displayName} to celebrate our special day with us.”
                </p>
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-brand-sand mb-2">Message Preview</p>
                <pre className="whitespace-pre-wrap break-words font-sans text-sm leading-relaxed bg-white border border-stone-200 rounded-xl p-4">
                  {generated.message}
                </pre>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
