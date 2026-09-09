import { useEffect, useState } from 'react';
import { ArrowLeft, Check, Clipboard, ExternalLink, Link2, RefreshCw, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface ShortLink {
  code: string;
  target: string;
  createdAt: number;
}

interface UrlShortenerProps {
  onBack: () => void;
}

const STORAGE_KEY = 'arrange-short-links';

function readLinks(): ShortLink[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as ShortLink[];
  } catch {
    return [];
  }
}

const aliasWords = [
  'amber', 'bright', 'calm', 'clever', 'coral', 'crisp', 'dawn', 'fresh', 'golden',
  'happy', 'jade', 'kind', 'lucky', 'mint', 'neat', 'quiet', 'rapid', 'sky', 'sunny', 'swift',
];

function makeAlias() {
  const first = aliasWords[Math.floor(Math.random() * aliasWords.length)];
  const second = aliasWords[Math.floor(Math.random() * aliasWords.length)];
  const number = Math.floor(Math.random() * 90) + 10;
  return `${first}-${second}-${number}`;
}

export function UrlShortener({ onBack }: UrlShortenerProps) {
  const [target, setTarget] = useState('');
  const [links, setLinks] = useState<ShortLink[]>(readLinks);
  const [alias, setAlias] = useState(makeAlias);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const aliasAvailable = alias.length >= 3 && !links.some((link) => link.code === alias);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(links));
  }, [links]);

  const shorten = () => {
    const normalizedTarget = target.trim();
    let parsedUrl: URL;

    try {
      parsedUrl = new URL(normalizedTarget);
    } catch {
      toast.error('Enter a complete URL, including https://');
      return;
    }

    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      toast.error('Only http:// and https:// links are supported');
      return;
    }

    const normalizedAlias = alias.trim().toLowerCase();
    if (!/^[a-z0-9-]+$/.test(normalizedAlias) || !aliasAvailable) {
      toast.error('Choose an available URL name');
      return;
    }

    const link = { code: normalizedAlias, target: parsedUrl.toString(), createdAt: Date.now() };
    setLinks((current) => [link, ...current]);
    setTarget('');
    setAlias(makeAlias());
    toast.success('Short link created');
  };

  const shortUrl = (code: string) => `${window.location.origin}/s/${code}`;

  const copy = async (code: string) => {
    await navigator.clipboard.writeText(shortUrl(code));
    setCopiedCode(code);
    window.setTimeout(() => setCopiedCode(null), 1600);
  };

  return (
    <main className="mx-auto max-w-3xl px-5 py-8 sm:px-8 sm:py-12">
      <button type="button" onClick={onBack} className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-ink-muted transition hover:text-ink dark:text-white/60 dark:hover:text-white">
        <ArrowLeft className="h-4 w-4" /> Back to tools
      </button>

      <section className="rounded-2xl border border-border bg-white p-6 shadow-card dark:border-dark-border dark:bg-dark-surface sm:p-8">
        <div className="flex items-start gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-700 dark:bg-orange-400/15 dark:text-orange-300">
            <Link2 className="h-5 w-5" />
          </span>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-orange-700 dark:text-orange-300">Link tools</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink dark:text-white">Shorten a URL</h1>
            <p className="mt-2 text-sm leading-6 text-ink-muted">Create a compact link for sharing. This browser-only version keeps links on this device.</p>
          </div>
        </div>

        <form onSubmit={(event) => { event.preventDefault(); shorten(); }} className="mt-8 space-y-4">
          <input value={target} onChange={(event) => setTarget(event.target.value)} type="url" required placeholder="https://example.com/a-very-long-url" aria-label="Long URL" className="h-11 w-full rounded-xl border border-border bg-surface-subtle px-4 text-sm text-ink outline-none transition placeholder:text-ink-faint focus:border-accent focus:ring-2 focus:ring-accent/10 dark:border-dark-border dark:bg-dark-bg dark:text-white dark:placeholder:text-white/40" />
          <div>
            <label htmlFor="short-name" className="mb-2 block text-xs font-semibold text-ink-muted dark:text-white/60">Your short name</label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="flex min-w-0 flex-1 items-center rounded-xl border border-border bg-surface-subtle focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/10 dark:border-dark-border dark:bg-dark-bg">
                <span className="pl-4 text-sm text-ink-faint dark:text-white/40">/s/</span>
                <input id="short-name" value={alias} onChange={(event) => setAlias(event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))} aria-label="Short URL name" className="h-11 min-w-0 flex-1 bg-transparent px-2 text-sm text-ink outline-none dark:text-white" />
                <span className={`mr-3 whitespace-nowrap text-xs font-medium ${aliasAvailable ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>{aliasAvailable ? 'Available' : 'Taken'}</span>
              </div>
              <button type="button" onClick={() => setAlias(makeAlias())} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-border px-4 text-sm font-medium text-ink-muted transition hover:bg-surface-muted hover:text-ink dark:border-dark-border dark:text-white/70 dark:hover:bg-white/10 dark:hover:text-white"><RefreshCw className="h-4 w-4" /> New name</button>
              <button type="submit" disabled={!aliasAvailable} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-ink px-5 text-sm font-semibold text-white transition hover:bg-ink/85 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-white/85">Shorten URL</button>
            </div>
          </div>
        </form>
      </section>

      {links.length > 0 && <section className="mt-8">
        <div className="mb-3 flex items-center justify-between"><h2 className="text-sm font-semibold text-ink dark:text-white">Your links</h2><span className="text-xs text-ink-faint dark:text-white/40">Stored locally</span></div>
        <div className="space-y-3">
          {links.map((link) => <article key={link.code} className="flex flex-col gap-3 rounded-xl border border-border bg-white p-4 dark:border-dark-border dark:bg-dark-surface sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0"><a href={shortUrl(link.code)} className="block truncate text-sm font-semibold text-accent hover:underline">{shortUrl(link.code)}</a><p className="mt-1 truncate text-xs text-ink-muted dark:text-white/55">{link.target}</p></div>
            <div className="flex shrink-0 items-center gap-1"><button type="button" onClick={() => copy(link.code)} aria-label="Copy short URL" className="inline-flex h-9 items-center gap-2 rounded-lg px-3 text-xs font-semibold text-ink-muted transition hover:bg-surface-muted hover:text-ink dark:text-white/60 dark:hover:bg-white/10 dark:hover:text-white">{copiedCode === link.code ? <Check className="h-4 w-4 text-emerald-500" /> : <Clipboard className="h-4 w-4" />}<span>{copiedCode === link.code ? 'Copied' : 'Copy'}</span></button><a href={link.target} target="_blank" rel="noreferrer" aria-label="Open original URL" className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-ink-muted transition hover:bg-surface-muted hover:text-ink dark:text-white/60 dark:hover:bg-white/10 dark:hover:text-white"><ExternalLink className="h-4 w-4" /></a><button type="button" onClick={() => setLinks((current) => current.filter((item) => item.code !== link.code))} aria-label="Delete short URL" className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-ink-muted transition hover:bg-red-50 hover:text-red-600 dark:text-white/60 dark:hover:bg-white/10 dark:hover:text-red-300"><Trash2 className="h-4 w-4" /></button></div>
          </article>)}
        </div>
      </section>}
    </main>
  );
}