import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppStore, MatchLetterRound } from '../../../app/store';
import MatchLettersHeader from '../components/MatchLettersHeader';
import LetterNode, { LetterNodeState } from '../components/LetterNode';
import MatchActions from '../components/MatchActions';
import SuccessFeedback from '../components/SuccessFeedback';

// ─────────────────────────────────────────
// Types
// ─────────────────────────────────────────
interface NodeRect {
  x: number;
  y: number;
}

// ─────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
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

// ─────────────────────────────────────────
// Component
// ─────────────────────────────────────────
export default function MatchLettersTask() {
  const { roundId } = useParams<{ roundId: string }>();
  const navigate = useNavigate();
  const {
    currentUser,
    matchLetterRounds,
    setMatchLetterRounds,
    matchLetterProgress,
    setMatchLetterProgress,
  } = useAppStore();

  // ── Round data ───────────────────────────
  const [round, setRound] = useState<MatchLetterRound | null>(null);

  // Parsed pairs: [['A','a'], ...]
  const pairs = useMemo<string[][]>(() => {
    if (!round) return [];
    return JSON.parse(round.pairs);
  }, [round]);

  const uppers = useMemo(() => pairs.map(([u]) => u), [pairs]);
  const lowers = useMemo(() => pairs.map(([, l]) => l), [pairs]);

  // ── Shuffled right column ────────────────
  const [shuffledLowers, setShuffledLowers] = useState<string[]>([]);

  // ── Game state ───────────────────────────
  const [connections, setConnections] = useState<Record<string, string>>({}); // { 'A': 'a' }
  const [selected, setSelected] = useState<string | null>(null); // selected upper letter
  const [wrongUpper, setWrongUpper] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // ── SVG live line ────────────────────────
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null);

  // ── DOM refs for SVG line endpoints ──────
  const containerRef = useRef<HTMLDivElement>(null);
  const upperRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const lowerRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  // ─────────────────────────────────────────
  // Load round & progress
  // ─────────────────────────────────────────
  useEffect(() => {
    if (!currentUser) { navigate('/login'); return; }

    const loadAll = async () => {
      try {
        let rounds = matchLetterRounds;
        if (!rounds.length) {
          // @ts-ignore
          rounds = await window.electronAPI.getMatchLetterRounds();
          setMatchLetterRounds(rounds);
        }

        const found = rounds.find((r) => r.id === Number(roundId));
        if (!found) { navigate('/tasks/match-letters'); return; }
        setRound(found);
        setConnections({});
        setSelected(null);
        setShowSuccess(false);
        setWrongUpper(null);
        setDragPos(null);

        if (matchLetterProgress.length === 0) {
          // @ts-ignore
          const prog = await window.electronAPI.getMatchLetterProgress(currentUser.id);
          setMatchLetterProgress(prog);
        }
      } catch (err) {
        console.error('Failed to load round', err);
      }
    };
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roundId, currentUser]);

  // Shuffle whenever pairs change
  useEffect(() => {
    if (lowers.length) setShuffledLowers(shuffle(lowers));
  }, [lowers]);

  // ─────────────────────────────────────────
  // Mouse/Touch tracking for live SVG line
  // ─────────────────────────────────────────
  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!selected || !containerRef.current) return;
      const cr = containerRef.current.getBoundingClientRect();
      setDragPos({ x: e.clientX - cr.left, y: e.clientY - cr.top });
    },
    [selected]
  );

  const handlePointerUp = useCallback(() => {
    // If pointer released on nothing, deselect
    setDragPos(null);
  }, []);

  // ─────────────────────────────────────────
  // Interaction
  // ─────────────────────────────────────────
  const handleUpperClick = (letter: string) => {
    if (connections[letter]) return; // already connected
    setSelected((prev) => (prev === letter ? null : letter));
    setDragPos(null);
  };

  const handleLowerClick = (lower: string) => {
    if (!selected) return;
    // Find what upper this lower belongs to
    const correctUpper = pairs.find(([, l]) => l === lower)?.[0];
    if (correctUpper === selected) {
      // ✅ Correct!
      const next = { ...connections, [selected]: lower };
      setConnections(next);
      setSelected(null);
      setDragPos(null);

      // Play a positive sound
      playSoftSound(true);

      // Check completion
      if (Object.keys(next).length === pairs.length) {
        setTimeout(() => setShowSuccess(true), 400);
        saveProgress(true);
      }
    } else {
      // ❌ Wrong
      setWrongUpper(selected);
      playSoftSound(false);
      saveProgress(false);
      setTimeout(() => {
        setWrongUpper(null);
        setSelected(null);
        setDragPos(null);
      }, 800);
    }
  };

  // ─────────────────────────────────────────
  // Audio feedback
  // ─────────────────────────────────────────
  const playSoftSound = (correct: boolean) => {
    if (!('AudioContext' in window)) return;
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = correct ? 660 : 220;
      osc.type = correct ? 'sine' : 'triangle';
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch {/* ignore */}
  };

  // ─────────────────────────────────────────
  // Progress persistence
  // ─────────────────────────────────────────
  const saveProgress = async (completed: boolean) => {
    if (!currentUser || !round) return;
    try {
      // @ts-ignore
      await window.electronAPI.saveMatchLetterProgress(currentUser.id, round.id, completed);
      // @ts-ignore
      const updated = await window.electronAPI.getMatchLetterProgress(currentUser.id);
      setMatchLetterProgress(updated);
    } catch (err) {
      console.error('Failed to save progress', err);
    }
  };

  // ─────────────────────────────────────────
  // Clear
  // ─────────────────────────────────────────
  const handleClear = () => {
    setConnections({});
    setSelected(null);
    setDragPos(null);
    setWrongUpper(null);
  };

  // ─────────────────────────────────────────
  // Next round
  // ─────────────────────────────────────────
  const handleNext = () => {
    if (!round || !matchLetterRounds.length) return;
    const next = matchLetterRounds.find((r) => r.order_index === round.order_index + 1);
    if (next) {
      navigate(`/tasks/match-letters/${next.id}`);
    } else {
      navigate('/home');
    }
  };

  // ─────────────────────────────────────────
  // SVG line data
  // ─────────────────────────────────────────
  const getSvgLines = () => {
    const lines: { x1: number; y1: number; x2: number; y2: number; key: string; correct: boolean }[] = [];

    // Committed connections
    Object.entries(connections).forEach(([upper, lower]) => {
      const from = centerOf(upperRefs.current[upper], containerRef.current);
      const to = centerOf(lowerRefs.current[lower], containerRef.current);
      if (from && to) {
        lines.push({ x1: from.x, y1: from.y, x2: to.x, y2: to.y, key: upper, correct: true });
      }
    });

    return lines;
  };

  const svgLines = getSvgLines();

  // Active drag line endpoint
  const activeDragStart = selected
    ? centerOf(upperRefs.current[selected], containerRef.current)
    : null;

  // ─────────────────────────────────────────
  // Node state helpers
  // ─────────────────────────────────────────
  const getUpperState = (letter: string): LetterNodeState => {
    if (connections[letter]) return 'correct';
    if (wrongUpper === letter) return 'wrong';
    if (selected === letter) return 'selected';
    return 'normal';
  };

  const getLowerState = (lower: string): LetterNodeState => {
    const isConnected = Object.values(connections).includes(lower);
    if (isConnected) return 'correct';
    // wrong flash: show wrong state on the lower if it was the one clicked
    return 'normal';
  };

  // ─────────────────────────────────────────
  // Render guards
  // ─────────────────────────────────────────
  if (!round) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-purple-50">
        <p className="text-purple-400 text-2xl font-bold animate-pulse">Carregando…</p>
      </div>
    );
  }

  const totalRounds = matchLetterRounds.length;
  const isLast = round.order_index === totalRounds;

  return (
    <div className="flex flex-col min-h-screen bg-purple-50 select-none">
      <MatchLettersHeader current={round.order_index} total={totalRounds} />

      {/* Instruction */}
      <div className="px-6 mb-4">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[1.5rem] shadow-md px-6 py-4 flex items-center gap-4"
        >
          <span className="text-4xl">🔗</span>
          <p className="text-xl font-bold text-gray-600">
            Ligue a letra <span className="text-indigo-600">MAIÚSCULA</span> com a{' '}
            <span className="text-amber-600">minúscula</span> igual!
          </p>
        </motion.div>
      </div>

      {/* Activity area */}
      <div
        ref={containerRef}
        className="flex-1 relative px-4 pb-2"
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {/* SVG overlay for lines */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ zIndex: 10 }}
        >
          {/* Committed connection lines */}
          {svgLines.map((line) => (
            <motion.line
              key={line.key}
              x1={line.x1}
              y1={line.y1}
              x2={line.x2}
              y2={line.y2}
              stroke="#4ade80"
              strokeWidth={5}
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
          ))}

          {/* Live drag line */}
          {activeDragStart && dragPos && (
            <line
              x1={activeDragStart.x}
              y1={activeDragStart.y}
              x2={dragPos.x}
              y2={dragPos.y}
              stroke="#818cf8"
              strokeWidth={4}
              strokeLinecap="round"
              strokeDasharray="10 6"
              opacity={0.8}
            />
          )}
        </svg>

        {/* Two columns */}
        <div className="flex justify-around items-start max-w-lg mx-auto pt-4">
          {/* Left: uppercase */}
          <div className="flex flex-col gap-5 items-center">
            <span className="text-purple-500 font-extrabold text-lg uppercase tracking-widest mb-1">
              Maiúsculas
            </span>
            {uppers.map((letter) => (
              <div key={letter} style={{ position: 'relative', zIndex: 20 }}>
                <LetterNode
                  ref={(el) => { upperRefs.current[letter] = el; }}
                  letter={letter}
                  variant="upper"
                  state={getUpperState(letter)}
                  onClick={() => handleUpperClick(letter)}
                />
              </div>
            ))}
          </div>

          {/* Right: shuffled lowercase */}
          <div className="flex flex-col gap-5 items-center">
            <span className="text-amber-500 font-extrabold text-lg uppercase tracking-widest mb-1">
              Minúsculas
            </span>
            {shuffledLowers.map((lower) => (
              <div key={lower} style={{ position: 'relative', zIndex: 20 }}>
                <LetterNode
                  ref={(el) => { lowerRefs.current[lower] = el; }}
                  letter={lower}
                  variant="lower"
                  state={getLowerState(lower)}
                  onClick={() => handleLowerClick(lower)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <MatchActions
        onClear={handleClear}
        hasConnections={Object.keys(connections).length > 0}
      />

      <SuccessFeedback
        visible={showSuccess}
        onNext={handleNext}
        isLast={isLast}
      />
    </div>
  );
}
