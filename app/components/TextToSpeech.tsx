'use client';

import { useEffect, useState } from 'react';

interface Props {
  text: string;
  language: 'eng' | 'hin' | 'tel';
  autoSpeak?: boolean;
  onSpeakingChange?: (speaking: boolean) => void;
}

export default function TextToSpeech({ text, language, autoSpeak = false, onSpeakingChange }: Props) {
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    setSupported(typeof window !== 'undefined' && 'speechSynthesis' in window);
  }, []);

  useEffect(() => {
    if (!supported || !autoSpeak || !text) return;
    const utter = new SpeechSynthesisUtterance(text);
    const hint = language === 'eng' ? 'en-' : language === 'hin' ? 'hi-' : 'te-';
    const vs = window.speechSynthesis.getVoices();
    const v = vs.find(v => v.lang.startsWith(hint));
    if (v) utter.voice = v;
    utter.lang = v?.lang || (language === 'eng' ? 'en-US' : language === 'hin' ? 'hi-IN' : 'te-IN');
    utter.onstart = () => onSpeakingChange?.(true);
    utter.onend = () => onSpeakingChange?.(false);
    window.speechSynthesis.speak(utter);
    return () => window.speechSynthesis.cancel();
  }, [supported, autoSpeak, text, language, onSpeakingChange]);

  if (!supported) return null;
  return null;
}
