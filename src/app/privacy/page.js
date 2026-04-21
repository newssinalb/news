const SITE_NAME = 'NextShqip';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.nextshqip.de';
const CONTACT_EMAIL = 'contact@nextshqip.de';

export const metadata = {
  title: `Politika e Privatësisë | ${SITE_NAME}`,
  description: 'Lexoni politikën e privatësisë së NextShqip — si mbledhim, përdorim dhe mbrojmë të dhënat tuaja.',
  robots: { index: true, follow: true },
  alternates: { canonical: `${SITE_URL}/privacy` },
};

export default function PrivacyPage() {
  const lastUpdated = '21 Prill 2026';

  return (
    <div className="bg-white min-h-screen w-full">
      <main className="max-w-[860px] mx-auto px-4 sm:px-8 py-12 w-full">

        {/* Header */}
        <div className="mb-10">
          <span className="inline-block bg-red-600 text-white text-xs font-black uppercase px-3 py-1 tracking-widest mb-4">
            Dokument Ligjor
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 leading-tight mb-3">
            Politika e Privatësisë
          </h1>
          <p className="text-slate-500 text-sm">
            Përditësuar: <strong>{lastUpdated}</strong> &nbsp;·&nbsp; {SITE_NAME}
          </p>
          <div className="mt-6 h-1 w-16 bg-red-600 rounded-full" />
        </div>

        {/* Content */}
        <div className="prose prose-slate max-w-none text-[17px] leading-relaxed space-y-10 text-slate-700">

          <section>
            <h2 className="text-xl font-black text-slate-900 mb-3 flex items-center gap-2">
              <span className="w-1 h-5 bg-red-600 rounded-full inline-block" />
              1. Hyrje
            </h2>
            <p>
              Mirë se vini në <strong>{SITE_NAME}</strong> (<a href={SITE_URL} className="text-red-600 hover:underline">{SITE_URL}</a>).
              Ne respektojmë privatësinë tuaj dhe jemi të angazhuar për të mbrojtur të dhënat tuaja personale.
              Kjo politikë privatësie shpjegon se si mbledhim, përdorim dhe mbrojmë informacionin kur vizitoni faqen tonë.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-900 mb-3 flex items-center gap-2">
              <span className="w-1 h-5 bg-red-600 rounded-full inline-block" />
              2. Të Dhënat që Mbledhim
            </h2>
            <p>Ne mund të mbledhim llojet e mëposhtme të informacionit:</p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li><strong>Të dhëna të përdorimit</strong> — faqet e vizituara, koha e qëndrimit, burimet e trafikut (mbledhur anonimisht nëpërmjet Google Analytics / GTM).</li>
              <li><strong>Adresa e emailit</strong> — vetëm nëse abonoheni vullnetarisht në buletinin tonë të lajmeve.</li>
              <li><strong>Komentet</strong> — nëse lini komente nën artikuj, ruajmë tekstin dhe kohën e postimit.</li>
              <li><strong>Cookies teknikë</strong> — për funksionimin e faqes (tema, preferencat e shfletimit).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-900 mb-3 flex items-center gap-2">
              <span className="w-1 h-5 bg-red-600 rounded-full inline-block" />
              3. Si i Përdorim të Dhënat
            </h2>
            <p>Të dhënat e mbledhura përdoren për:</p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li>Ofrimin dhe përmirësimin e shërbimeve të faqes sonë.</li>
              <li>Dërgimin e buletinit të lajmeve (vetëm nëse jeni abonuar).</li>
              <li>Analizën e statistikave të vizitave për të kuptuar interesat e lexuesve.</li>
              <li>Zbulimin dhe parandalimin e aktiviteteve mashtruese.</li>
            </ul>
            <p className="mt-4">
              Ne <strong>nuk i shesim, shkëmbejmë apo u japim palëve të treta</strong> të dhënat tuaja personale,
              me përjashtim të rasteve kur kërkohet me ligj ose me pëlqimin tuaj të shprehur.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-900 mb-3 flex items-center gap-2">
              <span className="w-1 h-5 bg-red-600 rounded-full inline-block" />
              4. Cookies
            </h2>
            <p>
              Faqja jonë përdor cookies të nevojshme për funksionimin e duhur (si preferencat e temës Dark/Light)
              dhe cookies analitike të Google Tag Manager / Google Analytics.
              Mund të çaktivizoni cookies në cilësimet e shfletuesit tuaj, megjithëse kjo mund të ndikojë në funksionalitetin e faqes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-900 mb-3 flex items-center gap-2">
              <span className="w-1 h-5 bg-red-600 rounded-full inline-block" />
              5. Shërbimet e Palëve të Treta
            </h2>
            <p>Faqja jonë integron shërbime të palëve të treta, secila me politikën e vet të privatësisë:</p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li><strong>Google Tag Manager / Analytics</strong> — statistika vizitash</li>
              <li><strong>Supabase</strong> — bazë të dhënash e sigurt për lajmet dhe komentet</li>
              <li><strong>Cloudinary</strong> — ruajtja e imazheve</li>
              <li><strong>NewsAPI.org</strong> — lajme ndërkombëtare</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-900 mb-3 flex items-center gap-2">
              <span className="w-1 h-5 bg-red-600 rounded-full inline-block" />
              6. Siguria e të Dhënave
            </h2>
            <p>
              Marrim masa të arsyeshme teknike dhe organizative për të mbrojtur të dhënat tuaja nga aksesi
              i paautorizuar, humbja ose ndryshimi. Megjithatë, asnjë transmetim nëpërmjet internetit
              nuk është 100% i sigurt.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-900 mb-3 flex items-center gap-2">
              <span className="w-1 h-5 bg-red-600 rounded-full inline-block" />
              7. Të Drejtat Tuaja
            </h2>
            <p>Keni të drejtë të:</p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li>Aksesoni të dhënat tuaja personale që mbajmë.</li>
              <li>Kërkoni korrigjimin ose fshirjen e të dhënave tuaja.</li>
              <li>Çabonoheni nga buletini i lajmeve në çdo kohë (nëpërmjet linkut në email).</li>
              <li>Kundërshtoni përpunimin e të dhënave tuaja.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-900 mb-3 flex items-center gap-2">
              <span className="w-1 h-5 bg-red-600 rounded-full inline-block" />
              8. Ndryshimet e Politikës
            </h2>
            <p>
              Mund ta përditësojmë këtë politikë privatësie herë pas here. Çdo ndryshim do të publikohet
              në këtë faqe me datën e përditësimit. Ju rekomandojmë ta kontrolloni periodikisht.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-900 mb-3 flex items-center gap-2">
              <span className="w-1 h-5 bg-red-600 rounded-full inline-block" />
              9. Na Kontaktoni
            </h2>
            <p>
              Për çdo pyetje rreth kësaj politike privatësie ose të dhënave tuaja, mund të na kontaktoni në:
            </p>
            <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-xl inline-block">
              <p className="font-bold text-slate-800">{SITE_NAME}</p>
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-red-600 hover:underline font-medium">
                {CONTACT_EMAIL}
              </a>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}
