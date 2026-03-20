import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { MatchWordRound, useAppStore } from '../../../app/store';
import MatchWordsHeader from '../components/MatchWordsHeader';
import WordCard, { WordCardState } from '../components/WordCard';
import AnimalCardItem, { AnimalCardState } from '../components/AnimalCardItem';
import WordMatchActions from '../components/WordMatchActions';
import WordSuccessFeedback from '../components/WordSuccessFeedback';

interface WordAnimalPair {
  word: string;
  animal: string;
}

interface NodeRect {
  x: number;
  y: number;
}

function shuffle<T>(items: T[]) {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

function centerOf(el: HTMLElement | null, container: HTMLElement | null): NodeRect | null {
  if (!el || !container) return null;
  const er = el.getBoundingClientRect();
  const cr = container.getBoundingClientRect();
  return {
    x: er.left - cr.left + er.width / 2,
    y: er.top - cr.top + er.height / 2,
  };
}

async function speakText(text: string) {
  // 1. Try pre-recorded audio first
  const audioPath = `audio/${text.toLowerCase()}.wav`;
  const audio = new Audio(audioPath);
  
  try {
    await audio.play();
  } catch {
    // 2. Fallback to Speech Synthesis
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    utterance.rate = 0.85;
    utterance.pitch = 1.1;
    window.speechSynthesis.speak(utterance);
  }
}

function playSoftSound(correct: boolean) {
  if (!('AudioContext' in window)) return;
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = correct ? 720 : 220;
    osc.type = correct ? 'sine' : 'triangle';
    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch {
    // noop
  }
}

export default function MatchWordsTask() {
  const { roundId } = useParams<{ roundId: string }>();
  const navigate = useNavigate();
  const {
    currentUser,
    matchWordRounds,
    setMatchWordRounds,
    matchWordProgress,
    setMatchWordProgress,
  } = useAppStore();

  const [round, setRound] = useState<MatchWordRound | null>(null);
  const [shuffledAnimals, setShuffledAnimals] = useState<string[]>([]);
  const [connections, setConnections] = useState<Record<string, string>>({});
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [wrongWord, setWrongWord] = useState<string | null>(null);
  const [wrongAnimal, setWrongAnimal] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [dragPos, setDragPos] = useState<NodeRect | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const wordRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const animalRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const pairs = useMemo<WordAnimalPair[]>(() => {
    if (!round) return [];
    return JSON.parse(round.pairs);
  }, [round]);

  const words = useMemo(() => pairs.map((pair) => pair.word), [pairs]);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    const loadAll = async () => {
      try {
        let rounds = matchWordRounds;
        if (!rounds.length) {
          // @ts-ignore
          rounds = await window.electronAPI.getMatchWordRounds();
          setMatchWordRounds(rounds);
        }

        const found = rounds.find((item) => item.id === Number(roundId));
        if (!found) {
          navigate('/tasks/match-words');
          return;
        }

        setRound(found);
        setConnections({});
        setSelectedWord(null);
        setWrongWord(null);
        setWrongAnimal(null);
        setFeedbackMessage('');
        setShowSuccess(false);
        setDragPos(null);

        if (matchWordProgress.length === 0) {
          // @ts-ignore
          const progress = await window.electronAPI.getMatchWordProgress(currentUser.id);
          setMatchWordProgress(progress);
        }
      } catch (error) {
        console.error('Failed to load match words round', error);
      }
    };

    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roundId, currentUser]);

  useEffect(() => {
    if (pairs.length) {
      setShuffledAnimals(shuffle(pairs.map((pair) => pair.animal)));
    }
  }, [pairs]);

  useEffect(() => () => window.speechSynthesis?.cancel(), []);

  const saveProgress = async (completed: boolean) => {
    if (!currentUser || !round) return;
    try {
      // @ts-ignore
      await window.electronAPI.saveMatchWordProgress(currentUser.id, round.id, completed);
      // @ts-ignore
      const updated = await window.electronAPI.getMatchWordProgress(currentUser.id);
      setMatchWordProgress(updated);
    } catch (error) {
      console.error('Failed to save match words progress', error);
    }
  };

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!selectedWord || !containerRef.current) return;
      const cr = containerRef.current.getBoundingClientRect();
      setDragPos({
        x: event.clientX - cr.left,
        y: event.clientY - cr.top,
      });
    },
    [selectedWord]
  );

  const handlePointerUp = useCallback(() => {
    setDragPos(null);
  }, []);

  const clearWrongFeedback = () => {
    setTimeout(() => {
      setWrongWord(null);
      setWrongAnimal(null);
      setSelectedWord(null);
      setDragPos(null);
      setFeedbackMessage('');
    }, 900);
  };

  const handleWordClick = (word: string) => {
    if (connections[word]) return;
    setFeedbackMessage('');
    setWrongWord(null);
    setWrongAnimal(null);
    setSelectedWord((current) => (current === word ? null : word));
    setDragPos(null);
  };

  const handleAnimalClick = (animal: string) => {
    if (!selectedWord) return;

    const correctAnimal = pairs.find((pair) => pair.word === selectedWord)?.animal;
    if (correctAnimal === animal) {
      const nextConnections = { ...connections, [selectedWord]: animal };
      setConnections(nextConnections);
      setSelectedWord(null);
      setDragPos(null);
      setFeedbackMessage('Muito bem!');
      playSoftSound(true);

      if (Object.keys(nextConnections).length === pairs.length) {
        void saveProgress(true);
        setTimeout(() => setShowSuccess(true), 350);
      }
      return;
    }

    setWrongWord(selectedWord);
    setWrongAnimal(animal);
    setFeedbackMessage('Quase! Tente de novo 😊');
    playSoftSound(false);
    void saveProgress(false);
    clearWrongFeedback();
  };

  const handleClear = () => {
    setConnections({});
    setSelectedWord(null);
    setWrongWord(null);
    setWrongAnimal(null);
    setFeedbackMessage('');
    setDragPos(null);
    setShuffledAnimals(shuffle(pairs.map((pair) => pair.animal)));
  };

  const handleListenAll = async () => {
    speakText('Ligue a palavra ao animal certo');
    for (const word of words) {
      await new Promise((resolve) => {
        const timeout = window.setTimeout(resolve, 1200);
        if (!('speechSynthesis' in window)) {
          clearTimeout(timeout);
          resolve(null);
          return;
        }
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(word);
        utterance.lang = 'pt-BR';
        utterance.rate = 0.82;
        utterance.onend = () => {
          clearTimeout(timeout);
          resolve(null);
        };
        window.speechSynthesis.speak(utterance);
      });
    }
  };

  const handleNext = () => {
    if (!round || !matchWordRounds.length) return;
    const next = matchWordRounds.find((item) => item.order_index === round.order_index + 1);
    if (next) {
      navigate(`/tasks/match-words/${next.id}`);
      return;
    }
    navigate('/home');
  };

  const getWordState = (word: string): WordCardState => {
    if (connections[word]) return 'correct';
    if (wrongWord === word) return 'wrong';
    if (selectedWord === word) return 'selected';
    return 'normal';
  };

  const getAnimalState = (animal: string): AnimalCardState => {
    if (Object.values(connections).includes(animal)) return 'correct';
    return 'normal';
  };

  const svgLines = Object.entries(connections)
    .map(([word, animal]) => {
      const from = centerOf(wordRefs.current[word], containerRef.current);
      const to = centerOf(animalRefs.current[animal], containerRef.current);
      if (!from || !to) return null;
      return {
        key: `${word}-${animal}`,
        x1: from.x,
        y1: from.y,
        x2: to.x,
        y2: to.y,
      };
    })
    .filter(Boolean) as Array<{ key: string; x1: number; y1: number; x2: number; y2: number }>;

  const activeDragStart = selectedWord
    ? centerOf(wordRefs.current[selectedWord], containerRef.current)
    : null;

  if (!round) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-orange-50">
        <p className="animate-pulse text-2xl font-bold text-orange-400">Carregando…</p>
      </div>
    );
  }

  const totalRounds = matchWordRounds.length;
  const isLast = round.order_index === totalRounds;

  return (
    <div className="flex min-h-screen flex-col bg-[radial-gradient(circle_at_top,_#fff7ed,_#ffedd5_45%,_#fde68a)] select-none">
      <MatchWordsHeader current={round.order_index} total={totalRounds} />

      <div className="px-5 pb-3">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[1.8rem] bg-white/90 px-5 py-4 shadow-lg ring-1 ring-orange-100"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100 text-3xl">
              🐾
            </div>
            <div className="flex-1">
              <p className="text-sm font-black uppercase tracking-[0.2em] text-orange-400">Instrução</p>
              <p className="text-xl font-black text-slate-700">Ligue a palavra ao animal certo</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
              onClick={() => speakText('Ligue a palavra ao animal certo')}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-sky-100 text-2xl text-sky-700 shadow"
              aria-label="Ouvir instrução"
            >
              🔊
            </motion.button>
          </div>
        </motion.div>
      </div>

      <div
        ref={containerRef}
        className="relative flex-1 px-4 pb-2"
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <svg className="pointer-events-none absolute inset-0 h-full w-full" style={{ zIndex: 10 }}>
          {svgLines.map((line) => (
            <motion.line
              key={line.key}
              x1={line.x1}
              y1={line.y1}
              x2={line.x2}
              y2={line.y2}
              stroke="#22c55e"
              strokeWidth={6}
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.25 }}
            />
          ))}

          {activeDragStart && dragPos && (
            <line
              x1={activeDragStart.x}
              y1={activeDragStart.y}
              x2={dragPos.x}
              y2={dragPos.y}
              stroke="#f97316"
              strokeWidth={5}
              strokeLinecap="round"
              strokeDasharray="10 8"
              opacity={0.8}
            />
          )}
        </svg>

        <div className="mx-auto grid max-w-5xl gap-4 rounded-[2rem] bg-white/70 px-4 py-5 shadow-xl ring-1 ring-orange-100 md:grid-cols-[1fr_auto_1fr]">
          <div className="flex flex-col gap-4">
            <span className="px-2 text-center text-sm font-black uppercase tracking-[0.25em] text-indigo-500">
              Palavras
            </span>
            {words.map((word) => (
              <div key={word} style={{ position: 'relative', zIndex: 20 }}>
                <WordCard
                  ref={(el) => {
                    wordRefs.current[word] = el;
                  }}
                  word={word}
                  state={getWordState(word)}
                  onClick={() => handleWordClick(word)}
                  onAudio={() => speakText(word)}
                />
              </div>
            ))}
          </div>

          <div className="hidden items-center justify-center md:flex">
            <div className="h-full w-px bg-gradient-to-b from-transparent via-orange-200 to-transparent" />
          </div>

          <div className="flex flex-col gap-4">
            <span className="px-2 text-center text-sm font-black uppercase tracking-[0.25em] text-amber-500">
              Animais
            </span>
            {shuffledAnimals.map((animal) => (
              <div key={animal} style={{ position: 'relative', zIndex: 20 }}>
                <AnimalCardItem
                  ref={(el: HTMLButtonElement | null) => {
                    animalRefs.current[animal] = el;
                  }}
                  emoji={animal}
                  state={getAnimalState(animal)}
                  onClick={() => handleAnimalClick(animal)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {feedbackMessage && !showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className={`mx-5 mb-3 rounded-2xl px-5 py-3 text-center text-lg font-bold shadow ${
              wrongAnimal
                ? 'bg-rose-100 text-rose-600'
                : 'bg-emerald-100 text-emerald-700'
            }`}
          >
            {feedbackMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <WordMatchActions
        onClear={handleClear}
        onListenAll={handleListenAll}
        hasConnections={Object.keys(connections).length > 0}
      />

      <WordSuccessFeedback
        visible={showSuccess}
        onNext={handleNext}
        isLast={isLast}
      />
    </div>
  );
}

