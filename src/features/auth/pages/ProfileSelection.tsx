import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppStore, User } from '../../../app/store';

export default function ProfileSelection() {
  const navigate = useNavigate();
  const { setUsers, users, setCurrentUser } = useAppStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // @ts-ignore
        const dbUsers = await window.electronAPI.getUsers();
        setUsers(dbUsers);
      } catch (error) {
        console.error('Failed to load users', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [setUsers]);

  const handleSelectUser = (user: User) => {
    setCurrentUser(user);
    navigate('/home');
  };

  if (loading) return null;

  return (
    <div className="flex flex-col items-center min-h-screen bg-gradient-to-br from-blue-100 to-blue-200 p-6">
      <h1 className="text-4xl md:text-5xl font-extrabold text-blue-600 mb-12 mt-10 drop-shadow-md">Quem está usando?</h1>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-8 max-w-4xl w-full place-items-center">
        {users.map((user) => (
          <motion.div
            key={user.id}
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleSelectUser(user)}
            className="bg-white rounded-[2rem] shadow-xl flex flex-col items-center justify-center p-8 cursor-pointer border-4 border-transparent hover:border-blue-400 w-48 h-56 transition-all"
          >
            <div className="text-7xl mb-4">{user.avatar}</div>
            <h2 className="text-2xl font-bold text-gray-800">{user.name}</h2>
          </motion.div>
        ))}

        <motion.div
           whileHover={{ scale: 1.05, y: -5 }}
           whileTap={{ scale: 0.95 }}
           onClick={() => navigate('/create-profile')}
           className="bg-blue-50 border-4 border-dashed border-blue-400 rounded-[2rem] flex flex-col items-center justify-center p-8 cursor-pointer w-48 h-56 transition-all"
        >
          <div className="text-6xl text-blue-400 mb-4">+</div>
          <h2 className="text-xl font-bold text-blue-500 text-center uppercase tracking-wide">Novo<br/>Perfil</h2>
        </motion.div>
      </div>
    </div>
  );
}
