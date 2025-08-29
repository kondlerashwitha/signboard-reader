'use client';

import { useRef, useEffect, forwardRef, useImperativeHandle, useState } from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';

interface CameraViewProps {
  isProcessing: boolean;
}

export interface CameraViewRef {
  captureImage: () => Promise<string | null>;
}

const CameraView = forwardRef<CameraViewRef, CameraViewProps>(({ isProcessing }, ref) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasCamera, setHasCamera] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let stream: MediaStream;
    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setHasCamera(true);
        }
      } catch (e: any) {
        setError(e?.message ?? 'Unable to access camera');
      }
    })();
    return () => {
      if (stream) stream.getTracks().forEach(t => t.stop());
    };
  }, []);

  useImperativeHandle(ref, () => ({
    async captureImage() {
      const video = videoRef.current;
      if (!video) return null;
      const canvas = document.createElement('canvas');
      const w = video.videoWidth;
      const h = video.videoHeight;
      if (!w || !h) return null;
      // scale down a bit for faster OCR
      const scale = Math.min(1, 1280 / w);
      canvas.width = Math.floor(w * scale);
      canvas.height = Math.floor(h * scale);
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL('image/png');
    }
  }), []);

  return (
    <div className="w-full">
      <div className="relative rounded-xl overflow-hidden border border-white/10 bg-black/30">
        {!hasCamera && !error && (
          <div className="absolute inset-0 flex items-center justify-center text-blue-200">
            <span className="animate-pulse flex items-center gap-2">
              <Icon icon="mdi:camera" className="text-2xl" />
              Initializing camera…
            </span>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center text-red-300 p-4 text-center">
            <div>
              <Icon icon="mdi:alert" className="text-3xl mx-auto mb-2" />
              <p>{error}</p>
              <p className="text-xs opacity-80 mt-1">Grant camera permission and refresh.</p>
            </div>
          </div>
        )}
        <video ref={videoRef} className="w-full h-64 object-cover" playsInline muted />
        {isProcessing && (
          <div className="absolute bottom-2 right-2">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
              className="w-8 h-8 rounded-full border-2 border-white/30 border-b-white/80"
              aria-label="Processing"
              title="Processing"
            />
          </div>
        )}
      </div>
      <div className="mt-4 text-center">
        <p className="text-blue-200 text-sm font-light">
          Point your camera at text-containing signs or documents
        </p>
        <p className="text-blue-300/70 text-xs mt-1">
          Best results with good lighting and clear, unobstructed text
        </p>
      </div>
    </div>
  );
});

CameraView.displayName = 'CameraView';

export default CameraView;
