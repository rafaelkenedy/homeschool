import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface Props {
  current: number;
  total: number;
}

export default function WritingTaskHeader({ current, total }: Props) {
  const navigate = useNavigate();

  return (
    <div className="flex items-center p-5 bg-white shadow-sm rounded-b-[2rem] mb-2">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => navigate('/tasks/writing')}
        className="bg-sky-100 text-sky-600 w-14 h-14 rounded-full shadow text-3xl flex items-center justify-center font-bold flex-shrink-0"
      >
        ←
      </motion.button>

      <h1 className="text-3xl font-extrabold text-sky-600 flex-1 text-center">
        Vamos escrever ✏️
      </h1>

      <div className="bg-sky-100 px-4 py-2 rounded-full text-sky-700 font-bold text-lg flex-shrink-0">
        {current} de {total}
      </div>
    </div>
  );
}
