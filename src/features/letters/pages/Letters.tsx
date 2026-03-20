import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../../app/store';

const LETTERS_DATA = [
  { id: 'A', letter: 'a', word: 'Abelha', emoji: '🐝', color: 'bg-red-400', shadow: 'shadow-red-500' },
  { id: 'B', letter: 'b', word: 'Bola', emoji: '⚽', color: 'bg-blue-400', shadow: 'shadow-blue-500' },
  { id: 'C', letter: 'c', word: 'Casa', emoji: '🏠', color: 'bg-green-400', shadow: 'shadow-green-500' },
  { id: 'D', letter: 'd', word: 'Dado', emoji: '🎲', color: 'bg-yellow-400', shadow: 'shadow-yellow-500' },
  { id: 'E', letter: 'e', word: 'Elefante', emoji: '🐘', color: 'bg-purple-400', shadow: 'shadow-purple-500' },
  { id: 'F', letter: 'f', word: 'Fogo', emoji: '🔥', color: 'bg-pink-400', shadow: 'shadow-pink-500' },
  { id: 'G', letter: 'g', word: 'Gato', emoji: '🐱', color: 'bg-orange-400', shadow: 'shadow-orange-500' },
  { id: 'H', letter: 'h', word: 'Hipopótamo', emoji: '🦛', color: 'bg-teal-400', shadow: 'shadow-teal-500' },
  { id: 'I', letter: 'i', word: 'Igreja', emoji: '⛪', color: 'bg-indigo-400', shadow: 'shadow-indigo-500' },
  { id: 'J', letter: 'j', word: 'Jacaré', emoji: '🐊', color: 'bg-lime-400', shadow: 'shadow-lime-500' },
  { id: 'K', letter: 'k', word: 'Kiwi', emoji: '🥝', color: 'bg-green-500', shadow: 'shadow-green-600' },
  { id: 'L', letter: 'l', word: 'Leão', emoji: '🦁', color: 'bg-amber-400', shadow: 'shadow-amber-500' },
  { id: 'M', letter: 'm', word: 'Macaco', emoji: '🐵', color: 'bg-cyan-400', shadow: 'shadow-cyan-500' },
  { id: 'N', letter: 'n', word: 'Navio', emoji: '🚢', color: 'bg-blue-500', shadow: 'shadow-blue-600' },
  { id: 'O', letter: 'o', word: 'Ovo', emoji: '🥚', color: 'bg-orange-300', shadow: 'shadow-orange-400' },
  { id: 'P', letter: 'p', word: 'Pato', emoji: '🦆', color: 'bg-yellow-500', shadow: 'shadow-yellow-600' },
  { id: 'Q', letter: 'q', word: 'Queijo', emoji: '🧀', color: 'bg-yellow-300', shadow: 'shadow-yellow-400' },
  { id: 'R', letter: 'r', word: 'Rato', emoji: '🐭', color: 'bg-gray-400', shadow: 'shadow-gray-500' },
  { id: 'S', letter: 's', word: 'Sapo', emoji: '🐸', color: 'bg-green-600', shadow: 'shadow-green-700' },
  { id: 'T', letter: 't', word: 'Trem', emoji: '🚂', color: 'bg-red-500', shadow: 'shadow-red-600' },
  { id: 'U', letter: 'u', word: 'Uva', emoji: '🍇', color: 'bg-purple-500', shadow: 'shadow-purple-600' },
  { id: 'V', letter: 'v', word: 'Vaca', emoji: '🐮', color: 'bg-stone-400', shadow: 'shadow-stone-500' },
  { id: 'W', letter: 'w', word: 'Wafer', emoji: '🧇', color: 'bg-amber-600', shadow: 'shadow-amber-700' },
  { id: 'X', letter: 'x', word: 'Xícara', emoji: '☕', color: 'bg-rose-400', shadow: 'shadow-rose-500' },
  { id: 'Y', letter: 'y', word: 'Yoga', emoji: '🧘', color: 'bg-teal-500', shadow: 'shadow-teal-600' },
  { id: 'Z', letter: 'z', word: 'Zebra', emoji: '🦓', color: 'bg-zinc-500', shadow: 'shadow-zinc-600' },
];

