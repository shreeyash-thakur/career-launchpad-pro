interface Props {
  pageWidth: number;
  pageHeight: number;
  pageCount: number;
}

export function PageBreakOverlay({ pageWidth, pageHeight, pageCount }: Props) {
  if (pageCount <= 1) return null;
  const lines = Array.from({ length: pageCount - 1 }, (_, i) => (i + 1) * pageHeight);

  return (
    <div className="pointer-events-none absolute inset-0" style={{ width: pageWidth }}>
      {lines.map((top, i) => (
        <div key={top} className="absolute left-0 right-0" style={{ top }}>
          <div className="border-t-2 border-dashed border-neutral-400" />
          <span className="absolute right-0 top-1.5 rounded-b bg-neutral-500 px-2 py-0.5 text-[11px] font-medium text-white">
            Page {i + 2}
          </span>
        </div>
      ))}
    </div>
  );
}
