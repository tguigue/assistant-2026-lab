import type { FlowLine } from '../../sandbox/flowVariants';

const KIND_CLASS: Record<FlowLine['kind'], string> = {
  cmd:    'term-key',
  ok:     'term-status-ok',
  info:   'term-status-info',
  arrow:  'term-status-arrow',
  warn:   'term-status-warn',
  err:    'term-status-err',
  space:  '',
  plain:  '',
};

export function TerminalBlock({
  path,
  lines,
  quote,
  citations,
}: {
  path: string;
  lines: FlowLine[];
  quote?: string;
  citations?: string[];
}) {
  return (
    <div className="term-block">
      <div className="term-pathline">
        <span className="term-pathline-dot" />
        <span>{path}</span>
      </div>
      <div className="term-body">
        {lines.length === 0 ? (
          <span className="term-status-info">Cliquez sur Run pour démarrer.</span>
        ) : (
          lines.map((l, i) =>
            l.kind === 'space' ? (
              <span key={i} className="term-line">&nbsp;</span>
            ) : (
              <span key={i} className={'term-line ' + KIND_CLASS[l.kind]}>
                {l.text}
                {l.meta && (
                  <>
                    <span className="term-meta">{'  '}({l.meta})</span>
                  </>
                )}
              </span>
            )
          )
        )}
        {quote && (
          <>
            <span className="term-line">&nbsp;</span>
            <p className="term-quote">« {quote} »</p>
            {citations && citations.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {citations.map((c) => (
                  <span key={c} className="cite-pill">{c}</span>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
