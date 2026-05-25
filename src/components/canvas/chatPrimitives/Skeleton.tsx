import type { Role } from '../../../lab/types';

export function Skeleton({ variant, role }: { variant: string; role: Role }) {
  if (role === 'absent') return null;

  if (variant === 'inline-pulse' || role === 'secondary') {
    return <span className="inline-block h-3 w-20 rounded bg-zinc-200 animate-pulse" />;
  }

  if (variant === 'card') {
    return (
      <div className="border border-zinc-200 rounded-md p-4 max-w-md">
        <div className="h-3 w-2/3 rounded bg-zinc-200 animate-pulse mb-3" />
        <div className="h-3 w-full rounded bg-zinc-100 animate-pulse mb-1.5" />
        <div className="h-3 w-5/6 rounded bg-zinc-100 animate-pulse mb-1.5" />
        <div className="h-3 w-1/2 rounded bg-zinc-100 animate-pulse" />
      </div>
    );
  }

  // text-lines (default)
  return (
    <div className="space-y-2 max-w-2xl">
      <div className="h-3 w-3/4 rounded bg-zinc-200 animate-pulse" />
      <div className="h-3 w-full rounded bg-zinc-200 animate-pulse" />
      <div className="h-3 w-5/6 rounded bg-zinc-200 animate-pulse" />
      <div className="h-3 w-2/3 rounded bg-zinc-200 animate-pulse" />
    </div>
  );
}
