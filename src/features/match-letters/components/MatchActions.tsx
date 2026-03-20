import { motion } from 'framer-motion';

interface Props {
  onClear: () => void;
  hasConnections: boolean;
}

export default function MatchActions({ onClear, hasConnections }: Props) {
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
    </div>
  );
}
