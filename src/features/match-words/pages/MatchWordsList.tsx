import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, Variants } from 'framer-motion';
import { useAppStore } from '../../../app/store';

export default function MatchWordsList() {
  const navigate = useNavigate();
  const {
    currentUser,
    matchWordRounds,
    setMatchWordRounds,
    matchWordProgress,
    setMatchWordProgress,
  } = useAppStore();

  useEffect(() => {
    if (!currentUser) { navigate('/login'); return; }
    const load = async () => {
      try {
        // @ts-ignore
        const rounds = await window.electronAPI.getMatchWordRounds();
        setMatchWordRounds(rounds);
        // @ts-ignore
        const progress = await window.electronAPI.getMatchWordProgress(currentUser.id);
        setMatchWordProgress(progress);
      } catch (err) {
        console.error('Failed to load match-words data', err);
      }
    };
    load();
  }, [currentUser, setMatchWordRounds, setMatchWordProgress, navigate]);

  const completedIds = new Set(
    matchWordProgress
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

  const LEVEL_COLORS = ['#fb923c', '#f59e0b', '#10b981', '#6366f1'];
  const LEVEL_EMOJIS = ['🐱🐂🦆', '🐶🐓🐮🐟', '🐘🦁🐵🐰🐸', '🦛🦘🐢🦒🦍'];

  return (
    <div className="flex flex-col min-h-screen bg-orange-50">
      {/* Header */}
      <div className="flex items-center p-5 bg-white shadow-sm rounded-b-[2rem] mb-4">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate('/home')}
          className="bg-orange-100 text-orange-600 w-14 h-14 rounded-full shadow text-3xl flex items-center justify-center font-bold flex-shrink-0"
        >
          ←
        </motion.button>

        <div className="flex-1 text-center px-2">
          <h1 className="text-3xl font-extrabold text-orange-600">Ligue as Palavras 🐾</h1>
          <p className="text-orange-400 font-semibold text-lg">
            {completedCount} de {matchWordRounds.length} concluídas
          </p>
        </div>

        <div className="flex-shrink-0 w-20 h-5 bg-orange-100 rounded-full overflow-hidden shadow-inner">
          <motion.div
            className="h-full bg-gradient-to-r from-orange-400 to-amber-400 rounded-full"
            initial={{ width: 0 }}
            animate={{
              width: matchWordRounds.length
                ? `${(completedCount / matchWordRounds.length) * 100}%`
                : '0%',
            }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Round grid */}
      <div className="flex-1 px-6 pb-8">
        {matchWordRounds.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-orange-400 text-2xl font-bold animate-pulse">Carregando…</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            {matchWordRounds.map((round, i) => {
              const done = completedIds.has(round.id);
              const color = LEVEL_COLORS[i % LEVEL_COLORS.length];
              const emojiPreview = LEVEL_EMOJIS[i] ?? '';
              const pairs: { word: string; animal: string }[] = JSON.parse(round.pairs);

              return (
                <motion.div
                  key={round.id}
                  custom={i}
                  initial="hidden"
                  animate="visible"
                  variants={cardVariants}
                  whileHover={{ scale: 1.07, y: -4 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate(`/tasks/match-words/${round.id}`)}
                  className="aspect-square rounded-[2rem] flex flex-col items-center justify-center cursor-pointer relative shadow-xl border-4 border-white/60 overflow-hidden select-none"
                  style={{ background: done ? color : `${color}99` }}
                >
                  {done && (
                    <div className="absolute top-3 right-3 text-2xl">✅</div>
                  )}
                  <span className="text-white font-black text-2xl drop-shadow-md mb-1">
                    Nível {round.level}
                  </span>
                  <span className="text-3xl mb-1">{emojiPreview}</span>
                  <span className="text-white/70 text-base">
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
