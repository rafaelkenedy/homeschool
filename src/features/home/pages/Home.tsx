import React, { useEffect } from 'react';
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

      <div className="flex-1 flex flex-col items-center justify-center gap-8 p-6">
        <motion.div
           whileHover={{ scale: 1.05, y: -5 }}
           whileTap={{ scale: 0.95 }}
           onClick={() => navigate('/letters')}
           className="bg-gradient-to-br from-primary-yellow to-orange-400 w-full max-w-lg h-48 rounded-[2rem] shadow-xl flex items-center justify-center cursor-pointer border-4 border-transparent hover:border-yellow-200 transition-all"
        >
          <div className="flex items-center gap-8">
            <span className="text-7xl drop-shadow-md">🔤</span>
            <span className="text-5xl font-black text-white drop-shadow-md uppercase tracking-wide">Letras</span>
          </div>
        </motion.div>

        <motion.div
           whileHover={{ scale: 1.05, y: -5 }}
           whileTap={{ scale: 0.95 }}
           className="bg-gradient-to-br from-blue-300 to-primary-blue w-full max-w-lg h-48 rounded-[2rem] shadow-xl flex items-center justify-center cursor-pointer border-4 border-transparent hover:border-blue-200 transition-all opacity-80"
        >
          <div className="flex items-center gap-8">
            <span className="text-7xl drop-shadow-md">📚</span>
            <span className="text-5xl font-black text-white drop-shadow-md uppercase tracking-wide">Tarefas</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
