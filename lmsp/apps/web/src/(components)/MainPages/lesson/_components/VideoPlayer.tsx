import { useEffect, useRef, useState } from 'react';
import { Play, SkipBack, SkipForward, Pause, Volume2, Maximize, Loader2 } from 'lucide-react';

// ─── YouTube URL Parsing ─────────────────────────────────────
function getYouTubeEmbedUrl(url: string): string | null {
  if (!url) return null;
  // youtube.com/watch?v=VIDEO_ID
  const matchStandard = url.match(/(?:youtube\.com\/watch\?v=|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  if (matchStandard) return `https://www.youtube.com/embed/${matchStandard[1]}?enablejsapi=1&autoplay=0&rel=0`;

  // youtu.be/VIDEO_ID
  const matchShort = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (matchShort) return `https://www.youtube.com/embed/${matchShort[1]}?enablejsapi=1&autoplay=0&rel=0`;

  return null;
}

function isYouTubeUrl(url: string): boolean {
  return /(?:youtube\.com|youtu\.be)/.test(url);
}

// ─── Duration formatting ─────────────────────────────────────
export function formatDuration(s: number) {
  const mins = Math.floor(s / 60);
  const secs = s % 60;
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

// ─── Progress Ring ────────────────────────────────────────────
export function ProgressRing({ progress, size = 40 }: { progress: number; size?: number }) {
  const sw = 3, r = (size - sw) / 2, c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} className="transform -rotate-90 flex-shrink-0">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e2e8f0" strokeWidth={sw} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={progress >= 80 ? '#10b981' : progress >= 40 ? '#f59e0b' : '#64748b'}
        strokeWidth={sw} strokeDasharray={c}
        strokeDashoffset={c - (progress / 100) * c}
        strokeLinecap="round" className="transition-all duration-700 ease-out"
      />
    </svg>
  );
}

interface VideoPlayerProps {
  videoUri?: string;
  title?: string;
  instructor?: string;
  duration?: number;
  isLoading?: boolean;
  onPrevious?: () => void;
  onNext?: () => void;
  onComplete?: () => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
}

export default function VideoPlayer({
  videoUri,
  title,
  instructor,
  duration,
  isLoading,
  onPrevious,
  onNext,
  onComplete,
  hasPrevious,
  hasNext,
}: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const embedUrl = videoUri ? getYouTubeEmbedUrl(videoUri) : null;
  const isYoutube = videoUri ? isYouTubeUrl(videoUri) : false;

  // Keep the latest onComplete without re-subscribing the message listener
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // Detect when a YouTube embed finishes (fires postMessage events with enablejsapi=1)
  useEffect(() => {
    if (!isYoutube || !embedUrl) return;

    let wasPlaying = false;
    const handleMessage = (e: MessageEvent) => {
      // Guard against opaque/empty origins before parsing
      if (!e.origin || !/(^|\.)youtube(-nocookie)?\.com$/.test(e.origin)) return;

      const data = e.data as any;
      if (!data || data.event !== 'infoDelivery' || !data.info) return;

      if (data.info.playerState === 1) {
        wasPlaying = true; // video started playing
      } else if (data.info.playerState === 0 && wasPlaying) {
        wasPlaying = false; // video ended after actually playing
        onCompleteRef.current?.();
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [isYoutube, embedUrl]);

  if (isLoading) {
    return (
      <div className="bg-[#111b29] rounded-xl overflow-hidden relative aspect-video flex items-center justify-center shadow-lg">
        <Loader2 size={32} className="animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="bg-[#111b29] rounded-xl overflow-hidden relative aspect-video flex flex-col justify-end shadow-lg">
      {videoUri ? (
        isYoutube && embedUrl ? (
          <iframe
            src={embedUrl}
            title={title || 'Lesson Video'}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <video
            src={videoUri}
            controls
            className="absolute inset-0 w-full h-full object-cover"
            onEnded={() => onCompleteRef.current?.()}
          />
        )
      ) : (
        <>
          {/* No video placeholder */}
          <div className="absolute inset-0 flex flex-col justify-center items-center">
            <div className="w-16 h-16 bg-[#1eff70] rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(30,255,112,0.4)] cursor-pointer hover:scale-105 transition">
              <Play size={30} fill="white" className="text-white ml-1" />
            </div>
            <div className="mt-4 text-white text-center">
              <h2 className="text-xl font-bold">{title || 'Lesson Title'}</h2>
              <p className="text-gray-400 text-sm">{instructor || 'Instructor'}</p>
            </div>
          </div>

          {/* Custom controls bar (only shown when no video URL) */}
          <div className="bg-gradient-to-t from-black/80 to-transparent p-4 relative z-10">
            <div className="w-full h-1 bg-gray-600 rounded-full mb-3">
              <div className="w-[0%] h-full bg-[#1eff70] rounded-full" />
            </div>
            <div className="flex items-center justify-between text-white text-xs">
              <div className="flex items-center gap-4">
                <SkipBack
                  fill="white"
                  size={18}
                  className={`cursor-pointer ${!hasPrevious ? 'opacity-30' : ''}`}
                  onClick={hasPrevious ? onPrevious : undefined}
                />
                <button onClick={() => setIsPlaying(!isPlaying)}>
                  {isPlaying ? (
                    <Pause fill="white" size={20} className="cursor-pointer" />
                  ) : (
                    <Play fill="white" size={20} className="cursor-pointer" />
                  )}
                </button>
                <SkipForward
                  fill="white"
                  size={18}
                  className={`cursor-pointer ${!hasNext ? 'opacity-30' : ''}`}
                  onClick={hasNext ? onNext : undefined}
                />
                <Volume2 size={16} />
                <span>0:00 / {formatDuration(duration || 0)}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="border border-white/20 px-2 py-0.5 rounded">1.25x</span>
                <Maximize size={16} className="cursor-pointer" />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
