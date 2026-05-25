/**
 * Empty state — simple, modern chatbot greeting.
 * One line, centered. No brand chrome.
 */
export function EmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6">
      <h1 className="t-title-1 text-zinc-800 font-medium text-center max-w-xl t-balance">
        Que voulez-vous faire aujourd'hui&nbsp;?
      </h1>
    </div>
  );
}
