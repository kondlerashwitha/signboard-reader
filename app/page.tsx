'use client';

import { useState, useEffect } from 'react';
import SignboardReader from '@/app/components/SignboardReader';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-blue-100"
        >
          <div className="w-12 h-12 rounded-full border-2 border-white/30 border-b-white/80 mx-auto mb-4 animate-spin" />
          <p>Loading SignBoard Reader…</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950">
      <div className="max-w-5xl mx-auto px-4 py-10 space-y-10">
        <header className="text-center">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold text-white tracking-tight"
          >
            SignBoard Reader
          </motion.h1>
          <p className="text-blue-200 mt-2">
            Point, scan, and hear the text — English · हिन्दी · తెలుగు
          </p>
        </header>

        <SignboardReader />

        <section>
          <h2 className="text-white/90 font-semibold mb-3">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: 'mdi:hand-clap', title: 'Clap Activation', desc: 'Hands-free start/stop via sound detection' },
              { icon: 'mdi:camera', title: 'Live Camera', desc: 'Capture frames from your device camera' },
              { icon: 'mdi:volume-high', title: 'Text to Speech', desc: 'Natural voice output in selected language' },
            ].map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="text-center p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10"
              >
                <Icon icon={f.icon} className="text-3xl text-blue-300 mx-auto mb-3" />
                <h3 className="text-white font-medium mb-2">{f.title}</h3>
                <p className="text-blue-200 text-sm font-light">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
