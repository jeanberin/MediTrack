
import { z } from 'zod';

export const patientFormSchema = z.object({
  // Patient Information Record
  firstName: z.string().min(1, { message: "First name is required." }).max(50),
  middleName: z.string().max(50).optional().nullable(),
  lastName: z.string().min(1, { message: "Last name is required." }).max(50),
  dateOfBirth: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Please select a valid date of birth." }),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say'], { required_error: "Please select a gender." }),
  mobileNo: z.string().min(10, { message: "Mobile number must be at least 10 digits." }).max(15), // Renamed from contactNumber
  email: z.string().email({ message: "Invalid email address." }).max(100),
  address: z.string().min(5, { message: "Address must be at least 5 characters." }).max(200),
  
  religion: z.string().max(50).optional().nullable(),
  nationality: z.string().max(50).optional().nullable(),
  homeNo: z.string().max(20).optional().nullable(),
  occupation: z.string().max(100).optional().nullable(),
  officeNo: z.string().max(20).optional().nullable(),
  dentalInsurance: z.string().max(100).optional().nullable(),
  faxNo: z.string().max(20).optional().nullable(),
  effectiveDate: z.string().optional().nullable().refine(val => val === null || val === undefined || val === "" || !isNaN(Date.parse(val)), { message: "Invalid date format" }),
  referredBy: z.string().max(100).optional().nullable(),

  // For Minors
  guardianEmail: z.string().email({ message: "Invalid email address." }).max(100).optional().nullable(),
  parentOrGuardianName: z.string().max(100).optional().nullable(),
  parentOrGuardianOccupation: z.string().max(100).optional().nullable(),

  // Dental History
  previousDentist: z.string().max(100).optional().nullable(),
  lastDentalVisit: z.string().optional().nullable().refine(val => val === null || val === undefined || val === "" || !isNaN(Date.parse(val)), { message: "Invalid date format" }),

  // Medical History - Physician
  physicianName: z.string().max(100).optional().nullable(),
  physicianSpecialty: z.string().max(100).optional().nullable(),
  physicianOfficeAddress: z.string().max(200).optional().nullable(),
  physicianOfficeNumber: z.string().max(20).optional().nullable(),

  // Medical History - Yes/No Questions
  q_goodHealth: z.boolean().optional().default(false),
  q_medicalTreatmentNow: z.boolean().optional().default(false),
  q_medicalTreatmentCondition: z.string().max(500).optional().nullable(),
  q_seriousIllnessOperation: z.boolean().optional().default(false),
  q_seriousIllnessOperationDetails: z.string().max(500).optional().nullable(),
  q_hospitalized: z.boolean().optional().default(false),
  q_hospitalizedDetails: z.string().max(500).optional().nullable(),
  q_takingMedication: z.boolean().optional().default(false),
  q_medicationDetails: z.string().max(500).optional().nullable(), // Replaces currentMedications
  q_useTobacco: z.boolean().optional().default(false),
  q_useDrugs: z.boolean().optional().default(false),

  // Allergies
  allergy_localAnaesthetic: z.boolean().optional().default(false),
  allergy_penicillin: z.boolean().optional().default(false),
  allergy_aspirin: z.boolean().optional().default(false),
  allergy_latex: z.boolean().optional().default(false),
  allergy_other: z.boolean().optional().default(false),
  allergy_other_details: z.string().max(200).optional().nullable(),

  // Pregnancy/Misc
  bleedingTime: z.string().max(50).optional().nullable(),
  q_isPregnant: z.boolean().optional().default(false),
  q_isNursing: z.boolean().optional().default(false),
  q_onBirthControl: z.boolean().optional().default(false),
  
  // Vitals
  bloodType: z.string().max(10).optional().nullable(),
  bloodPressure: z.string().max(20).optional().nullable(),

  // Conditions Checklist (replaces hasHypertension, hasDiabetes, hasAsthma, hasOtherConditions, otherConditions)
  cond_highBloodPressure: z.boolean().optional().default(false),
  cond_heartDisease: z.boolean().optional().default(false),
  cond_cancerTumors: z.boolean().optional().default(false),
  cond_lowBloodPressure: z.boolean().optional().default(false),
  cond_heartMurmur: z.boolean().optional().default(false),
  cond_anemia: z.boolean().optional().default(false),
  cond_epilepsyConvulsions: z.boolean().optional().default(false),
  cond_hepatitisLiverDisease: z.boolean().optional().default(false),
  cond_angina: z.boolean().optional().default(false),
  cond_aidsHiv: z.boolean().optional().default(false),
  cond_rheumaticFever: z.boolean().optional().default(false),
  cond_asthma: z.boolean().optional().default(false),
  cond_std: z.boolean().optional().default(false),
  cond_hayFeverAllergies: z.boolean().optional().default(false),
  cond_emphysema: z.boolean().optional().default(false),
  cond_stomachTroublesUlcers: z.boolean().optional().default(false),
  cond_respiratoryProblems: z.boolean().optional().default(false),
  cond_bleedingProblems: z.boolean().optional().default(false),
  cond_faintingSeizure: z.boolean().optional().default(false),
  cond_hepatitisJaundice: z.boolean().optional().default(false),
  cond_bloodDisease: z.boolean().optional().default(false),
  cond_rapidWeightLoss: z.boolean().optional().default(false),
  cond_tuberculosis: z.boolean().optional().default(false),
  cond_heartInjuries: z.boolean().optional().default(false),
  cond_radiationTherapy: z.boolean().optional().default(false),
  cond_swollenAnkles: z.boolean().optional().default(false),
  cond_arthritisRheumatism: z.boolean().optional().default(false),
  cond_jointReplacementImplant: z.boolean().optional().default(false),
  cond_kidneyDisease: z.boolean().optional().default(false),
  cond_heartSurgery: z.boolean().optional().default(false),
  cond_heartAttack: z.boolean().optional().default(false),
  cond_thyroidProblem: z.boolean().optional().default(false),
  cond_diabetes: z.boolean().optional().default(false),
  cond_chestPain: z.boolean().optional().default(false),
  cond_stroke: z.boolean().optional().default(false),
  cond_others: z.boolean().optional().default(false),
  cond_others_details: z.string().max(500).optional().nullable(),
  
  reasonForVisit: z.string().min(1, { message: "Reason for visit cannot be empty." }).max(1000), // Renamed from symptoms
});

export type PatientFormData = z.infer<typeof patientFormSchema>;

export const loginFormSchema = z.object({
  username: z.string().min(1, { message: "Username is required." }),
  password: z.string().min(1, { message: "Password is required." }),
});

export type LoginFormData = z.infer<typeof loginFormSchema>;
