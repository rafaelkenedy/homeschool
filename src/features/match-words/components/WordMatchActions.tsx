import { motion } from 'framer-motion';

interface Props {
  onClear: () => void;
  onListenAll: () => void;
  hasConnections: boolean;
}

export default function WordMatchActions({ onClear, onListenAll, hasConnections }: Props) {
  return (
    <div className="flex items-center justify-center gap-4 px-6 pb-6 pt-2">
      <motion.button
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        onClick={onClear}
        disabled={!hasConnections}
        className="flex-1 flex items-center justify-center gap-2 bg-rose-100 hover:bg-rose-200 disabled:opacity-40 disabled:cursor-not-allowed text-rose-600 font-bold text-xl rounded-2xl py-4 shadow transition-colors"
      >
        <span className="text-2xl">🔄</span>
        Recomeçar
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        onClick={onListenAll}
        className="flex-1 flex items-center justify-center gap-2 bg-sky-100 hover:bg-sky-200 text-sky-700 font-bold text-xl rounded-2xl py-4 shadow transition-colors"
      >
        <span className="text-2xl">🔊</span>
        Ouvir
      </motion.button>
    </div>
  );
}
