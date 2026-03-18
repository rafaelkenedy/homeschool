import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Splash() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/login');
    }, 2500);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-primary-yellow to-orange-400">
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, type: 'spring', bounce: 0.5 }}
        className="flex flex-col items-center text-center px-6"
      >
        <div className="text-8xl mb-6">🚀</div>
        <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-8 drop-shadow-md">
          Vamos aprender brincando!
        </h1>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/login')}
          className="bg-white text-orange-500 font-bold text-2xl py-4 px-10 rounded-full shadow-lg"
        >
          Começar 🎉
        </motion.button>
      </motion.div>
    </div>
  );
}
