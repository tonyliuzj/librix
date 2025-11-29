import Link from 'next/link';
import { Search, Folder, Library, ArrowRight } from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-5xl">
      <div className="flex flex-col items-center text-center mb-16 space-y-4">
        <div className="p-4 bg-primary/10 rounded-full mb-4">
          <Library className="w-16 h-16 text-primary" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight lg:text-5xl">
          Welcome to File Library
        </h1>
        <p className="text-xl text-muted-foreground max-w-[600px]">
          Your personal library for organizing, browsing, and enjoying your media collection across all your devices.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <Link href="/files/search" className="block group">
          <Card className="flex flex-col h-full transition-all duration-300 hover:scale-105 hover:shadow-lg border-2 hover:border-primary/50 cursor-pointer">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
                <Search className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle className="group-hover:text-primary transition-colors">Search</CardTitle>
              <CardDescription>
                Find specific files instantly with powerful search capabilities.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <p className="text-sm text-muted-foreground">
                Search by filename, type, date, or content to locate exactly what you need in seconds.
              </p>
            </CardContent>
            <CardFooter>
              <div className="flex items-center text-sm font-medium text-primary">
                Go to Search <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </CardFooter>
          </Card>
        </Link>

        <Link href="/files/browse" className="block group">
          <Card className="flex flex-col h-full transition-all duration-300 hover:scale-105 hover:shadow-lg border-2 hover:border-primary/50 cursor-pointer">
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-200 dark:group-hover:bg-green-900/50 transition-colors">
                <Folder className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="group-hover:text-primary transition-colors">Browse</CardTitle>
              <CardDescription>
                Explore your collection through a familiar folder structure.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <p className="text-sm text-muted-foreground">
                Navigate through directories and view your files organized exactly how you stored them.
              </p>
            </CardContent>
            <CardFooter>
              <div className="flex items-center text-sm font-medium text-primary">
                Start Browsing <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </CardFooter>
          </Card>
        </Link>
      </div>

      <div className="mt-24 text-center text-sm text-muted-foreground space-y-2">
        <p>
          Project GitHub:{' '}
          <a
            href="https://github.com/tonyliuzj/librix"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors underline underline-offset-4"
          >
            tonyliuzj/librix
          </a>
        </p>
        <p>
          Developed by{' '}
          <a
            href="https://tony-liu.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors underline underline-offset-4"
          >
            tony-liu.com
          </a>
        </p>
      </div>
    </div>
  );
}
