
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
import { FilePenLine, Info, Search } from 'lucide-react';
import { useState, useMemo } from 'react';
import { EditPatientDialog } from './edit-patient-dialog';
import { usePatientData } from '@/hooks/use-patient-data';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

interface PatientDataProps {
  // patients prop can be removed if usePatientData is used directly
}

export function PatientDataTable({}: PatientDataProps) {
  const { patients, updatePatient, isLoading } = usePatientData();
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const handleEdit = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsEditDialogOpen(true);
  };

  const handleSavePatient = (updatedPatient: Patient) => {
    updatePatient(updatedPatient);
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

  if (isLoading) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Patient Records</CardTitle>
          <CardDescription>Loading patient data...</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-10 w-full mb-4" /> 
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
            A list of all submitted patient medical forms. Click 'Edit' to update information.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by patient name..."
                className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {patients.length === 0 ? (
             <div className="flex flex-col items-center justify-center py-12 text-center">
                <Info className="w-16 h-16 text-muted-foreground mb-4" />
                <p className="text-xl font-semibold text-muted-foreground">No Patient Data</p>
                <p className="text-muted-foreground">No patient forms have been submitted yet.</p>
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
                    <TableHead>Gender</TableHead>
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
                      <TableCell>{new Date(patient.dateOfBirth).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="capitalize">{patient.gender.replace('_', ' ')}</Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{patient.contactNumber}</TableCell>
                      <TableCell className="hidden lg:table-cell">{patient.email}</TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {new Date(patient.submissionDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(patient)}>
                          <FilePenLine className="mr-2 h-4 w-4" /> Edit
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
    </>
  );
}
