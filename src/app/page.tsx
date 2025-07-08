import { Input } from "@/components/ui/input";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <h1 className="text-4xl font-bold font-[family-name:var(--font-zen-dots)]">
          Aventure Terminale
        </h1>
        <p className="text-lg font-[family-name:var(--font-syne-mono)]">
          Vous êtes un étudiant en terminale et vous avez besoin d&apos;aide
          pour votre projet de fin d&apos;année ?
        </p>
      </main>

      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center w-full">
        <Input placeholder="Que faites-vous ?" className="w-full" />
      </footer>
    </div>
  );
}
