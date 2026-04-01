"use client";
import { useEffect, useState } from 'react';

export default function SubMenu() {
    const [today, setToday] = useState("");

    useEffect(() => {
        const date = new Date().toLocaleDateString('tr-TR', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });
        setToday(date);
    }, []);

    return (
        <div className="w-full bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-40">
            <div className="max-w-[1200px] mx-auto px-4 sm:px-8 py-2 flex items-center justify-between text-[11px] font-bold uppercase tracking-tighter">

                {/* Sol Kısım: Tarih & Trendler */}
                <div className="flex items-center gap-6">
                    <span className="text-red-600 border-r border-gray-200 pr-4">{today}</span>
                    <div className="hidden md:flex gap-4 text-gray-500">
                        <span className="hover:text-black cursor-pointer">#EKONOMİ</span>
                        <span className="hover:text-black cursor-pointer">#TEKNOLOJİ</span>
                        <span className="hover:text-black cursor-pointer">#SPOR</span>
                    </div>
                </div>

                {/* Sağ Kısım: "Günün Özeti" Butonu */}
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
                        </span>
                        <span className="text-gray-900">CANLI YAYIN</span>
                    </div>
                </div>

            </div>
        </div>
    );
}