import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface Props {
  current: number;
  total: number;
}

export default function MatchWordsHeader({ current, total }: Props) {
  const navigate = useNavigate();

  return (
    <div className="flex items-center p-5 bg-white shadow-sm rounded-b-[2rem] mb-2">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => navigate('/tasks/match-words')}
        className="bg-orange-100 text-orange-600 w-14 h-14 rounded-full shadow text-3xl flex items-center justify-center font-bold flex-shrink-0"
      >
        ←
      </motion.button>

      <div className="flex-1 text-center px-2">
        <h1 className="text-3xl font-extrabold text-orange-600">Ligue as Palavras 🐾</h1>
        <p className="text-orange-400 font-semibold text-lg">
          {current} de {total}
        </p>
      </div>

      {/* Progress pill */}
      <div className="flex-shrink-0 w-20 h-5 bg-orange-100 rounded-full overflow-hidden shadow-inner">
        <motion.div
          className="h-full bg-gradient-to-r from-orange-400 to-amber-400 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: total ? `${(current / total) * 100}%` : '0%' }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
