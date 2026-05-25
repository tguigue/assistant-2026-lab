import { PageShell } from '../components/sandbox/PageShell';

type Event = { time: string; status: 'ok' | 'warn' | 'err' | 'info'; line: string; meta?: string };

const EVENTS: Event[] = [
  { time: '14:23:08', status: 'ok',   line: 'flow.run · research/first-run',          meta: '312ms · 4 hits' },
  { time: '14:21:54', status: 'ok',   line: 'flow.run · draft/clausier',              meta: 'artifact saved' },
  { time: '14:18:12', status: 'warn', line: 'flow.run · internal/ambiguous',          meta: '2 matches: leroy, dupuis' },
  { time: '14:12:07', status: 'ok',   line: 'flow.run · analyse/from-matter',         meta: 'cache hit · 34ms' },
  { time: '14:04:30', status: 'info', line: 'session.start · jane.doe@doctrine.fr',   meta: 'env:local' },
  { time: '13:58:11', status: 'ok',   line: 'preset.load · A → custom',               meta: 'baseline · primitives:6' },
  { time: '13:51:02', status: 'err',  line: 'flow.run · research/oos',                meta: 'out of legal scope' },
  { time: '13:44:46', status: 'ok',   line: 'matter.open · Leroy c/ Merlin',          meta: '7 documents' },
  { time: '13:40:19', status: 'info', line: 'source.connect · Doctrine, KB',          meta: '12M + 1240' },
];

const STATUS_CLASS: Record<Event['status'], string> = {
  ok:   'term-status-ok',
  info: 'term-status-info',
  warn: 'term-status-warn',
  err:  'term-status-err',
};

const STATUS_GLYPH: Record<Event['status'], string> = {
  ok:   '✓',
  info: '•',
  warn: '⚠',
  err:  '✗',
};

export default function Activity() {
  return (
    <PageShell
      eyebrow="Logs"
      title="Activity"
      lede="Flux d’événements récents du sandbox. Toutes les entrées sont des fixtures — la sandbox n’est pas connectée à un backend."
    >
      <div className="term-block">
        <div className="term-pathline">
          <span className="term-pathline-dot" />
          <span>/var/log/assistant.log</span>
        </div>
        <div className="term-body">
          {EVENTS.map((e, i) => (
            <span key={i} className={'term-line ' + STATUS_CLASS[e.status]}>
              <span className="term-meta">{e.time}</span>
              {'  '}
              <span className={STATUS_CLASS[e.status]}>{STATUS_GLYPH[e.status]}</span>
              {' '}
              {e.line}
              {e.meta && <span className="term-meta">  ({e.meta})</span>}
            </span>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
