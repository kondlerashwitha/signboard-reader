'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@iconify/react';

interface AudioDetectorProps {
  onClapDetected: () => void;
  isActive: boolean;
}

export default function AudioDetector({ onClapDetected, isActive }: AudioDetectorProps) {
  const [isListening, setIsListening] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const lastClapRef = useRef<number>(0);

  useEffect(() => {
    let ctx: AudioContext | null = null;
    let analyser: AnalyserNode | null = null;
    let mic: MediaStreamAudioSourceNode | null = null;
    let rafId = 0;
    let stream: MediaStream | null = null;

    const start = async () => {
      try {
        ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        analyser = ctx.createAnalyser();
        analyser.fftSize = 1024;
        mic = ctx.createMediaStreamSource(stream);
        mic.connect(analyser);
        const data = new Uint8Array(analyser.frequencyBinCount);
        setIsListening(true);

        const loop = () => {
          if (!analyser) return;
          analyser.getByteTimeDomainData(data);
          // compute simple peak-to-peak amplitude
          let min = 255, max = 0;
          for (let i = 0; i < data.length; i++) {
            const v = data[i];
            if (v < min) min = v;
            if (v > max) max = v;
          }
          const amplitude = (max - min) / 255;
          setAudioLevel(amplitude);

          const now = performance.now();
          const threshold = 0.6; // tuned for clap spikes
          const debounceMs = 1200;
          if (amplitude > threshold && now - lastClapRef.current > debounceMs) {
            lastClapRef.current = now;
            onClapDetected();
          }
          rafId = requestAnimationFrame(loop);
        };
        loop();
      } catch (e: any) {
        setError(e?.message ?? 'Unable to access microphone');
      }
    };

    start();
    return () => {
      cancelAnimationFrame(rafId);
      try { mic?.disconnect(); } catch {}
      try { analyser?.disconnect(); } catch {}
      try { stream?.getTracks().forEach(t => t.stop()); } catch {}
      try { ctx?.close(); } catch {}
      setIsListening(false);
    };
  }, [onClapDetected]);

  return (
    <div className="mt-4">
      <div className="flex items-center justify-center gap-3">
        <div className="h-2 w-40 rounded-full overflow-hidden bg-white/10">
          <motion.div
            className="h-full"
            animate={{ width: `${Math.min(100, Math.round(audioLevel * 120))}%` }}
            transition={{ type: 'spring', stiffness: 120, damping: 20 }}
            style={{ background: isActive ? 'rgb(34 197 94)' : 'rgb(59 130 246)' }}
          />
        </div>
        <span className="text-blue-200 text-sm flex items-center gap-1">
          <Icon icon="mdi:hand-clap" />
          {isListening ? 'Listening' : 'Init…'}
        </span>
      </div>
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="text-red-300 text-sm text-center mt-2"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
