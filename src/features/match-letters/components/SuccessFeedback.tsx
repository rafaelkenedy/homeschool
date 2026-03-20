import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  visible: boolean;
  onNext: () => void;
  isLast: boolean;
}

const STARS = ['⭐', '🌟', '✨', '💫', '🎉'];

export default function SuccessFeedback({ visible, onNext, isLast }: Props) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.4, y: 60 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', bounce: 0.5 }}
            className="bg-white rounded-[3rem] shadow-2xl flex flex-col items-center px-10 py-12 max-w-sm w-full mx-6 border-8 border-purple-300"
          >
            <div className="flex gap-1 text-4xl mb-4">
              {STARS.map((star, i) => (
                <motion.span
                  key={i}
                  initial={{ scale: 0, rotate: -30 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: i * 0.1, type: 'spring', bounce: 0.6 }}
                >
                  {star}
                </motion.span>
              ))}
            </div>

            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-5xl font-black text-purple-500 text-center mb-2 drop-shadow-sm"
            >
              Muito bem!
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55 }}
              className="text-2xl text-gray-500 font-semibold text-center mb-8"
            >
              {isLast ? 'Você ligou todas as letras! 🎉' : 'Você acertou todos os pares!'}
            </motion.p>

            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.94 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65 }}
              onClick={onNext}
              className="bg-gradient-to-r from-purple-400 to-pink-400 text-white font-extrabold text-2xl rounded-full px-10 py-4 shadow-lg"
            >
              {isLast ? '🏠 Início' : 'Próxima →'}
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
