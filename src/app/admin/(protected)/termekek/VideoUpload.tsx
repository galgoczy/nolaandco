'use client';

import { useRef, useState } from 'react';
import { upload } from '@vercel/blob/client';

type Props = {
  /** A kész (videóURL, borítóképURL) párral hívjuk vissza. */
  onUploaded: (videoUrl: string, posterUrl: string) => void;
  label?: string;
};

const MAX_VIDEO_SIZE = 64 * 1024 * 1024; // szinkronban a szerveroldali limittel

/**
 * MP4 videó feltöltése a termékgalériába. A videó közvetlenül a Blob tárolóba
 * megy (kliens-oldali feltöltéssel), a borítóképet pedig az első képkockából
 * készítjük el itt a böngészőben, és a meglévő képfeltöltőn küldjük fel.
 */
export default function VideoUpload({ onUploaded, label = 'Videó feltöltése' }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  async function capturePoster(file: File): Promise<Blob | null> {
    return new Promise((resolve) => {
      const url = URL.createObjectURL(file);
      const video = document.createElement('video');
      const done = (result: Blob | null) => {
        URL.revokeObjectURL(url);
        resolve(result);
      };
      video.preload = 'metadata';
      video.muted = true;
      video.playsInline = true;
      video.onloadeddata = () => {
        // Az első pillanat utáni képkocka általában már nem fekete.
        try {
          video.currentTime = Math.min(0.1, video.duration || 0.1);
        } catch {
          done(null);
        }
      };
      video.onseeked = () => {
        const canvas = document.createElement('canvas');
        const scale = Math.min(1, 1080 / Math.max(video.videoWidth, video.videoHeight, 1));
        canvas.width = Math.max(1, Math.round(video.videoWidth * scale));
        canvas.height = Math.max(1, Math.round(video.videoHeight * scale));
        const ctx = canvas.getContext('2d');
        if (!ctx) return done(null);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => done(blob), 'image/jpeg', 0.82);
      };
      video.onerror = () => done(null);
      video.src = url;
    });
  }

  async function handleFile(file: File) {
    if (file.size > MAX_VIDEO_SIZE) {
      setError(`A videó túl nagy (max ${Math.round(MAX_VIDEO_SIZE / 1024 / 1024)} MB). Rövid, tömörített MP4-et tölts fel.`);
      return;
    }
    setUploading(true);
    setError('');
    try {
      // 1) Borítókép az első képkockából (ha nem sikerül, üresen marad,
      //    a galéria semleges felülettel jelzi a videót).
      let posterUrl = '';
      const poster = await capturePoster(file);
      if (poster) {
        const form = new FormData();
        form.append('file', new File([poster], 'video-poster.jpg', { type: 'image/jpeg' }));
        const res = await fetch('/api/admin/upload', { method: 'POST', body: form });
        const data = await res.json().catch(() => ({}));
        if (res.ok && typeof data.url === 'string') posterUrl = data.url;
      }

      // 2) A videó közvetlenül a Blob tárolóba.
      const blob = await upload(`products/videos/${file.name}`, file, {
        access: 'public',
        handleUploadUrl: '/api/admin/upload/video',
      });

      onUploaded(blob.url, posterUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Feltöltés sikertelen');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="video/mp4,video/quicktime,video/webm"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
        }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="px-4 py-2 rounded-lg text-sm font-medium bg-surface-container hover:bg-surface-container-high disabled:opacity-50 flex items-center gap-2"
      >
        {uploading ? (
          <>
            <span className="inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
            Videó feltöltése...
          </>
        ) : (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 10l4.553-2.276A1 1 0 0 1 21 8.618v6.764a1 1 0 0 1-1.447.894L15 14M5 18h8a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2z"
              />
            </svg>
            {label}
          </>
        )}
      </button>
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}
