import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-5xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />
        
        <div className="w-full mt-16 bento-grid">
          <div className="bento-span-2 h-48 bg-zinc-100 dark:bg-zinc-900 rounded-xl p-6 border border-zinc-200 dark:border-zinc-800">
            <h3 className="font-semibold text-xl mb-2">Bento Item 1</h3>
            <p className="text-zinc-600 dark:text-zinc-400">Span 2 column/row</p>
          </div>
          <div className="bento-span-1 h-48 bg-zinc-100 dark:bg-zinc-900 rounded-xl p-6 border border-zinc-200 dark:border-zinc-800">
             <h3 className="font-semibold text-xl mb-2">Bento Item 2</h3>
             <p className="text-zinc-600 dark:text-zinc-400">Span 1</p>
          </div>
          <div className="bento-span-1 h-48 bg-zinc-100 dark:bg-zinc-900 rounded-xl p-6 border border-zinc-200 dark:border-zinc-800">
             <h3 className="font-semibold text-xl mb-2">Bento Item 3</h3>
             <p className="text-zinc-600 dark:text-zinc-400">Span 1</p>
          </div>
          <div className="bento-col-span-2 h-48 bg-zinc-100 dark:bg-zinc-900 rounded-xl p-6 border border-zinc-200 dark:border-zinc-800">
             <h3 className="font-semibold text-xl mb-2">Bento Item 4</h3>
             <p className="text-zinc-600 dark:text-zinc-400">Col Span 2</p>
          </div>
        </div>

      </main>
    </div>
  );
}
