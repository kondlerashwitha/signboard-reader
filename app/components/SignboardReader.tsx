'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { motion, AnimatePresence } from 'framer-motion';
import CameraView, { CameraViewRef } from './CameraView';
import AudioDetector from './AudioDetector';
import LanguageSelector from './LanguageSelector';

type Lang = 'eng' | 'hin' | 'tel';

interface State {
  isActive: boolean;
  isProcessing: boolean;
  recognizedText: string;
  currentLanguage: Lang;
  status: string;
  error: string | null;
}

function speak(text: string, lang: Lang) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  const utter = new SpeechSynthesisUtterance(text);
  const hint = lang === 'eng' ? 'en-' : lang === 'hin' ? 'hi-' : 'te-';
  const voices = window.speechSynthesis.getVoices();
  const preferred = voices.find(v => v.lang.startsWith(hint));
  if (preferred) utter.voice = preferred;
  utter.lang = preferred?.lang || (lang === 'eng' ? 'en-US' : lang === 'hin' ? 'hi-IN' : 'te-IN');
  utter.rate = 1;
  utter.pitch = 1;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utter);
}

export default function SignboardReader() {
  const [state, setState] = useState<State>({
    isActive: false,
    isProcessing: false,
    recognizedText: '',
    currentLanguage: 'eng',
    status: 'Clap to activate camera.',
    error: null,
  });

  const cameraRef = useRef<CameraViewRef>(null);
  const processingRef = useRef(false);

  const setError = (msg: string | null) => setState(prev => ({ ...prev, error: msg }));

  const toggleActive = useCallback(() => {
    setState(prev => {
      const next = !prev.isActive;
      const status = next ? 'Camera activated! Point at text.' : 'Camera deactivated.';
      // Speak small status in English regardless to avoid unexpected language
      speak(next ? 'SignBoard Reader activated. Point the camera at text.' : 'SignBoard Reader deactivated.', prev.currentLanguage);
      return { ...prev, isActive: next, status, error: null };
    });
  }, []);

  const onLanguageChange = (lang: Lang) => {
    setState(prev => ({ ...prev, currentLanguage: lang }));
    speak(lang === 'eng' ? 'English selected' : lang === 'hin' ? 'हिंदी चयनित' : 'తెలుగు ఎంపికైంది', lang);
  };

  const runOcr = useCallback(async () => {
    if (processingRef.current) return;
    processingRef.current = true;
    setState(prev => ({ ...prev, isProcessing: true, status: 'Scanning…' }));
    try {
      const image = await cameraRef.current?.captureImage();
      if (!image) throw new Error('No frame captured');
      const { default: Tesseract } = await import('tesseract.js');
      const { data } = await (Tesseract as any).recognize(image, state.currentLanguage);
      const text: string = data?.text?.trim() || '';
      setState(prev => ({
        ...prev,
        recognizedText: text,
        status: text ? 'Text recognized. Speaking…' : 'No text detected. Try again.',
      }));
      if (text) speak(text, state.currentLanguage);
    } catch (e: any) {
      console.error(e);
      setError(e?.message ?? 'OCR failed');
    } finally {
      processingRef.current = false;
      setState(prev => ({ ...prev, isProcessing: false }));
    }
  }, [state.currentLanguage]);

  // Keyboard helper for testing (press space to toggle, enter to scan)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space') { e.preventDefault(); toggleActive(); }
      if (e.code === 'Enter') { e.preventDefault(); runOcr(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [toggleActive, runOcr]);

  return (
    <div className="space-y-6">
      {/* Status */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-blue-100">
          <span className={`w-2 h-2 rounded-full ${state.isActive ? 'bg-green-400' : 'bg-gray-400'}`} />
          <span className="text-sm">{state.status}</span>
        </div>
        {state.error && <p className="text-red-300 text-sm mt-2">{state.error}</p>}
      </div>

      {/* Controls */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="md:col-span-2 space-y-4">
          <CameraView ref={cameraRef} isProcessing={state.isProcessing} />

          <div className="flex items-center justify-center gap-3">
            <button
              onClick={toggleActive}
              className={`rounded-xl px-4 py-2 border text-sm ${
                state.isActive ? 'bg-green-500/20 border-green-400/40 text-green-100' : 'bg-white/5 border-white/10 text-blue-100'
              }`}
            >
              {state.isActive ? 'Deactivate (Clap or Space)' : 'Activate (Clap or Space)'}
            </button>
            <button
              onClick={runOcr}
              disabled={!state.isActive || state.isProcessing}
              className="rounded-xl px-4 py-2 border bg-blue-500/20 border-blue-300/40 text-blue-50 disabled:opacity-50"
            >
              <span className="inline-flex items-center gap-2">
                <Icon icon="mdi:scan-helper" />
                Scan Now (Enter)
              </span>
            </button>
            <button
              onClick={() => {
                if (state.recognizedText) speak(state.recognizedText, state.currentLanguage);
              }}
              disabled={!state.recognizedText}
              className="rounded-xl px-4 py-2 border bg-purple-500/20 border-purple-300/40 text-purple-50 disabled:opacity-50"
            >
              <span className="inline-flex items-center gap-2">
                <Icon icon="mdi:volume-high" />
                Speak Again
              </span>
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <LanguageSelector currentLanguage={state.currentLanguage} onLanguageChange={onLanguageChange} />
          <AudioDetector onClapDetected={toggleActive} isActive={state.isActive} />
        </div>
      </div>

      {/* Result */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <div className="flex items-center gap-2 text-blue-200 mb-2">
          <Icon icon="material-symbols:text-snippet" className="text-xl" />
          <span className="text-sm">Recognized text</span>
        </div>
        {state.recognizedText ? (
          <p className="whitespace-pre-wrap text-white/90">{state.recognizedText}</p>
        ) : (
          <p className="text-blue-300/80 text-sm">Nothing yet. Scan a frame to see text here.</p>
        )}
      </div>

      {/* Tips */}
      <div className="text-center text-blue-200 text-sm">
        <p className="flex items-center justify-center gap-2 mb-2">
          <Icon icon="mdi:information" className="text-base" />
          Clap once to activate, clap again to deactivate
        </p>
        <p>Grant camera and microphone permissions when prompted.</p>
      </div>
    </div>
  );
}
