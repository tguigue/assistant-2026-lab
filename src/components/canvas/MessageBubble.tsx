import type { ReactNode } from 'react';

export function UserBubble({ children }: { children: ReactNode }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[80%] px-4 py-2.5 rounded-2xl rounded-br-md bg-zinc-900 text-white t-large-regular">
        {children}
      </div>
    </div>
  );
}

export function AssistantBubble({ children }: { children: ReactNode }) {
  return (
    <div className="max-w-[90%]">
      <div className="t-legal-large text-zinc-900">{children}</div>
    </div>
  );
}
