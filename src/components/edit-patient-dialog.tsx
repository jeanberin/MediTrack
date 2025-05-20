
"use client";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { patientFormSchema, type PatientFormData } from '@/lib/schemas';
import type { Patient } from '@/types';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { CalendarIcon, Save, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useEffect } from 'react';

interface EditPatientDialogProps {
  patient: Patient | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updatedPatient: Patient) => void; // Expects the full Patient object
}

export function EditPatientDialog({ patient, isOpen, onOpenChange, onSave }: EditPatientDialogProps) {
  const { toast } = useToast();

  // Form uses PatientFormData for its structure, matching the schema
  const form = useForm<PatientFormData>({
    resolver: zodResolver(patientFormSchema),
  });

  const watchHasOtherConditions = form.watch("hasOtherConditions");

  useEffect(() => {
    if (patient && isOpen) {
      form.reset({
        firstName: patient.firstName,
        middleName: patient.middleName || "",
        lastName: patient.lastName,
        dateOfBirth: patient.dateOfBirth,
        gender: patient.gender,
        contactNumber: patient.contactNumber,
        email: patient.email,
        address: patient.address,
        medicalHistory: patient.medicalHistory,
        currentMedications: patient.currentMedications || "",
        symptoms: patient.symptoms,
        hasHypertension: patient.hasHypertension || false,
        hasDiabetes: patient.hasDiabetes || false,
        hasAsthma: patient.hasAsthma || false,
        hasOtherConditions: patient.hasOtherConditions || false,
        otherConditions: patient.otherConditions || "",
        insuranceProvider: patient.insuranceProvider || "",
        insurancePolicyNumber: patient.insurancePolicyNumber || "",
      });
    }
  }, [patient, form, isOpen]);

  if (!patient) return null;

  // data is PatientFormData
  function onSubmit(data: PatientFormData) {
    try {
      // Construct the full Patient object to send to onSave
      const constructedFullName = `${data.firstName} ${data.middleName ? data.middleName + ' ' : ''}${data.lastName}`.trim();
      const patientToSave: Patient = {
        ...patient, // Includes id, submissionDate, etc.
        ...data,    // Includes form fields like firstName, lastName, medicalHistory etc.
        fullName: constructedFullName, // Set the newly constructed fullName
      };
      
      onSave(patientToSave);
      toast({
        title: "Patient Data Updated",
        description: `${patientToSave.fullName}'s information has been successfully updated.`,
      });
      onOpenChange(false); 
    } catch (error) {
      console.error("Update error:", error);
      toast({
        title: "Update Failed",
        description: "There was an error updating patient data. Please try again.",
        variant: "destructive",
      });
    }
  }
  
  const conditionOptions = [
    { id: "hasHypertension", label: "Hypertension" },
    { id: "hasDiabetes", label: "Diabetes" },
    { id: "hasAsthma", label: "Asthma" },
    { id: "hasOtherConditions", label: "Other" },
  ] as const;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Patient: {patient.fullName}</DialogTitle>
          <DialogDescription>Modify the patient's medical information below.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 px-1 py-2">
            <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="sm:col-span-3">
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="sm:col-span-full">
                <FormField
                  control={form.control}
                  name="middleName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Middle Name (Optional)</FormLabel>
                      <FormControl><Input {...field} value={field.value || ""} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

             <FormField
              control={form.control}
              name="dateOfBirth"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date of Birth</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(new Date(field.value), "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value ? new Date(field.value) : undefined}
                        onSelect={(date) => field.onChange(date ? date.toISOString().split('T')[0] : '')}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                      <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="contactNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Number</FormLabel>
                  <FormControl><Input type="tel" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl><Input type="email" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl><Textarea {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="medicalHistory"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Medical History</FormLabel>
                   <FormDescription>
                    Allergies, chronic conditions, past surgeries, etc. (excluding conditions selected below).
                  </FormDescription>
                  <FormControl><Textarea {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogTitle className="text-lg pt-3 border-t">Pre-existing Conditions</DialogTitle>
             <FormDescription>Please select any conditions that apply.</FormDescription>
            <div className="space-y-2">
              {conditionOptions.map((option) => (
                <FormField
                  key={option.id}
                  control={form.control}
                  name={option.id}
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0 p-3 border rounded-md shadow-sm hover:bg-accent hover:text-accent-foreground transition-colors">
                       <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          id={`edit-${option.id}`}
                        />
                      </FormControl>
                      <FormLabel htmlFor={`edit-${option.id}`} className="font-normal cursor-pointer flex-grow">
                        {option.label}
                      </FormLabel>
                    </FormItem>
                  )}
                />
              ))}
            </div>

            {watchHasOtherConditions && (
              <FormField
                control={form.control}
                name="otherConditions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Please specify other conditions</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="List other conditions here" 
                        {...field} 
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="currentMedications"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Medications (Optional)</FormLabel>
                  <FormControl><Textarea {...field} value={field.value || ""} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="symptoms"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Symptoms</FormLabel>
                  <FormControl><Textarea {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogTitle className="text-lg pt-3 border-t">Insurance Information (Optional)</DialogTitle>
            <FormField
              control={form.control}
              name="insuranceProvider"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Insurance Provider (Optional)</FormLabel>
                  <FormControl><Input {...field} value={field.value || ""} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="insurancePolicyNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Policy Number (Optional)</FormLabel>
                  <FormControl><Input {...field} value={field.value || ""} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  <X className="mr-2 h-4 w-4" /> Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                <Save className="mr-2 h-4 w-4" />
                {form.formState.isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
