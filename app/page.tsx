import PasteForm from "@/components/paste-form";

export default function Home() {
  return (
    <>
      <div className="w-full max-w-4xl mb-8 sm:mb-12 text-center space-y-4 pt-4 sm:pt-8 px-4">
        <h1 className="text-4xl xs:text-5xl sm:text-7xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-600 dark:from-white dark:via-neutral-200 dark:to-neutral-500">
          Pastebin Lite
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 text-lg sm:text-xl font-medium max-w-2xl mx-auto leading-relaxed px-2">
          Share text securely with optional expiration and view limits.
        </p>
      </div>

      <PasteForm />
    </>
  );
}
