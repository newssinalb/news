"use client";

import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#0f172a] text-slate-300 py-12 pt-16 mt-auto border-t-[4px] border-red-600 z-10 w-full relative">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-8 grid grid-cols-1 md:grid-cols-3 gap-12">
        {/* Brand & About */}
        <div className="flex flex-col gap-4">
          <Link href="/" className="flex-shrink-0 group relative inline-block w-max">
            <h2 className="text-3xl font-black tracking-tighter flex items-center gap-0.5 select-none drop-shadow-sm">
              <span className="text-white group-hover:text-red-500 transition-colors duration-300">NEWS</span>
              <span className="text-red-600 font-extrabold transform group-hover:scale-105 transition-transform duration-300 inline-block will-change-transform">23</span>
              <span className="text-red-500 font-bold text-3xl -mx-1 -rotate-12 group-hover:rotate-0 transition-transform duration-300">/</span>
              <span className="text-red-600 font-extrabold transform group-hover:scale-105 transition-transform duration-300 inline-block will-change-transform delay-75">7</span>
            </h2>
          </Link>
          <p className="text-sm font-medium leading-[1.8] opacity-80 mt-2">
            Zëri juaj i besueshëm për lajmet më të fundit. Ne sjellim raportim të saktë, të shpejtë dhe të paanshëm për të gjitha ngjarjet kryesore në vend dhe mbarë botën.
          </p>
        </div>

        {/* Categories */}
        <div className="flex flex-col gap-4">
          <h3 className="text-white font-bold tracking-widest uppercase text-sm border-l-[3px] border-red-600 pl-3">Kategoritë</h3>
          <ul className="grid grid-cols-2 gap-y-3 mt-2 text-sm font-semibold opacity-90">
            <li><Link href="/?section=Aktualitet" className="hover:text-red-500 transition-colors inline-flex items-center gap-1.5 group"><span className="text-red-600 transform scale-0 group-hover:scale-100 transition-transform">▸</span> Aktualitet</Link></li>
            <li><Link href="/?section=Politikë" className="hover:text-red-500 transition-colors inline-flex items-center gap-1.5 group"><span className="text-red-600 transform scale-0 group-hover:scale-100 transition-transform">▸</span> Politikë</Link></li>
            <li><Link href="/?section=Sport" className="hover:text-red-500 transition-colors inline-flex items-center gap-1.5 group"><span className="text-red-600 transform scale-0 group-hover:scale-100 transition-transform">▸</span> Sport</Link></li>
            <li><Link href="/?section=Ekonomi" className="hover:text-red-500 transition-colors inline-flex items-center gap-1.5 group"><span className="text-red-600 transform scale-0 group-hover:scale-100 transition-transform">▸</span> Ekonomi</Link></li>
            <li><Link href="/?section=Bota" className="hover:text-red-500 transition-colors inline-flex items-center gap-1.5 group"><span className="text-red-600 transform scale-0 group-hover:scale-100 transition-transform">▸</span> Bota</Link></li>
            <li><Link href="/?section=Showbiz" className="hover:text-red-500 transition-colors inline-flex items-center gap-1.5 group"><span className="text-red-600 transform scale-0 group-hover:scale-100 transition-transform">▸</span> Showbiz</Link></li>
          </ul>
        </div>

        {/* Newsletter & Contact */}
        <div className="flex flex-col gap-4">
           <h3 className="text-white font-bold tracking-widest uppercase text-sm border-l-[3px] border-red-600 pl-3">Na Ndiqni</h3>
           <p className="text-[13px] opacity-80 font-medium leading-relaxed">Merrni lajmet e fundit drejtpërdrejt në inbox-in tuaj:</p>
           <form className="flex mt-1 relative" onSubmit={(e) => e.preventDefault()}>
              <input type="email" placeholder="Email adresa..." className="w-full bg-slate-800 text-slate-200 text-sm px-4 py-3 rounded-l-md outline-none focus:ring-1 focus:ring-red-500 border border-slate-700/50" />
              <button type="submit" className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 rounded-r-md transition-colors text-sm uppercase tracking-wide">Abonohu</button>
           </form>
           
           <div className="flex gap-4 mt-4">
              {/* Dummy Social Icons */}
              <a href="#" className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-800 hover:bg-[#1877F2] transition-colors border border-slate-700 hover:border-[#1877F2]">
                <span className="font-bold text-white text-[11px] uppercase">FB</span>
              </a>
              <a href="#" className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-800 hover:bg-[#E4405F] transition-colors border border-slate-700 hover:border-[#E4405F]">
                <span className="font-bold text-white text-[11px] uppercase">IG</span>
              </a>
              <a href="#" className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-800 hover:bg-[#1DA1F2] transition-colors border border-slate-700 hover:border-[#1DA1F2]">
                <span className="font-bold text-white text-[11px] uppercase">TW</span>
              </a>
           </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-8 mt-14 pt-8 border-t border-slate-700/50 flex flex-col md:flex-row items-center justify-between text-[11px] font-bold tracking-wider opacity-60">
        <p>© {currentYear} NEWS23/7. TË GJITHA TË DREJTAT E REZERVUARA.</p>
        <div className="flex gap-6 mt-4 md:mt-0 uppercase">
          <Link href="#" className="hover:text-red-500 transition-colors">KUSHTET E PËRDORIMIT</Link>
          <Link href="#" className="hover:text-red-500 transition-colors">POLITIKA E PRIVATËSISË</Link>
          <Link href="/admin" className="hover:text-red-500 transition-colors text-slate-500">STAFF LOGIN</Link>
        </div>
      </div>
    </footer>
  );
}
