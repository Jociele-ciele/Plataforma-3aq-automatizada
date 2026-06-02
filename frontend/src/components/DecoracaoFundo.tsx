// Fundo decorativo bonito (gradientes radiais + grid).
export function BackgroundDeco() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full bg-primary/20 blur-3xl" />
      <div className="absolute top-1/4 -right-32 h-[500px] w-[500px] rounded-full bg-accent/20 blur-3xl" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[400px] w-[700px] rounded-full bg-fuchsia-500/10 blur-3xl" />
      <div className="absolute inset-0 bg-grid-pattern bg-[size:32px_32px] opacity-40" />
    </div>
  );
}
