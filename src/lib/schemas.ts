
import { z } from 'zod';
import { parse as parseDateFns, isValid as isValidDateFns, format as formatDateFns } from 'date-fns';

// Helper for date validation (expects YYYY-MM-DD from calendar)
const dateSchema = (fieldName: string, isRequired: boolean = true) => {
  let schema = z.string();

  if (isRequired) {
    schema = schema.min(1, { message: `${fieldName} is required.` });
  }

  // Apply refine before optional/nullable/transform
  schema = schema.refine(val => {
    if (!val && !isRequired) return true; // Allow empty for optional fields before further checks
    if (!val && isRequired) return false; // Fail if required and empty
    return /^\d{4}-\d{2}-\d{2}$/.test(val!) && isValidDateFns(parseDateFns(val!, 'yyyy-MM-dd', new Date()));
  }, { message: `Invalid ${fieldName.toLowerCase()} format. Expected YYYY-MM-DD.` });
  
  if (!isRequired) {
    schema = schema.optional().nullable().transform(val => (val === "" || val === undefined || val === null) ? null : val) as any; // Cast needed due to Zod transform complexity with optional/nullable
  } else {
     schema = schema.transform(val => (val === "" || val === undefined) ? null : val).nullable() as any; // Ensure required fields can still become null if transformed to empty
  }
  return schema;
};


export const patientFormSchema = z.object({
  // Patient Information Record
  firstName: z.string().min(1, { message: "First name is required." }).max(50),
  middleName: z.string().max(50).optional().nullable(),
  lastName: z.string().min(1, { message: "Last name is required." }).max(50),

  dateOfBirth: z.string()
    .min(1, { message: "Date of Birth is required." }) // Initial non-empty check
    .refine(val => /^\d{4}-\d{2}-\d{2}$/.test(val), {
      message: "Invalid Date of Birth format. Expected YYYY-MM-DD.",
    })
    .refine(val => isValidDateFns(parseDateFns(val, 'yyyy-MM-dd', new Date())), {
        message: "Invalid Date of Birth.",
    })
    .refine(val => {
        const date = parseDateFns(val, 'yyyy-MM-dd', new Date());
        return date <= new Date();
      }, "Date of birth cannot be in the future.")
    .refine(val => {
        const date = parseDateFns(val, 'yyyy-MM-dd', new Date());
        return date >= new Date("1900-01-01");
      }, "Date of birth must be after Jan 1, 1900.")
    .transform(val => (val === "" || val === undefined) ? null : val) // Keep this for consistency if needed, but .min(1) handles empty for required
    .nullable(), // Explicitly allow null if that's a possible state post-transform or initial

  sex: z.enum(['male', 'female'], { required_error: "Please select a sex." }),
  mobileNo: z.string().min(10, { message: "Mobile number must be at least 10 digits." }).max(15),
  email: z.string().email({ message: "Invalid email address." }).max(100),
  address: z.string().min(5, { message: "Address must be at least 5 characters." }).max(200),

  religion: z.string().max(100).optional().nullable(),
  nationality: z.string().max(100).optional().nullable(),
  homeNo: z.string().max(20).optional().nullable(),
  occupation: z.string().max(100).optional().nullable(),
  officeNo: z.string().max(20).optional().nullable(),
  dentalInsurance: z.string().max(100).optional().nullable(),
  faxNo: z.string().max(20).optional().nullable(),

  effectiveDate: dateSchema("Effective Date", false),
  referredBy: z.string().max(100).optional().nullable(),

  // For Minors
  guardianEmail: z.string().email({ message: "Invalid email address." }).max(100).optional().nullable(),
  parentOrGuardianName: z.string().max(100).optional().nullable(),
  parentOrGuardianOccupation: z.string().max(100).optional().nullable(),

  // Dental History
  previousDentist: z.string().max(100).optional().nullable(),
  lastDentalVisit: dateSchema("Last Dental Visit", false),

  // Medical History - Physician
  physicianName: z.string().max(100).optional().nullable(),
  physicianSpecialty: z.string().max(100).optional().nullable(),
  physicianSpecialtyOther: z.string().max(100).optional().nullable(),
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
  q_medicationDetails: z.string().max(500).optional().nullable(),
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
  bloodType: z.string().max(50).optional().nullable(),
  bloodTypeOther: z.string().max(50).optional().nullable(),
  bloodPressure: z.string().max(20).optional().nullable(),

  // Conditions Checklist
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

  reasonForVisit: z.string().min(1, { message: "Reason for visit cannot be empty." }).max(1000),

  // Consent Section
  consentGiven: z.boolean().refine(val => val === true, {
    message: "You must provide consent to submit the form.",
  }),
  signature: z.string().min(1, { message: "Signature is required." }),

}).superRefine((data, ctx) => {
  if (data.physicianSpecialty === 'other' && (!data.physicianSpecialtyOther || data.physicianSpecialtyOther.trim() === '')) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Please specify other specialty.',
      path: ['physicianSpecialtyOther'],
    });
  }
  if (data.bloodType === 'other' && (!data.bloodTypeOther || data.bloodTypeOther.trim() === '')) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Please specify other blood type.',
      path: ['bloodTypeOther'],
    });
  }
  // Validate signature against full name
  const enteredFirstName = data.firstName?.trim() || "";
  const enteredMiddleName = data.middleName?.trim() || "";
  const enteredLastName = data.lastName?.trim() || "";

  let constructedFullName = enteredFirstName;
  if (enteredMiddleName) {
    constructedFullName += ` ${enteredMiddleName}`;
  }
  constructedFullName += ` ${enteredLastName}`;
  constructedFullName = constructedFullName.trim().toLowerCase();
  
  const signatureFullName = data.signature?.trim().toLowerCase();

  if (data.firstName && data.lastName && data.signature && constructedFullName !== signatureFullName) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Signature must match the patient's full name as entered above (First Name, Middle Name (if any), Last Name).",
      path: ['signature'],
    });
  }
});

export type PatientFormData = z.infer<typeof patientFormSchema>;

export const loginFormSchema = z.object({
  username: z.string().min(1, { message: "Username is required." }),
  password: z.string().min(1, { message: "Password is required." }),
});

export type LoginFormData = z.infer<typeof loginFormSchema>;

    