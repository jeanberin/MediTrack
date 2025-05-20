
export interface Patient {
  id: string;
  fullName: string;
  dateOfBirth: string; 
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  contactNumber: string;
  email: string;
  address: string;
  medicalHistory: string;
  currentMedications: string;
  symptoms: string;
  insuranceProvider?: string;
  insurancePolicyNumber?: string;
  submissionDate: string;
}
