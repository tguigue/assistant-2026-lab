import { Icon } from '../ui';

export function InputField({ placeholder = 'Posez une question à l’Assistant…' }: { placeholder?: string }) {
  return (
    <div className="rounded-xl border border-zinc-300 bg-white p-4 focus-within:border-zinc-900 transition-colors">
      <textarea
        className="w-full t-large-regular text-zinc-900 placeholder:text-zinc-400 outline-none resize-none bg-transparent"
        rows={2}
        placeholder={placeholder}
      />
      <div className="flex items-center justify-between mt-3">
        <button className="t-small-regular text-zinc-400 hover:text-zinc-700 inline-flex items-center gap-1.5">
          <Icon name="paperclip" className="size-3.5" /> Joindre
        </button>
        <button className="inline-flex items-center justify-center size-8 rounded-md bg-zinc-900 text-white hover:bg-zinc-800">
          <Icon name="arrow-up" className="size-4" />
        </button>
      </div>
    </div>
  );
}
