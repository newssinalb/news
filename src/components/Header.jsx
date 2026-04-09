'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import SearchOverlay from './SearchOverlay';
import DarkModeToggle from './DarkModeToggle';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [currentDate, setCurrentDate] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    
    // Custom Albanian date formatting
    const date = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    let formattedDate = date.toLocaleDateString('sq-AL', options);
    // Capitalize first letter
    formattedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
    setCurrentDate(formattedDate);
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Prevent background scrolling when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const navLinks = [
    { name: 'AKTUALITET', href: '/?section=Aktualitet' },
    { name: 'EDI RAMA', href: '/?section=Edi Rama' },
    { name: 'POLITIKË', href: '/?section=Politikë' },
    { name: 'BOTA', href: '/?section=Bota' },
    { name: 'SHOWBIZ', href: '/?section=Showbiz' },
    { name: 'SPORT', href: '/?section=Sport' },
    { name: 'EKONOMI', href: '/?section=Ekonomi' },
    { name: 'KRONIKË', href: '/?section=Kronikë' },
    { name: 'TEKNOLOGJI', href: '/?section=Teknologji' },
    { name: 'TË TJERA', href: '/?section=Të Tjera' },
  ];

  const liveLink = { name: 'LIVE', href: '/live', isLive: true };

  return (
    <>
      {/* Top Bar */}
      <div className="bg-[#0f172a] text-slate-300 text-[11px] py-1.5 px-4 sm:px-8 flex justify-between items-center z-[60] relative border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20">
            <span className="flex h-1.5 w-1.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"></span>
            </span>
            <span className="font-bold tracking-[0.2em] uppercase text-red-500">LIVE</span>
          </div>
          <span className="hidden md:inline-block font-medium opacity-80">Lajmet e fundit në kohë reale</span>
        </div>
        <span className="font-medium tracking-wider uppercase opacity-90">{currentDate || '...'}</span>
      </div>

      {/* Main Header */}
      <header 
        className={`sticky top-0 z-[50] transition-all duration-300 border-b ${
          scrolled 
            ? 'bg-white/95 backdrop-blur-xl border-slate-200/60 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.1)] py-3' 
            : 'bg-white border-slate-100 py-4 sm:py-6'
        }`}
      >
        <div className="w-full px-4 sm:px-8 lg:px-12 flex justify-between items-center gap-4 lg:gap-8 relative z-[55]">
          
          {/* Logo */}
          <Link href="/" className="flex-shrink-0 group relative z-[60]" onClick={() => setIsMobileMenuOpen(false)}>
            <div className="absolute -inset-6 bg-gradient-to-r from-red-600/5 via-orange-500/5 to-transparent blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full -z-10"></div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tighter flex items-center gap-0.5 select-none drop-shadow-sm">
              <span className="bg-clip-text text-transparent bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 group-hover:from-red-600 group-hover:to-red-800 transition-all duration-300">
                NEWS
              </span>
              <span className="text-red-600 font-extrabold transform group-hover:scale-105 transition-transform duration-300 inline-block will-change-transform">23</span>
              <span className="text-red-600/80 font-bold text-2xl sm:text-3xl lg:text-4xl -mx-1 -rotate-12 group-hover:rotate-0 transition-transform duration-300">/</span>
              <span className="text-red-600 font-extrabold transform group-hover:scale-105 transition-transform duration-300 inline-block will-change-transform delay-75">7</span>
            </h1>
          </Link>

          {/* Search + Dark mode — desktop */}
          <div className="hidden lg:flex items-center gap-2">
            <SearchOverlay />
            <DarkModeToggle />
          </div>

          {/* Search + Dark mode + Hamburger — mobile */}
          <div className="flex items-center gap-2 lg:hidden">
            <SearchOverlay />
            <DarkModeToggle />
            <button 
              className="p-2 -mr-2 text-slate-800 dark:text-slate-200 hover:text-red-600 focus:outline-none transition-colors z-[60]"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <div className="w-6 h-5 flex flex-col justify-between items-end">
                <span className={`h-0.5 bg-current rounded-full transition-all duration-300 ease-in-out origin-right ${isMobileMenuOpen ? 'w-6 -rotate-45 -translate-y-[0px] -translate-x-[1px]' : 'w-6'}`} />
                <span className={`h-0.5 bg-current rounded-full transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'w-full opacity-0' : 'w-5'}`} />
                <span className={`h-0.5 bg-current rounded-full transition-all duration-300 ease-in-out origin-right ${isMobileMenuOpen ? 'w-6 rotate-45 translate-y-[2px] -translate-x-[1px]' : 'w-4'}`} />
              </div>
            </button>
          </div>
          
          {/* Default Desktop Navigation */}
          <nav className="hidden lg:block w-auto z-[50]">
            <ul className="flex items-center justify-end gap-5 xl:gap-7 text-[13px] xl:text-[14px] font-bold text-slate-600 tracking-wider">
              {/* LIVE special link */}
              <li>
                <Link href={liveLink.href} className="relative py-2 group inline-flex items-center gap-1.5 whitespace-nowrap">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-600" />
                  </span>
                  <span className="text-red-600 group-hover:text-red-800 transition-colors font-black">LIVE</span>
                </Link>
              </li>
              {navLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href} 
                    className="relative py-2 group inline-block whitespace-nowrap"
                  >
                    <span className="group-hover:text-red-600 transition-colors duration-300">{link.name}</span>
                    <span className="absolute bottom-0 left-0 w-full h-[3px] bg-red-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-t-sm"></span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>

      {/* Mobile Dark Overlay Background */}
      <div 
        className={`fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[45] lg:hidden transition-opacity duration-300 ease-in-out ${
          isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
        aria-hidden="true"
      />

      {/* Mobile Sidebar Slide-Out Menu */}
      <aside 
        className={`fixed top-0 right-0 h-full w-[80%] max-w-[320px] bg-white shadow-2xl z-[48] lg:hidden transform transition-transform duration-[400ms] ease-[cubic-bezier(0.25,1,0.5,1)] flex flex-col pt-[120px] pb-4 ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full shadow-none'
        }`}
      >
        <div className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar">
          <p className="text-[11px] font-black tracking-[0.2em] text-slate-400 uppercase mb-5 ml-1 drop-shadow-sm">Kategoritë</p>
          <ul className="flex flex-col gap-1.5">
              {/* LIVE in mobile menu */}
              <li className={`transform transition-all duration-[600ms] ease-out ${
                isMobileMenuOpen ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'
              }`} style={{ transitionDelay: `${isMobileMenuOpen ? 100 : 0}ms` }}>
                <Link href="/live" className="block py-3.5 px-4 text-[14px] font-black tracking-widest text-red-600 uppercase rounded-xl hover:bg-red-50 active:bg-red-100 transition-colors border border-red-100 relative flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
                  <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" /><span className="relative inline-flex rounded-full h-2 w-2 bg-red-600" /></span>
                  LIVE TV
                </Link>
              </li>
              {navLinks.map((link, index) => (
                <li 
                  key={link.name} 
                  className={`transform transition-all duration-[600ms] ease-out ${
                    isMobileMenuOpen ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'
                  }`}
                  style={{ transitionDelay: `${isMobileMenuOpen ? 150 + (index * 40) : 0}ms` }}
                >
                  <Link 
                    href={link.href} 
                    className="block py-3.5 px-4 text-[14px] font-black tracking-widest text-slate-800 uppercase rounded-xl hover:bg-slate-50 hover:text-red-600 active:bg-slate-100 transition-colors border border-transparent hover:border-slate-100 relative group/mob nav-glass"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.name}
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 opacity-0 group-hover/mob:opacity-100 transition-opacity transform group-hover/mob:translate-x-1 duration-300">❯</span>
                  </Link>
                </li>
              ))}
            </ul>
        </div>
        
      </aside>
    </>
  );
}
