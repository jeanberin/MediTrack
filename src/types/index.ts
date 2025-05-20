
export interface Patient {
  id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  fullName: string; // Constructed from firstName, middleName, lastName
  dateOfBirth: string; 
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  contactNumber: string;
  email: string;
  address: string;
  medicalHistory: string;
  currentMedications: string;
  symptoms: string;
  hasHypertension?: boolean;
  hasDiabetes?: boolean;
  hasAsthma?: boolean;
  hasOtherConditions?: boolean;
  otherConditions?: string;
  insuranceProvider?: string;
  insurancePolicyNumber?: string;
  submissionDate: string;
}
