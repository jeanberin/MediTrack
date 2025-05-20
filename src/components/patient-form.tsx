
"use client";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { patientFormSchema, type PatientFormData } from '@/lib/schemas';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { usePatientData } from '@/hooks/use-patient-data';
import { CalendarIcon, Save, CheckCircle, Edit3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useState } from 'react';

export function PatientForm() {
  const { toast } = useToast();
  const { addPatient } = usePatientData();
  const [isSubmittedSuccessfully, setIsSubmittedSuccessfully] = useState(false);

  const form = useForm<PatientFormData>({
    resolver: zodResolver(patientFormSchema),
    defaultValues: {
      firstName: "",
      middleName: "",
      lastName: "",
      dateOfBirth: "",
      gender: undefined,
      contactNumber: "",
      email: "",
      address: "",
      medicalHistory: "",
      currentMedications: "",
      symptoms: "",
      hasHypertension: false,
      hasDiabetes: false,
      hasAsthma: false,
      hasOtherConditions: false,
      otherConditions: "",
      insuranceProvider: "",
      insurancePolicyNumber: "",
    },
  });

  const watchHasOtherConditions = form.watch("hasOtherConditions");

  async function onSubmit(data: PatientFormData) {
    try {
      await addPatient(data); 
      toast({
        title: "Form Submitted",
        description: "Your medical information has been successfully submitted.",
      });
      form.reset();
      setIsSubmittedSuccessfully(true);
    } catch (error) {
      console.error("Submission error:", error);
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your form. Please try again.",
        variant: "destructive",
      });
      setIsSubmittedSuccessfully(false);
    }
  }

  const handleNewSubmission = () => {
    setIsSubmittedSuccessfully(false);
    form.reset(); // Ensure form is reset for new submission
  };

  const conditionOptions = [
    { id: "hasHypertension", label: "Hypertension" },
    { id: "hasDiabetes", label: "Diabetes" },
    { id: "hasAsthma", label: "Asthma" },
    { id: "hasOtherConditions", label: "Other" },
  ] as const;

  if (isSubmittedSuccessfully) {
    return (
      <Card className="w-full max-w-2xl mx-auto shadow-lg text-center">
        <CardHeader>
          <div className="flex flex-col items-center text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
            <CardTitle className="text-2xl">Submission Successful!</CardTitle>
            <CardDescription className="mt-2 text-lg">
              Your medical information has been recorded.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Button onClick={handleNewSubmission} className="w-full max-w-xs mx-auto">
            <Edit3 className="mr-2 h-4 w-4" /> Submit Another Response
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg">
      <CardHeader>
        <CardTitle>Patient Medical Information</CardTitle>
        <CardDescription>Please fill out the form with accurate details.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John" {...field} />
                      </FormControl>
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
                      <FormControl>
                        <Input placeholder="Doe" {...field} />
                      </FormControl>
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
                      <FormControl>
                        <Input placeholder="Michael" {...field} value={field.value || ""} />
                      </FormControl>
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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                    </FormControl>
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
                  <FormControl>
                    <Input type="tel" placeholder="e.g., (123) 456-7890" {...field} />
                  </FormControl>
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
                  <FormControl>
                    <Input type="email" placeholder="john.doe@example.com" {...field} />
                  </FormControl>
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
                  <FormControl>
                    <Textarea placeholder="123 Main St, Anytown, USA" {...field} />
                  </FormControl>
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
                    Please list any allergies, chronic conditions, past surgeries, etc. (excluding conditions selected below).
                  </FormDescription>
                  <FormControl>
                    <Textarea placeholder="e.g., Allergy to Penicillin" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <CardTitle className="text-lg pt-4 border-t">Pre-existing Conditions</CardTitle>
            <FormDescription>Please select any conditions that apply to you.</FormDescription>
            <div className="space-y-3">
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
                          id={option.id}
                        />
                      </FormControl>
                      <FormLabel htmlFor={option.id} className="font-normal cursor-pointer flex-grow">
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
                  <FormDescription>
                    Include dosage and frequency if known.
                  </FormDescription>
                  <FormControl>
                    <Textarea 
                      placeholder="e.g., Lisinopril 10mg daily" 
                      {...field} 
                      value={field.value || ""} 
                    />
                  </FormControl>
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
                  <FormDescription>
                    Describe your current health concerns or reasons for this submission.
                  </FormDescription>
                  <FormControl>
                    <Textarea placeholder="e.g., Persistent cough, headache for 3 days" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <CardTitle className="text-lg pt-4 border-t">Insurance Information (Optional)</CardTitle>
             <FormField
              control={form.control}
              name="insuranceProvider"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Insurance Provider</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., Blue Cross Blue Shield" 
                      {...field} 
                      value={field.value || ""} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="insurancePolicyNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Policy Number</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., XZY123456789" 
                      {...field} 
                      value={field.value || ""} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              <Save className="mr-2 h-4 w-4" />
              {form.formState.isSubmitting ? "Submitting..." : "Submit Information"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
