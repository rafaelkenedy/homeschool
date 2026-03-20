import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppStore } from '../../../app/store';

export default function Home() {
  const navigate = useNavigate();
  const { currentUser } = useAppStore();

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  if (!currentUser) return null;

  return (
    <div className="flex flex-col min-h-screen bg-green-50">
      {/* Top Bar */}
      <div className="flex items-center justify-between p-6 bg-white shadow-md rounded-b-[2rem]">
        <div className="flex items-center gap-4">
          <div className="text-5xl">{currentUser.avatar}</div>
          <h1 className="text-3xl font-extrabold text-green-600">
            Oi, {currentUser.name}!
          </h1>
        </div>
        <div className="flex items-center gap-2 bg-yellow-100 px-6 py-3 rounded-full shadow-sm text-yellow-600 text-2xl font-bold">
          ⭐ 5
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 w-full max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          <motion.div
             whileHover={{ scale: 1.05, y: -5 }}
             whileTap={{ scale: 0.95 }}
             onClick={() => navigate('/letters')}
             className="bg-gradient-to-br from-primary-yellow to-orange-400 h-40 md:h-48 rounded-[2.5rem] shadow-xl flex items-center justify-center cursor-pointer border-4 border-transparent hover:border-yellow-200 transition-all"
          >
            <div className="flex items-center gap-6 md:gap-8 text-white">
              <span className="text-6xl md:text-7xl drop-shadow-md">🔤</span>
              <span className="text-3xl md:text-5xl font-black drop-shadow-md uppercase tracking-wide">Letras</span>
            </div>
          </motion.div>

          <motion.div
             whileHover={{ scale: 1.05, y: -5 }}
             whileTap={{ scale: 0.95 }}
             onClick={() => navigate('/tasks/writing')}
             className="bg-gradient-to-br from-sky-300 to-primary-blue h-40 md:h-48 rounded-[2.5rem] shadow-xl flex items-center justify-center cursor-pointer border-4 border-transparent hover:border-sky-200 transition-all"
          >
            <div className="flex items-center gap-6 md:gap-8 text-white">
              <span className="text-6xl md:text-7xl drop-shadow-md">✏️</span>
              <span className="text-3xl md:text-5xl font-black drop-shadow-md uppercase tracking-wide">Tarefas</span>
            </div>
          </motion.div>

          <motion.div
             whileHover={{ scale: 1.05, y: -5 }}
             whileTap={{ scale: 0.95 }}
             onClick={() => navigate('/tasks/match-letters')}
             className="bg-gradient-to-br from-teal-400 to-emerald-500 h-40 md:h-48 rounded-[2.5rem] shadow-xl flex items-center justify-center cursor-pointer border-4 border-transparent hover:border-teal-200 transition-all"
          >
            <div className="flex flex-col items-center gap-1 md:gap-2 text-white">
              <span className="text-5xl md:text-6xl drop-shadow-md">🔗</span>
              <span className="text-2xl md:text-3xl font-black drop-shadow-md uppercase tracking-widest text-center">Ligar Letras</span>
            </div>
          </motion.div>

          <motion.div
             whileHover={{ scale: 1.05, y: -5 }}
             whileTap={{ scale: 0.95 }}
             onClick={() => navigate('/tasks/match-words')}
             className="bg-gradient-to-br from-pink-400 to-rose-500 h-40 md:h-48 rounded-[2.5rem] shadow-xl flex items-center justify-center cursor-pointer border-4 border-transparent hover:border-pink-200 transition-all"
          >
            <div className="flex flex-col items-center gap-1 md:gap-2 text-white">
              <span className="text-5xl md:text-6xl drop-shadow-md">🐾</span>
              <span className="text-2xl md:text-3xl font-black drop-shadow-md uppercase tracking-widest text-center">Ligar Palavras</span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
