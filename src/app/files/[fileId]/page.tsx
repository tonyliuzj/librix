'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Loader2, FileQuestion } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PdfViewerClient from './PdfViewerClient';
import TextViewerClient from './TextViewerClient';
import AudioViewerClient from './AudioViewerClient';
import MarkdownViewerClient from './MarkdownViewerClient';
import VideoViewerClient from './VideoViewerClient';

function ViewerContent() {
  const searchParams = useSearchParams();
  
  const backendId = searchParams.get('backendId') || '';
  const path = searchParams.get('path') || '';
  
  const src = `/api/files/view?backendId=${encodeURIComponent(backendId)}&path=${encodeURIComponent(path)}`;
  const ext = path.split('.').pop()?.toLowerCase();

  let viewerElement: React.ReactNode;
  const fileName = path.split('/').pop() || '';
  
  if (ext === 'pdf') {
    viewerElement = <PdfViewerClient fileUrl={src} />;
  } else if (ext && ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext)) {
    viewerElement = (
      <div className="flex items-center justify-center h-full bg-gray-100 dark:bg-gray-900">
        <Image
          src={src}
          alt={fileName}
          width={1200}
          height={800}
          className="w-full h-full object-contain"
          unoptimized
        />
      </div>
    );
  } else if (ext && ['mp4', 'webm', 'ogg'].includes(ext)) {
    viewerElement = <VideoViewerClient fileUrl={src} fileName={fileName} />;
  } else if (ext && ['txt', 'js', 'ts', 'html', 'css', 'json', 'xml', 'yaml', 'csv'].includes(ext)) {
    viewerElement = <TextViewerClient fileUrl={src} fileName={fileName} />;
  } else if (ext && ['mp3', 'wav'].includes(ext)) {
    viewerElement = <AudioViewerClient fileUrl={src} fileName={fileName} />;
  } else if (ext && ['md', 'markdown'].includes(ext)) {
    viewerElement = <MarkdownViewerClient fileUrl={src} fileName={fileName} />;
  } else {
    viewerElement = (
      <div className="flex flex-col items-center justify-center h-full bg-muted/40 p-4 text-center">
        <div className="mb-6 p-8 bg-card rounded-xl shadow-sm border">
          <FileQuestion className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-50" />
          <p className="text-lg text-card-foreground mb-2 font-medium">Preview not available</p>
          <p className="text-sm text-muted-foreground mb-6">This file type cannot be previewed in the browser.</p>
          <Button asChild>
            <a href={src} download={fileName}>
                Download {fileName}
            </a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 relative overflow-hidden bg-background h-full">
      {viewerElement}
    </div>
  );
}

export default function ViewerPage() {
  return (
    <div className="pt-16 flex flex-col h-screen">
      <Suspense fallback={
        <div className="flex items-center justify-center h-full bg-background">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      }>
        <ViewerContent />
      </Suspense>
    </div>
  );
}
