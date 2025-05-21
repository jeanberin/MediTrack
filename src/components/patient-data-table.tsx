
"use client";
import type { Patient } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FilePenLine, Info, Search, Trash2, RefreshCw } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { EditPatientDialog } from './edit-patient-dialog';
import { usePatientData } from '@/hooks/use-patient-data';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { format as formatDateFns, isValid as isValidDateFns, parseISO } from 'date-fns';


interface PatientDataProps {
  // patients prop can be removed if usePatientData is used directly
}

export function PatientDataTable({}: PatientDataProps) {
  const { patients, updatePatient, deletePatient, isLoading, refetchPatients } = usePatientData();
  const { toast } = useToast();
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isRefetching, setIsRefetching] = useState(false);

  const handleRefresh = async () => {
    setIsRefetching(true);
    await refetchPatients();
    setIsRefetching(false);
    toast({
      title: "Data Refreshed",
      description: "Patient list has been updated.",
    });
  };

  const handleEdit = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsEditDialogOpen(true);
  };

  const handleOpenDeleteDialog = (patient: Patient) => {
    setPatientToDelete(patient);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (patientToDelete) {
      await deletePatient(patientToDelete.id);
      toast({
        title: "Patient Record Deleted",
        description: `${patientToDelete.fullName}'s record has been successfully deleted.`,
      });
      setIsDeleteDialogOpen(false);
      setPatientToDelete(null);
    }
  };

  const handleSavePatient = async (updatedPatient: Patient) => {
    await updatePatient(updatedPatient);
    setIsEditDialogOpen(false);
    setSelectedPatient(null);
  };

  const filteredPatients = useMemo(() => {
    if (!searchTerm) {
      return patients;
    }
    return patients.filter(patient =>
      patient.fullName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [patients, searchTerm]);

  if (isLoading && patients.length === 0 && !isRefetching) { 
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Patient Records</CardTitle>
          <CardDescription>Loading patient data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <Skeleton className="h-10 w-[200px] md:w-[320px]" />
            <Skeleton className="h-10 w-28" />
          </div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Patient Records</CardTitle>
          <CardDescription>
            A list of all submitted patient medical forms. Click 'Edit' to update information or 'Delete' to remove a record.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by patient name..."
                className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button onClick={handleRefresh} disabled={isRefetching || isLoading} variant="outline" size="sm">
              <RefreshCw className={`mr-2 h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`} />
              {isRefetching ? 'Refreshing...' : 'Refresh Data'}
            </Button>
          </div>

          {(isLoading && patients.length === 0 && !isRefetching) ? (
             <div className="flex flex-col items-center justify-center py-12 text-center">
                <Info className="w-16 h-16 text-muted-foreground mb-4" />
                <p className="text-xl font-semibold text-muted-foreground">Loading data...</p>
              </div>
          ) : !isLoading && patients.length === 0 ? (
             <div className="flex flex-col items-center justify-center py-12 text-center">
                <Info className="w-16 h-16 text-muted-foreground mb-4" />
                <p className="text-xl font-semibold text-muted-foreground">No Patient Data</p>
                <p className="text-muted-foreground">No patient forms have been submitted yet, or none were found in the database.</p>
              </div>
          ) : filteredPatients.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Info className="w-16 h-16 text-muted-foreground mb-4" />
              <p className="text-xl font-semibold text-muted-foreground">No Patients Found</p>
              <p className="text-muted-foreground">No patient records match your search criteria.</p>
            </div>
          ) : (
            <ScrollArea className="max-h-[600px] w-full">
              <Table>
                <TableHeader className="sticky top-0 bg-background z-10">
                  <TableRow>
                    <TableHead className="w-[200px]">Full Name</TableHead>
                    <TableHead>Date of Birth</TableHead>
                    <TableHead>Sex</TableHead>
                    <TableHead className="hidden md:table-cell">Contact Number</TableHead>
                    <TableHead className="hidden lg:table-cell">Email</TableHead>
                    <TableHead className="hidden sm:table-cell">Submission Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPatients.map((patient) => (
                    <TableRow key={patient.id}>
                      <TableCell className="font-medium">{patient.fullName}</TableCell>
                      <TableCell>
                        {patient.dateOfBirth && isValidDateFns(parseDateFns(patient.dateOfBirth, 'yyyy-MM-dd', new Date())) 
                          ? formatDateFns(parseDateFns(patient.dateOfBirth, 'yyyy-MM-dd', new Date()), "PPP") 
                          : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="capitalize">{patient.sex}</Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{patient.mobileNo}</TableCell>
                      <TableCell className="hidden lg:table-cell">{patient.email}</TableCell>
                      <TableCell className="hidden sm:table-cell">
                         {patient.submissionDate && isValidDateFns(parseISO(patient.submissionDate))
                           ? formatDateFns(parseISO(patient.submissionDate), "PPpp")
                           : 'N/A'}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(patient)}>
                          <FilePenLine className="mr-2 h-4 w-4" /> Edit
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleOpenDeleteDialog(patient)}>
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
      <EditPatientDialog
        patient={selectedPatient}
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSave={handleSavePatient}
      />
      {patientToDelete && (
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the patient record for <strong>{patientToDelete.fullName}</strong>.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setPatientToDelete(null)}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}

    