export default function Letters() {
  const navigate = useNavigate();
  const { currentUser } = useAppStore();
  const [activeLetter, setActiveLetter] = useState<typeof LETTERS_DATA[0] | null>(null);

  const playSound = async (letterId: string) => {
    // 1. Try local generated file first
    const audioPath = import.meta.env.BASE_URL + `audio/${letterId.toLowerCase()}.wav`;
    const audio = new Audio(audioPath);
    
    try {
      await audio.play();
    } catch (err) {
      console.warn(`Local audio not found for ${letterId}. Attempting APIs...`);
      const text = LETTERS_DATA.find(i => i.id === letterId)?.word;
      const fullPhrase = `${letterId} de ${text}`;

      // 2. Try Hugging Face XTTS-v2 API if token exists
      const hfToken = import.meta.env.VITE_HF_API_KEY;
      if (hfToken) {
        try {
          console.log('Calling Coqui XTTS-v2 Inference API...');
          const response = await fetch("https://router.huggingface.co/hf-inference/models/coqui/XTTS-v2", {
            headers: {
              Authorization: `Bearer ${hfToken}`,
              "Content-Type": "application/json",
            },
            method: "POST",
            body: JSON.stringify({ inputs: fullPhrase }),
          });

          if (!response.ok) throw new Error(`HF API Error: ${response.status}`);
          
          const audioBlob = await response.blob();
          const audioUrl = URL.createObjectURL(audioBlob);
          const hfAudio = new Audio(audioUrl);
          await hfAudio.play();
          return; // Success, exit function
        } catch (apiErr) {
          console.error('Coqui XTTS-v2 API failed:', apiErr);
        }
      }

      // 3. Fallback to basic browser Speech Synthesis
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(fullPhrase);
        utterance.lang = 'pt-BR';
        utterance.rate = 0.8;
        utterance.pitch = 1.2;
        window.speechSynthesis.speak(utterance);
      }
    }
  };

  const handleLetterClick = async (item: typeof LETTERS_DATA[0]) => {
    setActiveLetter(item);
    playSound(item.id);
    if (currentUser?.id) {
      try {
        // @ts-ignore
        await window.electronAPI.incrementClick(currentUser.id, item.id);
      } catch (err) {
        console.error('Failed to log progress', err);
      }
    }
  };

  const closeOverlay = () => {
    setActiveLetter(null);
  };

  if (!currentUser) {
    navigate('/login');
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen bg-yellow-50 overflow-x-hidden">
      {/* Header */}
      <div className="flex items-center p-6 mb-4">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate('/home')}
          className="bg-white text-gray-700 w-16 h-16 rounded-full shadow-md text-3xl flex items-center justify-center font-bold"
        >
          ←
        </motion.button>
        <h1 className="text-4xl font-extrabold text-yellow-600 ml-8 flex-1 text-center pr-16 drop-shadow-sm">
          Letras
        </h1>
      </div>

      {/* Grid */}
      <div className="flex-1 px-8 pb-12">
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 max-w-6xl mx-auto">
          {LETTERS_DATA.map((item) => (
            <motion.div
              key={item.id}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleLetterClick(item)}
              className={`${item.color} ${item.shadow} shadow-lg rounded-[2rem] aspect-[4/5] flex flex-col items-center justify-center cursor-pointer border-4 border-white/40 overflow-hidden relative group`}
            >
              <div className="flex flex-col items-center gap-1 mt-2">
                <span className="text-4xl xl:text-5xl font-black text-white drop-shadow-md tracking-widest">{item.id} {item.letter}</span>
                <span className="text-3xl xl:text-4xl font-cursive text-white/90 drop-shadow-sm tracking-widest">{item.id} {item.letter}</span>
              </div>
              <span className="text-5xl xl:text-6xl group-hover:scale-110 transition-transform mb-2">{item.emoji}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Active Letter Overlay */}
      <AnimatePresence>
        {activeLetter && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6"
            onClick={closeOverlay}
          >
            <motion.div
              initial={{ scale: 0.5, y: 100 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', bounce: 0.5 }}
              onClick={(e) => e.stopPropagation()}
              className={`${activeLetter.color} rounded-[3rem] p-12 flex flex-col items-center shadow-2xl relative max-w-sm w-full border-8 border-white`}
            >
              <button
                onClick={closeOverlay}
                className="absolute top-6 right-6 bg-white/30 hover:bg-white text-white hover:text-gray-800 w-12 h-12 rounded-full font-bold text-2xl transition-colors"
              >
                ✕
              </button>

              <motion.div
                 initial={{ scale: 0 }}
                 animate={{ scale: 1, rotate: 360 }}
                 transition={{ delay: 0.2, type: 'spring', duration: 0.8 }}
                 className="flex flex-col items-center text-white drop-shadow-xl"
              >
                <div className="text-[7rem] font-black leading-none mb-4 tracking-widest">
                  {activeLetter.id} {activeLetter.letter}
                </div>
                <div className="text-[6rem] font-cursive leading-none text-white/90 tracking-widest">
                  {activeLetter.id} {activeLetter.letter}
                </div>
              </motion.div>
              
              <div className="flex flex-col items-center mt-8 bg-white/20 p-6 rounded-3xl w-full">
                 <span className="text-[8rem] leading-none mb-4">{activeLetter.emoji}</span>
                 <h2 className="text-4xl font-extrabold text-white uppercase text-center drop-shadow-md tracking-wider">
                   {activeLetter.word}
                 </h2>
              </div>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => playSound(activeLetter.id)}
                className="bg-white text-gray-800 mt-10 rounded-full py-4 px-10 text-2xl font-bold shadow-xl flex items-center gap-4 hover:bg-gray-50"
              >
                <span className="text-3xl">🔊</span> Ouvir
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
