import {
  useRef,
  useEffect,
  useCallback,
  useImperativeHandle,
  forwardRef,
} from 'react';

export interface WritingCanvasHandle {
  clear: () => void;
  hasStrokes: () => boolean;
}

interface Point {
  x: number;
  y: number;
}

type Stroke = Point[];

const LINE_HEIGHT = 64;
const PEN_COLOR = '#1E3A5F';
const PEN_WIDTH = 5;

const WritingCanvas = forwardRef<WritingCanvasHandle>((_, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const strokesRef = useRef<Stroke[]>([]);
  const currentStrokeRef = useRef<Stroke | null>(null);
  const isDrawingRef = useRef(false);

  // ------------------------------------------------------------------
  // Drawing helpers
  // ------------------------------------------------------------------
  const drawAll = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvas;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#FFFEF5';
    ctx.fillRect(0, 0, width, height);

    // Guide lines
    ctx.strokeStyle = '#B0C4DE55';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 4]);
    for (let y = LINE_HEIGHT; y < height; y += LINE_HEIGHT) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    ctx.strokeStyle = '#B0C4DE33';
    ctx.lineWidth = 1;
    for (let y = LINE_HEIGHT / 2; y < height; y += LINE_HEIGHT) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // Strokes
    ctx.strokeStyle = PEN_COLOR;
    ctx.lineWidth = PEN_WIDTH;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const renderStroke = (stroke: Stroke) => {
      if (stroke.length < 2) return;
      ctx.beginPath();
      ctx.moveTo(stroke[0].x, stroke[0].y);
      for (let i = 1; i < stroke.length; i++) {
        ctx.lineTo(stroke[i].x, stroke[i].y);
      }
      ctx.stroke();
    };

    strokesRef.current.forEach(renderStroke);
    if (currentStrokeRef.current) renderStroke(currentStrokeRef.current);
  }, []);

  // ------------------------------------------------------------------
  // Resize observer
  // ------------------------------------------------------------------
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const observer = new ResizeObserver(() => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      drawAll();
    });
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [drawAll]);

  // ------------------------------------------------------------------
  // Pointer helpers
  // ------------------------------------------------------------------
  const getPoint = (e: React.MouseEvent | React.TouchEvent): Point => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      const t = e.touches[0];
      return { x: t.clientX - rect.left, y: t.clientY - rect.top };
    }
    return {
      x: (e as React.MouseEvent).clientX - rect.left,
      y: (e as React.MouseEvent).clientY - rect.top,
    };
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    isDrawingRef.current = true;
    currentStrokeRef.current = [getPoint(e)];
    drawAll();
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawingRef.current || !currentStrokeRef.current) return;
    e.preventDefault();
    currentStrokeRef.current.push(getPoint(e));
    drawAll();
  };

  const endDraw = () => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    if (currentStrokeRef.current && currentStrokeRef.current.length >= 2) {
      strokesRef.current.push(currentStrokeRef.current);
    }
    currentStrokeRef.current = null;
    drawAll();
  };

  // ------------------------------------------------------------------
  // Imperative handle
  // ------------------------------------------------------------------
  useImperativeHandle(ref, () => ({
    clear: () => {
      strokesRef.current = [];
      currentStrokeRef.current = null;
      drawAll();
    },
    hasStrokes: () => strokesRef.current.length > 0,
  }));

  return (
    <div className="flex-1 mx-4 mb-2 rounded-[2rem] overflow-hidden shadow-xl border-4 border-sky-200 bg-[#FFFEF5]">
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-crosshair touch-none"
        style={{ display: 'block' }}
        onMouseDown={startDraw}
        onMouseMove={draw}
        onMouseUp={endDraw}
        onMouseLeave={endDraw}
        onTouchStart={startDraw}
        onTouchMove={draw}
        onTouchEnd={endDraw}
      />
    </div>
  );
});

WritingCanvas.displayName = 'WritingCanvas';
export default WritingCanvas;
