import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, Variants } from 'framer-motion';
import { useAppStore } from '../../../app/store';

export default function WritingTaskList() {
  const navigate = useNavigate();
  const { currentUser, writingTasks, setWritingTasks, writingProgress, setWritingProgress } =
    useAppStore();

  // Redirect guard
  useEffect(() => {
    if (!currentUser) { navigate('/login'); return; }
  }, [currentUser, navigate]);

  // Load tasks + progress from Electron DB
  useEffect(() => {
    if (!currentUser) return;
    const load = async () => {
      try {
        // @ts-ignore
        const tasks = await window.electronAPI.getWritingTasks();
        setWritingTasks(tasks);
        // @ts-ignore
        const progress = await window.electronAPI.getWritingProgress(currentUser.id);
        setWritingProgress(progress);
      } catch (err) {
        console.error('Failed to load writing data', err);
      }
    };
    load();
  }, [currentUser, setWritingTasks, setWritingProgress]);

  const completedIds = new Set(
    writingProgress
      .filter((p) => p.user_id === currentUser?.id && p.completed === 1)
      .map((p) => p.task_id)
  );

  const completedCount = completedIds.size;

  const cardVariants: Variants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: (i: number) => ({
      opacity: 1,
      scale: 1,
      transition: { delay: i * 0.04, type: 'spring' as const, bounce: 0.4 },
    }),
  };

  return (
    <div className="flex flex-col min-h-screen bg-sky-50">
      {/* Header */}
      <div className="flex items-center p-5 bg-white shadow-sm rounded-b-[2rem] mb-4">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate('/home')}
          className="bg-sky-100 text-sky-600 w-14 h-14 rounded-full shadow text-3xl flex items-center justify-center font-bold flex-shrink-0"
        >
          ←
        </motion.button>

        <div className="flex-1 text-center px-2">
          <h1 className="text-3xl font-extrabold text-sky-600">Caligrafia ✏️</h1>
          <p className="text-sky-400 font-semibold text-lg">
            {completedCount} de {writingTasks.length} concluídas
          </p>
        </div>

        {/* Progress bar pill */}
        <div className="flex-shrink-0 w-20 h-5 bg-sky-100 rounded-full overflow-hidden shadow-inner">
          <motion.div
            className="h-full bg-gradient-to-r from-sky-400 to-emerald-400 rounded-full"
            initial={{ width: 0 }}
            animate={{
              width: writingTasks.length
                ? `${(completedCount / writingTasks.length) * 100}%`
                : '0%',
            }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Letter grid */}
      <div className="flex-1 px-4 pb-8">
        {writingTasks.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sky-400 text-2xl font-bold animate-pulse">Carregando…</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4 max-w-5xl mx-auto">
            {writingTasks.map((task, i) => {
              const done = completedIds.has(task.id);
              return (
                <motion.div
                  key={task.id}
                  custom={i}
                  initial="hidden"
                  animate="visible"
                  variants={cardVariants}
                  whileHover={{ scale: 1.07, y: -4 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate(`/tasks/writing/${task.id}`)}
                  className="aspect-square rounded-[1.5rem] flex flex-col items-center justify-center cursor-pointer relative shadow-lg border-4 border-white/50 overflow-hidden select-none"
                  style={{ background: done ? task.color : `${task.color}99` }}
                >
                  {/* Completion badge */}
                  {done && (
                    <div className="absolute top-2 right-2 text-xl">✅</div>
                  )}

                  <span
                    className="font-black text-white drop-shadow-md leading-none"
                    style={{ fontSize: '2.8rem' }}
                  >
                    {task.letter}
                  </span>
                  <span className="text-white/70 font-semibold text-base mt-0.5">
                    {task.letter.toLowerCase()}
                  </span>
                  <span className="text-2xl mt-1">{task.emoji}</span>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
