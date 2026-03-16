'use client';

import { useRef, useState, useEffect, useCallback } from 'react';

interface SignaturePadProps {
  onChange: (dataUrl: string | null) => void;
}

export default function SignaturePad({ onChange }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [isEmpty, setIsEmpty] = useState(true);

  const getPos = (e: MouseEvent | Touch, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: ('clientX' in e ? e.clientX : e.clientX) * scaleX - rect.left * scaleX,
      y: ('clientY' in e ? e.clientY : e.clientY) * scaleY - rect.top * scaleY,
    };
  };

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    const ctx = canvas.getContext('2d')!;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  useEffect(() => {
    initCanvas();
    window.addEventListener('resize', initCanvas);
    return () => window.removeEventListener('resize', initCanvas);
  }, [initCanvas]);

  function startDraw(x: number, y: number) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    drawing.current = true;
    const ctx = canvas.getContext('2d')!;
    ctx.beginPath();
    ctx.moveTo(x, y);
  }

  function draw(x: number, y: number) {
    if (!drawing.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    ctx.lineTo(x, y);
    ctx.stroke();
    if (isEmpty) {
      setIsEmpty(false);
      onChange(canvas.toDataURL('image/png'));
    }
  }

  function endDraw() {
    if (!drawing.current) return;
    drawing.current = false;
    const canvas = canvasRef.current;
    if (canvas && !isEmpty) onChange(canvas.toDataURL('image/png'));
  }

  function clear() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setIsEmpty(true);
    onChange(null);
  }

  return (
    <div>
      <div className="signature-pad-wrapper">
        {isEmpty && (
          <div className="signature-placeholder">Assine aqui</div>
        )}
        <canvas
          ref={canvasRef}
          style={{ width: '100%', height: 180, display: 'block' }}
          onMouseDown={(e) => {
            const pos = getPos(e.nativeEvent, canvasRef.current!);
            startDraw(pos.x, pos.y);
          }}
          onMouseMove={(e) => {
            const pos = getPos(e.nativeEvent, canvasRef.current!);
            draw(pos.x, pos.y);
          }}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={(e) => {
            e.preventDefault();
            const pos = getPos(e.touches[0], canvasRef.current!);
            startDraw(pos.x, pos.y);
          }}
          onTouchMove={(e) => {
            e.preventDefault();
            const pos = getPos(e.touches[0], canvasRef.current!);
            draw(pos.x, pos.y);
          }}
          onTouchEnd={endDraw}
        />
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
        <button type="button" className="btn btn--ghost btn--sm" onClick={clear} id="btn-clear-signature">
          Limpar assinatura
        </button>
      </div>
    </div>
  );
}
