import PasteForm from "@/components/paste-form";

export default function Home() {
  return (
    <>
      <div className="w-full max-w-4xl mb-12 text-center space-y-4 pt-8">

        <h1 className="text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-600 dark:from-white dark:via-neutral-200 dark:to-neutral-500 sm:text-7xl">
          Pastebin Lite
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 text-xl font-medium max-w-2xl mx-auto leading-relaxed">
          Share text securely with optional expiration and view limits.
        </p>
      </div>

      <PasteForm />
    </>
  );
}
