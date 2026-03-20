import { forwardRef } from 'react';
import { motion } from 'framer-motion';

export type LetterNodeState = 'normal' | 'selected' | 'connected' | 'correct' | 'wrong';

interface Props {
  letter: string;
  variant: 'upper' | 'lower';
  state: LetterNodeState;
  onClick: () => void;
}

const stateStyles: Record<LetterNodeState, string> = {
  normal: '',
  selected: 'ring-4 ring-offset-2 scale-110',
  connected: 'opacity-60',
  correct: 'ring-4 ring-emerald-400 ring-offset-2',
  wrong: 'ring-4 ring-red-400 ring-offset-2',
};

const variantBase: Record<'upper' | 'lower', string> = {
  upper: 'bg-gradient-to-br from-indigo-400 to-purple-500 shadow-indigo-300',
  lower: 'bg-gradient-to-br from-amber-400 to-orange-500 shadow-amber-300',
};

const stateOverride: Partial<Record<LetterNodeState, string>> = {
  correct: 'bg-gradient-to-br from-emerald-400 to-green-500 shadow-emerald-300',
  wrong: 'bg-gradient-to-br from-red-400 to-rose-500 shadow-red-300',
};

const LetterNode = forwardRef<HTMLButtonElement, Props>(
  ({ letter, variant, state, onClick }, ref) => {
    const base = stateOverride[state] ?? variantBase[variant];
    const ring = stateStyles[state];

    return (
      <motion.button
        ref={ref}
        onClick={onClick}
        whileHover={state === 'correct' ? {} : { scale: 1.08 }}
        whileTap={state === 'correct' ? {} : { scale: 0.94 }}
        animate={state === 'wrong' ? { x: [0, -8, 8, -8, 8, 0] } : {}}
        transition={state === 'wrong' ? { duration: 0.4 } : {}}
        disabled={state === 'correct'}
        className={`
          ${base} ${ring}
          w-20 h-20 sm:w-24 sm:h-24
          rounded-[1.6rem] shadow-lg
          flex items-center justify-center
          text-white font-black
          text-4xl sm:text-5xl
          cursor-pointer select-none
          transition-all duration-200
          border-4 border-white/30
          disabled:cursor-default
        `}
      >
        {letter}
      </motion.button>
    );
  }
);

LetterNode.displayName = 'LetterNode';
export default LetterNode;
