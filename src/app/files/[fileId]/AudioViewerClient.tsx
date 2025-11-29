'use client';

import { useState, useRef } from 'react';
import { Play, Pause, Music, Download, SkipBack, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface AudioViewerProps {
  fileUrl: string;
  fileName: string;
}

export default function AudioViewerClient({ fileUrl, fileName }: AudioViewerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(err => {
          setError('Failed to play audio: ' + err.message);
        });
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current && duration > 0) {
      setProgress((audioRef.current.currentTime / duration) * 100);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      const seekTime = (value[0] / 100) * duration;
      audioRef.current.currentTime = seekTime;
      setProgress(value[0]);
    }
  };

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="flex flex-col h-full items-center justify-center bg-muted/40 p-8">
      {error && (
        <div className="mb-8 p-3 bg-destructive/10 text-destructive rounded-lg shadow-sm">
          {error}
        </div>
      )}
      
      <Card className="w-full max-w-md shadow-xl border-none">
        <CardContent className="p-8 flex flex-col items-center">
            {/* Disc/Album Art Placeholder */}
            <div className="flex justify-center mb-8">
                <div className={cn(
                    "w-40 h-40 rounded-full bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center shadow-lg transition-all duration-700",
                    isPlaying ? 'animate-[spin_4s_linear_infinite]' : ''
                )}>
                    <Music className="w-20 h-20 text-primary-foreground" />
                </div>
            </div>

            <h2 className="text-xl font-bold text-center mb-2 truncate w-full" title={fileName}>
                {fileName}
            </h2>
            <p className="text-center text-muted-foreground text-sm mb-8">Audio File</p>

            <audio
            ref={audioRef}
            src={fileUrl}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={() => setIsPlaying(false)}
            onError={() => setError('Failed to load audio file')}
            />
            
            {/* Progress Bar */}
            <div className="w-full mb-6 space-y-2">
                <Slider
                    value={[progress]}
                    max={100}
                    step={0.1}
                    onValueChange={handleSeek}
                    className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground font-mono">
                    <span>{formatTime((progress / 100) * duration)}</span>
                    <span>{formatTime(duration)}</span>
                </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-6">
                <Button variant="ghost" size="icon" className="h-12 w-12 text-muted-foreground">
                    <SkipBack className="h-6 w-6" />
                </Button>
                <Button
                    onClick={togglePlay}
                    size="icon"
                    className="h-16 w-16 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                >
                    {isPlaying ? (
                        <Pause className="h-8 w-8 fill-current" />
                    ) : (
                        <Play className="h-8 w-8 fill-current ml-1" />
                    )}
                </Button>
                <Button variant="ghost" size="icon" className="h-12 w-12 text-muted-foreground">
                    <SkipForward className="h-6 w-6" />
                </Button>
            </div>
            
            <div className="mt-8 flex justify-center">
                <Button variant="link" asChild size="sm">
                    <a href={fileUrl} download={fileName}>
                        <Download className="mr-2 h-4 w-4" />
                        Download File
                    </a>
                </Button>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
