import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore, WritingTask } from '../../../app/store';
import WritingTaskHeader from '../components/WritingTaskHeader';
import LetterReferenceCard from '../components/LetterReferenceCard';
import WritingCanvas, { WritingCanvasHandle } from '../components/WritingCanvas';
import TaskActions from '../components/TaskActions';
import PositiveFeedback from '../components/PositiveFeedback';

export default function WritingTaskPage() {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const { currentUser, writingTasks, writingProgress, setWritingProgress } = useAppStore();

  const [task, setTask] = useState<WritingTask | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [hasStrokes, setHasStrokes] = useState(false);
  const canvasRef = useRef<WritingCanvasHandle>(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!currentUser) navigate('/login');
  }, [currentUser, navigate]);

  // Load task by id
  useEffect(() => {
    if (!writingTasks.length || !taskId) return;
    const found = writingTasks.find((t) => t.id === Number(taskId));
    if (!found) { navigate('/tasks/writing'); return; }
    setTask(found);
    setShowFeedback(false);
  }, [taskId, writingTasks, navigate]);

  // Auto-play audio when task changes
  useEffect(() => {
    if (task) playAudio(task);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task?.id]);

  const playAudio = async (t: WritingTask) => {
    const audioPath = import.meta.env.BASE_URL + t.audio_path;
    const audio = new Audio(audioPath);
    try {
      await audio.play();
    } catch {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utt = new SpeechSynthesisUtterance(`${t.letter} de ${t.word}`);
        utt.lang = 'pt-BR';
        utt.rate = 0.8;
        utt.pitch = 1.2;
        window.speechSynthesis.speak(utt);
      }
    }
  };

  const handleClear = () => {
    canvasRef.current?.clear();
    setHasStrokes(false);
  };

  const handleStrokeChange = () => {
    setHasStrokes(canvasRef.current?.hasStrokes() ?? false);
  };

  const handleComplete = async () => {
    if (!currentUser || !task) return;
    try {
      // @ts-ignore
      await window.electronAPI.saveWritingProgress(currentUser.id, task.id, true);
      const updated = writingProgress.filter(
        (p) => !(p.user_id === currentUser.id && p.task_id === task.id)
      );
      setWritingProgress([
        ...updated,
        {
          id: 0,
          user_id: currentUser.id,
          task_id: task.id,
          attempts_count: 1,
          completed: 1,
          completed_at: new Date().toISOString(),
        },
      ]);
    } catch (err) {
      console.error('Failed to save progress', err);
    }
    setShowFeedback(true);
  };

  const handleNext = () => {
    if (!task || !writingTasks.length) return;
    const nextTask = writingTasks.find((t) => t.order_index === task.order_index + 1);
    if (nextTask) {
      navigate(`/tasks/writing/${nextTask.id}`);
    } else {
      navigate('/home');
    }
  };

  if (!task) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-sky-50">
        <p className="text-sky-400 text-2xl font-bold animate-pulse">Carregando…</p>
      </div>
    );
  }

  const isLast = task.order_index === writingTasks.length;

  return (
    <div
      className="flex flex-col min-h-screen bg-sky-50"
      onMouseUp={handleStrokeChange}
      onTouchEnd={handleStrokeChange}
    >
      <WritingTaskHeader current={task.order_index} total={writingTasks.length} />

      <LetterReferenceCard task={task} onAudio={() => playAudio(task)} />

      <WritingCanvas ref={canvasRef} />

      <TaskActions
        onClear={handleClear}
        onAudio={() => playAudio(task)}
        onComplete={handleComplete}
        hasStrokes={hasStrokes}
      />

      <PositiveFeedback visible={showFeedback} onNext={handleNext} isLast={isLast} />
    </div>
  );
}
