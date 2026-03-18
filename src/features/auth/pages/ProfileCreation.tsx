import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppStore } from '../../../app/store';

const AVATARS = ['🦊', '🐼', '🐸', '🐯', '🐰', '🦁', '🐻', '🐨'];
const AGES = [6, 7, 8, 9];

export default function ProfileCreation() {
  const navigate = useNavigate();
  const setCurrentUser = useAppStore((state) => state.setCurrentUser);

  const [name, setName] = useState('');
  const [age, setAge] = useState<number | null>(null);
  const [avatar, setAvatar] = useState<string | null>(null);

  const canSubmit = name.trim().length > 0 && age !== null && avatar !== null;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    
    try {
      // @ts-ignore
      const id = await window.electronAPI.createUser({ name, age, avatar });
      setCurrentUser({ id, name, age, avatar });
      navigate('/home');
    } catch (error) {
      console.error('Failed to create user', error);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-blue-50 p-6">
      <h1 className="text-4xl font-extrabold text-blue-600 mb-8 mt-4">Novo Perfil</h1>
      
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 flex flex-col gap-6">
        <div>
          <h2 className="text-xl font-bold text-gray-700 mb-4 text-center">Escolha um Avatar</h2>
          <div className="grid grid-cols-4 gap-4">
            {AVATARS.map((emoji) => (
              <motion.button
                key={emoji}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setAvatar(emoji)}
                className={`text-5xl p-2 rounded-2xl flex items-center justify-center transition-colors ${
                  avatar === emoji ? 'bg-blue-100 border-4 border-blue-400' : 'bg-gray-100 border-4 border-transparent'
                }`}
              >
                {emoji}
              </motion.button>
            ))}
          </div>
        </div>

        <div>
           <h2 className="text-xl font-bold text-gray-700 mb-4 text-center">Qual o seu nome?</h2>
           <input 
             type="text" 
             value={name}
             onChange={(e) => setName(e.target.value)}
             placeholder="Seu nome..." 
             className="w-full text-center text-3xl font-bold text-gray-800 bg-gray-100 rounded-2xl py-4 focus:outline-none focus:ring-4 focus:ring-blue-400 transition-shadow"
           />
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-700 mb-4 text-center">Sua idade</h2>
          <div className="flex justify-center gap-4">
            {AGES.map((a) => (
              <motion.button
                key={a}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setAge(a)}
                className={`w-16 h-16 rounded-full text-2xl font-bold transition-colors ${
                  age === a ? 'bg-primary-pink text-white shadow-lg' : 'bg-gray-200 text-gray-600'
                }`}
              >
                {a}
              </motion.button>
            ))}
          </div>
        </div>

        <motion.button
          disabled={!canSubmit}
          whileHover={canSubmit ? { scale: 1.05 } : {}}
          whileTap={canSubmit ? { scale: 0.95 } : {}}
          onClick={handleSubmit}
          className={`mt-4 py-4 rounded-full text-2xl font-extrabold transition-colors shadow-lg ${
            canSubmit ? 'bg-primary-green text-white cursor-pointer' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Entrar 🎉
        </motion.button>
      </div>
    </div>
  );
}
