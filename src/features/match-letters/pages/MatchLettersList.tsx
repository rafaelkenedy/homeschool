import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, Variants } from 'framer-motion';
import { useAppStore } from '../../../app/store';

export default function MatchLettersList() {
  const navigate = useNavigate();
  const {
    currentUser,
    matchLetterRounds,
    setMatchLetterRounds,
    matchLetterProgress,
    setMatchLetterProgress,
  } = useAppStore();

  // Load data on mount
  useEffect(() => {
    if (!currentUser) { navigate('/login'); return; }
    const load = async () => {
      try {
        // @ts-ignore
        const rounds = await window.electronAPI.getMatchLetterRounds();
        setMatchLetterRounds(rounds);
        // @ts-ignore
        const progress = await window.electronAPI.getMatchLetterProgress(currentUser.id);
        setMatchLetterProgress(progress);
      } catch (err) {
        console.error('Failed to load match-letters data', err);
      }
    };
    load();
  }, [currentUser, setMatchLetterRounds, setMatchLetterProgress, navigate]);

  const completedIds = new Set(
    matchLetterProgress
      .filter((p) => p.user_id === currentUser?.id && p.completed === 1)
      .map((p) => p.round_id)
  );

  const completedCount = completedIds.size;

  const cardVariants: Variants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: (i: number) => ({
      opacity: 1,
      scale: 1,
      transition: { delay: i * 0.07, type: 'spring' as const, bounce: 0.4 },
    }),
  };

  const LEVEL_COLORS = [
    { bg: '#a78bfa', preview: 'A → a' },
    { bg: '#fb923c', preview: 'D → d' },
    { bg: '#34d399', preview: 'H → h' },
    { bg: '#f472b6', preview: 'M → m' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-purple-50">
      {/* Header */}
      <div className="flex items-center p-5 bg-white shadow-sm rounded-b-[2rem] mb-4">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate('/home')}
          className="bg-purple-100 text-purple-600 w-14 h-14 rounded-full shadow text-3xl flex items-center justify-center font-bold flex-shrink-0"
        >
          ←
        </motion.button>

        <div className="flex-1 text-center px-2">
          <h1 className="text-3xl font-extrabold text-purple-600">Ligue as Letras 🔗</h1>
          <p className="text-purple-400 font-semibold text-lg">
            {completedCount} de {matchLetterRounds.length} concluídas
          </p>
        </div>

        {/* Progress bar pill */}
        <div className="flex-shrink-0 w-20 h-5 bg-purple-100 rounded-full overflow-hidden shadow-inner">
          <motion.div
            className="h-full bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"
            initial={{ width: 0 }}
            animate={{
              width: matchLetterRounds.length
                ? `${(completedCount / matchLetterRounds.length) * 100}%`
                : '0%',
            }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Round grid */}
      <div className="flex-1 px-6 pb-8">
        {matchLetterRounds.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-purple-400 text-2xl font-bold animate-pulse">Carregando…</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            {matchLetterRounds.map((round, i) => {
              const done = completedIds.has(round.id);
              const colorInfo = LEVEL_COLORS[i % LEVEL_COLORS.length];
              const pairs: string[][] = JSON.parse(round.pairs);
              const preview = pairs.slice(0, 2).map(([u, l]) => `${u}↔${l}`).join('  ');

              return (
                <motion.div
                  key={round.id}
                  custom={i}
                  initial="hidden"
                  animate="visible"
                  variants={cardVariants}
                  whileHover={{ scale: 1.07, y: -4 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate(`/tasks/match-letters/${round.id}`)}
                  className="aspect-square rounded-[2rem] flex flex-col items-center justify-center cursor-pointer relative shadow-xl border-4 border-white/60 overflow-hidden select-none"
                  style={{ background: done ? colorInfo.bg : `${colorInfo.bg}99` }}
                >
                  {done && (
                    <div className="absolute top-3 right-3 text-2xl">✅</div>
                  )}
                  <span className="text-white font-black text-3xl drop-shadow-md mb-1">
                    Nível {round.level}
                  </span>
                  <span className="text-white/80 font-semibold text-lg text-center px-2">
                    {preview}
                  </span>
                  <span className="text-white/60 text-base mt-1">
                    {pairs.length} pares
                  </span>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
