import { motion } from 'framer-motion';
import { WritingTask } from '../../../app/store';

interface Props {
  task: WritingTask;
  onAudio: () => void;
}

export default function LetterReferenceCard({ task, onAudio }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', bounce: 0.4 }}
      className="rounded-[2rem] shadow-xl border-4 border-white overflow-hidden mx-4 mb-4"
      style={{ background: `linear-gradient(135deg, ${task.color}cc, ${task.color})` }}
    >
      <div className="flex items-center justify-between px-6 py-4">
        {/* Letter display — block + cursive, igual ao Letters.tsx */}
        <div className="flex flex-col items-center gap-1">
          {/* Bloco */}
          <span className="text-white font-black drop-shadow-md leading-none tracking-widest" style={{ fontSize: '4.5rem' }}>
            {task.letter} {task.letter.toLowerCase()}
          </span>
          {/* Cursiva */}
          <span className="text-white/85 font-cursive drop-shadow-sm leading-none tracking-widest" style={{ fontSize: '4rem' }}>
            {task.letter} {task.letter.toLowerCase()}
          </span>
        </div>

        {/* Instruction + emoji */}
        <div className="flex flex-col items-center flex-1 px-4">
          <span className="text-6xl mb-2">{task.emoji}</span>
          <p className="text-white font-extrabold text-xl text-center drop-shadow-sm">
            {task.instruction}
          </p>
          <p className="text-white/80 font-semibold text-lg mt-1 uppercase tracking-wider">
            {task.word}
          </p>
        </div>

        {/* Audio button */}
        <motion.button
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
          onClick={onAudio}
          className="bg-white/30 hover:bg-white/50 transition-colors w-16 h-16 rounded-full flex items-center justify-center text-4xl shadow-md flex-shrink-0"
          title="Ouvir o som"
        >
          🔊
        </motion.button>
      </div>
    </motion.div>
  );
}
