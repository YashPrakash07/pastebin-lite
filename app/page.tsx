import PasteForm from "@/components/paste-form";

export default function Home() {
  return (
    <>
      <div className="w-full max-w-2xl mb-8 text-center space-y-2">
        <h1 className="text-4xl font-extrabold tracking-tight text-neutral-900 sm:text-5xl">
          Pastebin Lite
        </h1>
        <p className="text-neutral-500 text-lg">
          Share text securely with optional expiration and view limits.
        </p>
      </div>

      <PasteForm />
    </>
  );
}
