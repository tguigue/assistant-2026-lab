import type { Role } from '../../../lab/types';

export function StreamingCursor({ variant, role }: { variant: string; role: Role }) {
  if (role === 'absent') return null;
  const opacity = role === 'secondary' ? 'opacity-50' : '';

  if (variant === 'underscore') {
    return <span className={`inline-block animate-pulse ${opacity}`}>_</span>;
  }
  if (variant === 'static-dot') {
    return <span className={`inline-block size-1.5 rounded-full bg-zinc-700 mx-0.5 align-middle ${opacity}`} />;
  }
  // bar (default)
  return <span className={`inline-block animate-pulse font-mono ${opacity}`}>▍</span>;
}
