
"use client";
import { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { PatientDataTable } from '@/components/patient-data-table';
import { PageHeader } from '@/components/page-header';
import { LayoutDashboard, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  if (authLoading || !isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Loading Dashboard...</p>
        <Skeleton className="h-8 w-48 mt-2" />
        <Skeleton className="h-4 w-64 mt-2" />
        <Skeleton className="h-64 w-full max-w-4xl mt-8" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader 
        title="Doctor Dashboard"
        description="View and manage patient submissions."
        icon={LayoutDashboard}
      />
      <PatientDataTable />
    </div>
  );
}
