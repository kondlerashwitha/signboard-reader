// Never use @iconify/react inside this file.
import { ImageResponse } from 'next/og';

export const size = { width: 64, height: 64 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
          borderRadius: 12,
          fontSize: 36,
          color: 'white',
          fontWeight: 700,
          letterSpacing: 0.5,
        }}
      >
        SB
      </div>
    ),
    { ...size }
  );
}
