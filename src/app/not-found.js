import Link from 'next/link';

export const metadata = {
  title: 'Faqja nuk u gjet | Rilindje News',
  description: 'Faqja që kërkuat nuk ekziston ose është fshirë.',
};

/**
 * Custom 404 page shown when a news article or route is not found.
 * This file is automatically used by Next.js as the not-found UI.
 */
export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center bg-white px-4 py-20 text-center">

      {/* Big 404 */}
      <div className="relative mb-6 select-none">
        <span className="text-[130px] sm:text-[180px] font-black text-slate-100 leading-none tracking-tighter">
          404
        </span>
        <span className="absolute inset-0 flex items-center justify-center text-[48px] sm:text-[64px]">
          📰
        </span>
      </div>

      <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-3">
        Lajmi nuk u gjet
      </h1>
      <p className="text-slate-500 text-base max-w-md mb-8 leading-relaxed">
        Faqja që kërkuat nuk ekziston ose është zhvendosur.
        Kthehuni tek ballina për të gjetur lajmet më të fundit.
      </p>

      <div className="flex flex-wrap gap-3 justify-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded-lg transition-colors duration-200 text-sm"
        >
          ← Kthehu te Ballina
        </Link>
        <Link
          href="/?section=Aktualitet"
          className="inline-flex items-center gap-2 border border-slate-200 hover:border-red-300 text-slate-700 hover:text-red-600 font-bold px-6 py-3 rounded-lg transition-colors duration-200 text-sm"
        >
          Aktualitet
        </Link>
      </div>
    </div>
  );
}
