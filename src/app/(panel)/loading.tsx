export default function PanelLoading() {
  return (
    <div
      className="space-y-6 motion-safe:animate-pulse"
      role="status"
      aria-label="Cargando el panel"
    >
      <span className="sr-only">Cargando el panel...</span>
      <div className="h-8 w-56 rounded-lg bg-slate-200" />
      <div className="h-56 rounded-2xl bg-slate-200" />
      <div className="grid grid-cols-2 gap-5 xl:grid-cols-4">
        {[0, 1, 2, 3].map((item) => (
          <div key={item} className="h-44 rounded-2xl bg-white" />
        ))}
      </div>
      <div className="grid gap-5 xl:grid-cols-[1.85fr_1fr]">
        <div className="h-80 rounded-2xl bg-white" />
        <div className="h-80 rounded-2xl bg-white" />
      </div>
    </div>
  );
}
