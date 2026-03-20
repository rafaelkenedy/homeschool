import { forwardRef } from 'react';
import { motion } from 'framer-motion';

export type AnimalCardState = 'normal' | 'correct';

interface Props {
  emoji: string;
  state: AnimalCardState;
  onClick: () => void;
}

const AnimalCard = forwardRef<HTMLButtonElement, Props>(
  ({ emoji, state, onClick }, ref) => {
    const isCorrect = state === 'correct';

    return (
      <motion.button
        ref={ref}
        onClick={onClick}
        whileHover={isCorrect ? {} : { scale: 1.08, y: -3 }}
        whileTap={isCorrect ? {} : { scale: 0.93 }}
        animate={isCorrect ? { scale: [1, 1.25, 1] } : {}}
        transition={isCorrect ? { duration: 0.4, ease: 'easeOut' } : {}}
        disabled={isCorrect}
        className={`
          w-20 h-20 sm:w-24 sm:h-24
          rounded-[1.6rem] shadow-lg
          flex items-center justify-center
          text-5xl sm:text-6xl
          cursor-pointer select-none
          transition-all duration-200
          border-4
          ${isCorrect
            ? 'bg-emerald-50 border-emerald-400 ring-4 ring-emerald-300 ring-offset-2'
            : 'bg-amber-50 border-amber-200 hover:border-amber-400'
          }
          disabled:cursor-default
        `}
      >
        {emoji}
      </motion.button>
    );
  }
);

AnimalCard.displayName = 'AnimalCard';
export default AnimalCard;
