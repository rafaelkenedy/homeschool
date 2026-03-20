import { motion } from 'framer-motion';

interface Props {
  onClear: () => void;
  onAudio: () => void;
  onComplete: () => void;
  hasStrokes: boolean;
}

export default function TaskActions({ onClear, onAudio, onComplete, hasStrokes }: Props) {
  return (
    <div className="flex items-center justify-center gap-4 px-4 pb-4 pt-2">
      <motion.button
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        onClick={onClear}
        disabled={!hasStrokes}
        className="flex-1 flex items-center justify-center gap-2 bg-rose-100 hover:bg-rose-200 disabled:opacity-40 disabled:cursor-not-allowed text-rose-600 font-bold text-xl rounded-2xl py-4 shadow transition-colors"
      >
        <span className="text-2xl">🗑️</span>
        Limpar
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        onClick={onAudio}
        className="flex-1 flex items-center justify-center gap-2 bg-sky-100 hover:bg-sky-200 text-sky-700 font-bold text-xl rounded-2xl py-4 shadow transition-colors"
      >
        <span className="text-2xl">🔊</span>
        Ouvir
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        onClick={onComplete}
        className="flex-1 flex items-center justify-center gap-2 bg-emerald-400 hover:bg-emerald-500 text-white font-bold text-xl rounded-2xl py-4 shadow-lg transition-colors"
      >
        <span className="text-2xl">✅</span>
        Concluir
      </motion.button>
    </div>
  );
}
