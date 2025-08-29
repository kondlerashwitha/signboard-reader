'use client';

import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';

interface LanguageSelectorProps {
  currentLanguage: 'eng' | 'hin' | 'tel';
  onLanguageChange: (language: 'eng' | 'hin' | 'tel') => void;
}

const languages = [
  { code: 'eng' as const, name: 'English', nativeName: 'English', flag: '🇺🇸', voiceHint: 'en-US' },
  { code: 'hin' as const, name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳', voiceHint: 'hi-IN' },
  { code: 'tel' as const, name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳', voiceHint: 'te-IN' },
];

export default function LanguageSelector({ currentLanguage, onLanguageChange }: LanguageSelectorProps) {
  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-2 text-blue-200">
        <Icon icon="mdi:translate" className="text-xl" />
        <span className="text-sm">Language</span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {languages.map(lang => (
          <motion.button
            key={lang.code}
            onClick={() => onLanguageChange(lang.code)}
            className={`rounded-xl border px-3 py-2 text-center transition ${
              currentLanguage === lang.code
                ? 'bg-white/10 border-white/20 text-white'
                : 'bg-white/5 border-white/10 text-blue-100 hover:bg-white/10'
            }`}
            whileTap={{ scale: 0.97 }}
          >
            <div className="text-2xl leading-none mb-1">{lang.flag}</div>
            <div className="text-xs font-medium">{lang.name}</div>
            <div className="text-[10px] opacity-70">{lang.nativeName}</div>
          </motion.button>
        ))}
      </div>
      <p className="text-blue-300/80 text-xs mt-2 flex items-start gap-2">
        <Icon icon="material-symbols:info" className="text-sm mt-0.5 flex-shrink-0" />
        The selected language is used for OCR and voice. Pick the one that matches your signboard.
      </p>
    </div>
  );
}
