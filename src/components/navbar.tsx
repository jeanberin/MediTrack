
"use client";
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Stethoscope, LogOut, LogIn, Users, LayoutDashboard } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export function Navbar() {
  const { isAuthenticated, logout, isLoading } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold text-primary">
          <Stethoscope className="h-7 w-7" />
          <span>MediTrack</span>
        </Link>
        <nav className="flex items-center gap-2 sm:gap-4">
          <Button variant="ghost" asChild className="text-sm sm:text-base">
            <Link href="/">
              <Users className="mr-0 h-4 w-4 sm:mr-2" /> 
              <span className="hidden sm:inline">Patient Form</span>
            </Link>
          </Button>
          {isLoading ? (
            <Skeleton className="h-10 w-24" />
          ) : isAuthenticated ? (
            <>
              <Button variant="ghost" asChild className="text-sm sm:text-base">
                <Link href="/dashboard">
                  <LayoutDashboard className="mr-0 h-4 w-4 sm:mr-2" />
                   <span className="hidden sm:inline">Dashboard</span>
                </Link>
              </Button>
              <Button onClick={logout} variant="outline" size="sm" className="text-sm sm:text-base">
                <LogOut className="mr-2 h-4 w-4" /> Logout
              </Button>
            </>
          ) : (
            <Button asChild size="sm" className="text-sm sm:text-base">
              <Link href="/login">
                <LogIn className="mr-2 h-4 w-4" /> Doctor Login
              </Link>
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
