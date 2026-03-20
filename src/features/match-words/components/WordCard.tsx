import { forwardRef } from 'react';
import { motion } from 'framer-motion';

export type WordCardState = 'normal' | 'selected' | 'correct' | 'wrong';

interface Props {
  word: string;
  state: WordCardState;
  onClick: () => void;
  onAudio: () => void;
}

const stateStyles: Record<WordCardState, string> = {
  normal: 'bg-gradient-to-br from-indigo-500 to-violet-600 shadow-indigo-300',
  selected: 'bg-gradient-to-br from-orange-400 to-amber-500 shadow-orange-300 ring-4 ring-orange-300 ring-offset-2 scale-105',
  correct: 'bg-gradient-to-br from-emerald-400 to-green-600 shadow-emerald-300 ring-4 ring-emerald-300 ring-offset-2',
  wrong: 'bg-gradient-to-br from-red-400 to-rose-600 shadow-red-300 ring-4 ring-red-300 ring-offset-2',
};

const WordCard = forwardRef<HTMLButtonElement, Props>(
  ({ word, state, onClick, onAudio }, ref) => {
    const handleAudio = (e: React.MouseEvent) => {
      e.stopPropagation();
      onAudio();
    };

    return (
      <motion.button
        ref={ref}
        onClick={onClick}
        whileHover={state === 'correct' ? {} : { scale: 1.04 }}
        whileTap={state === 'correct' ? {} : { scale: 0.96 }}
        animate={state === 'wrong' ? { x: [0, -8, 8, -8, 8, 0] } : {}}
        transition={state === 'wrong' ? { duration: 0.4 } : {}}
        disabled={state === 'correct'}
        className={`
          ${stateStyles[state]}
          relative
          min-w-[9rem] px-5 py-4
          rounded-[1.4rem] shadow-lg
          flex items-center justify-between gap-3
          text-white font-black
          text-2xl sm:text-3xl
          cursor-pointer select-none
          transition-all duration-200
          border-4 border-white/20
          disabled:cursor-default
        `}
      >
        <span className="flex-1 text-center tracking-wider">{word}</span>
        <span
          role="button"
          aria-label={`Ouvir a palavra ${word}`}
          onClick={handleAudio}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onAudio();
            }
          }}
          className="ml-1 flex-shrink-0 text-xl text-white/70 transition-colors hover:text-white"
          tabIndex={-1}
        >
          🔊
        </span>
      </motion.button>
    );
  }
);

WordCard.displayName = 'WordCard';
export default WordCard;
