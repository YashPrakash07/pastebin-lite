import PasteForm from "@/components/paste-form";

export default function Home() {
  return (
    <>
      <div className="w-full max-w-4xl mb-12 text-center space-y-4 pt-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <span className="text-2xl font-bold text-white">P</span>
          </div>
        </div>
        <h1 className="text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-600 sm:text-7xl">
          Pastebin Lite
        </h1>
        <p className="text-neutral-600 text-xl font-medium max-w-2xl mx-auto leading-relaxed">
          Share text securely with optional expiration and view limits.
        </p>
      </div>

      <PasteForm />
    </>
  );
}
