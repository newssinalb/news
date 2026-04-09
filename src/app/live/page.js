import { getLiveChannels } from '@/lib/supabase';
import LivePlayer from './LivePlayer';

export const revalidate = 60;

export const metadata = {
  title: 'Live TV — News 23/7',
  description: 'Shiko televizionin live shqiptar online falas.',
};

export default async function LivePage() {
  const channels = await getLiveChannels();
  const activeChannels = channels.filter(c => c.is_active);

  return (
    <div className="bg-[#0b0f1a] min-h-screen w-full">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center gap-2 bg-red-600/20 border border-red-500/30 rounded-full px-3 py-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
            </span>
            <span className="text-red-400 text-[11px] font-black uppercase tracking-widest">Live</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">TV Live</h1>
        </div>

        {activeChannels.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-slate-400">
            <span className="text-5xl mb-4">📺</span>
            <p className="text-lg font-semibold">Nuk ka kanale aktive.</p>
            <p className="text-sm mt-1">Shko te paneli i adminit dhe shto URL-in e YouTube.</p>
          </div>
        ) : (
          <LivePlayer channels={activeChannels} />
        )}
      </div>
    </div>
  );
}
