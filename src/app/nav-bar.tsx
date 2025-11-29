'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { Menu, Moon, Sun, ArrowLeft, Search, Folder, Settings, MonitorPlay } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export default function NavBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isViewer = pathname.match(/^\/files\/[^/]+$/) && !pathname.includes('/search') && !pathname.includes('/browse');
  const fileName = isViewer
    ? searchParams.get('path')?.split('/').pop()
    : null;

  const { setTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const isActive = (path: string) => pathname.startsWith(path);

  return (
    <div className="fixed top-0 left-0 w-full z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-4 max-w-7xl mx-auto">
        
        {/* Left Side: Logo or Back Button */}
        <div className="flex items-center flex-1 gap-4">
          {isViewer ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left">
                  <SheetHeader>
                    <SheetTitle>Media Explorer</SheetTitle>
                  </SheetHeader>
                  <div className="flex flex-col gap-4 py-4">
                    <Link
                      href="/files/search"
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary",
                        isActive('/files/search') ? "text-primary" : "text-muted-foreground"
                      )}
                    >
                      <Search className="h-4 w-4" />
                      Search
                    </Link>
                    <Link
                      href="/files/browse"
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary",
                        isActive('/files/browse') ? "text-primary" : "text-muted-foreground"
                      )}
                    >
                      <Folder className="h-4 w-4" />
                      Browse
                    </Link>
                    <Link
                      href="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary",
                        isActive('/admin') ? "text-primary" : "text-muted-foreground"
                      )}
                    >
                      <Settings className="h-4 w-4" />
                      Admin
                    </Link>
                  </div>
                </SheetContent>
              </Sheet>
              
              <Link href="/" className="flex items-center gap-2 font-bold text-xl mr-6">
                <MonitorPlay className="h-6 w-6 text-primary" />
                <span className="hidden sm:inline-block">Media Explorer</span>
              </Link>
            </div>
          )}

          {/* Viewer Title */}
          {isViewer && fileName && (
            <h1 className="text-sm md:text-base font-medium truncate max-w-[200px] md:max-w-md" title={decodeURIComponent(fileName)}>
              {decodeURIComponent(fileName)}
            </h1>
          )}
        </div>

        {/* Desktop Navigation */}
        {!isViewer && (
          <NavigationMenu className="hidden md:flex mx-6">
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuLink asChild className={cn(navigationMenuTriggerStyle(), isActive('/files/search') && "bg-accent text-accent-foreground")}>
                  <Link href="/files/search">
                    Search
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild className={cn(navigationMenuTriggerStyle(), isActive('/files/browse') && "bg-accent text-accent-foreground")}>
                  <Link href="/files/browse">
                    Browse
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild className={cn(navigationMenuTriggerStyle(), isActive('/admin') && "bg-accent text-accent-foreground")}>
                  <Link href="/admin">
                    Admin
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        )}

        {/* Right Side: Theme Toggle */}
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme("light")}>
                Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>
                System
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
