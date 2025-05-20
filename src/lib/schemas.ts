
import { z } from 'zod';

export const patientFormSchema = z.object({
  fullName: z.string().min(2, { message: "Full name must be at least 2 characters." }).max(100),
  dateOfBirth: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Please select a valid date of birth." }),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say'], { required_error: "Please select a gender." }),
  contactNumber: z.string().min(10, { message: "Contact number must be at least 10 digits." }).max(15),
  email: z.string().email({ message: "Invalid email address." }).max(100),
  address: z.string().min(5, { message: "Address must be at least 5 characters." }).max(200),
  medicalHistory: z.string().min(1, { message: "Medical history cannot be empty." }).max(1000),
  currentMedications: z.string().max(1000).optional(),
  symptoms: z.string().min(1, { message: "Symptoms cannot be empty." }).max(1000),
  insuranceProvider: z.string().max(100).optional(),
  insurancePolicyNumber: z.string().max(100).optional(),
});

export type PatientFormData = z.infer<typeof patientFormSchema>;

export const loginFormSchema = z.object({
  username: z.string().min(1, { message: "Username is required." }),
  password: z.string().min(1, { message: "Password is required." }),
});

export type LoginFormData = z.infer<typeof loginFormSchema>;
