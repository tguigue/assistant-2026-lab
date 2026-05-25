import type { Role } from '../../../lab/types';

export function TypingIndicator({ variant, role }: { variant: string; role: Role }) {
  if (role === 'absent') return null;

  if (role === 'secondary' || variant === 'pulse-dot') {
    return <span className="inline-block size-2 rounded-full bg-zinc-400 animate-pulse" />;
  }

  if (variant === 'labeled') {
    return (
      <div className="inline-flex items-center gap-2 t-small-regular text-zinc-500">
        <Dots /> Doctrine réfléchit…
      </div>
    );
  }

  if (variant === 'shimmer') {
    return (
      <div className="h-3 w-32 rounded bg-gradient-to-r from-zinc-100 via-zinc-300 to-zinc-100 bg-[length:200%_100%] animate-[shimmer_1.4s_linear_infinite]" />
    );
  }

  // three-dot (default)
  return <Dots />;
}

function Dots() {
  return (
    <span className="inline-flex items-center gap-1">
      <span className="size-1.5 rounded-full bg-zinc-500 animate-[bounce_1s_infinite_0ms]" />
      <span className="size-1.5 rounded-full bg-zinc-500 animate-[bounce_1s_infinite_150ms]" />
      <span className="size-1.5 rounded-full bg-zinc-500 animate-[bounce_1s_infinite_300ms]" />
    </span>
  );
}
