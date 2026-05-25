import type { Role } from '../../../lab/types';
import { Icon } from '../../ui';

export function Attachment({
  variant,
  role,
  file,
}: {
  variant: string;
  role: Role;
  file: { name: string; meta: string };
}) {
  if (role === 'absent') return null;

  if (variant === 'inline-mention' || role === 'secondary') {
    return (
      <span className="t-mono t-small-medium px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-700">
        @{file.name}
      </span>
    );
  }

  if (variant === 'file-chip') {
    return (
      <span className="inline-flex items-center gap-2 px-2 py-1 rounded-md border border-zinc-300 bg-white t-small-regular text-zinc-700">
        <Icon name="file-text" className="size-3 text-zinc-500" />
        {file.name}
      </span>
    );
  }

  if (variant === 'drag-drop') {
    return (
      <div className="border-2 border-dashed border-zinc-300 rounded-md px-4 py-6 text-center bg-zinc-50/50 max-w-md">
        <Icon name="upload" className="size-5 text-zinc-400 mx-auto mb-2" />
        <div className="t-small-medium text-zinc-700">Glissez-déposez un document ici</div>
        <div className="t-small-regular text-zinc-500 mt-0.5">PDF, DOCX · 50 Mo max</div>
      </div>
    );
  }

  // preview-card (default)
  return (
    <div className="inline-flex items-center gap-3 px-3 py-2 rounded-lg border border-zinc-300 bg-zinc-50">
      <span className="inline-flex items-center justify-center size-8 rounded bg-white border border-zinc-200">
        <Icon name="file-text" className="size-4 text-zinc-700" />
      </span>
      <div>
        <div className="t-small-medium text-zinc-900">{file.name}</div>
        <div className="t-small-regular text-zinc-500">{file.meta}</div>
      </div>
    </div>
  );
}
