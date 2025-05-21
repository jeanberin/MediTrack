
export interface Patient {
  id: string;
  // Patient Information Record
  firstName: string;
  middleName?: string | null;
  lastName: string;
  fullName: string;
  dateOfBirth: string; // Stored as YYYY-MM-DD string
  sex: 'male' | 'female';
  mobileNo: string;
  email: string;
  address: string;

  religion?: string | null;
  nationality?: string | null;
  homeNo?: string | null;
  occupation?: string | null;
  officeNo?: string | null;
  dentalInsurance?: string | null;
  faxNo?: string | null;
  effectiveDate?: string | null; // Stored as YYYY-MM-DD string or null
  referredBy?: string | null;

  // For Minors
  guardianEmail?: string | null;
  parentOrGuardianName?: string | null;
  parentOrGuardianOccupation?: string | null;

  // Dental History
  previousDentist?: string | null;
  lastDentalVisit?: string | null; // Stored as YYYY-MM-DD string or null

  // Medical History - Physician
  physicianName?: string | null;
  physicianSpecialty?: string | null;
  physicianSpecialtyOther?: string | null;
  physicianOfficeAddress?: string | null;
  physicianOfficeNumber?: string | null;

  // Medical History - Yes/No Questions
  q_goodHealth?: boolean;
  q_medicalTreatmentNow?: boolean;
  q_medicalTreatmentCondition?: string | null;
  q_seriousIllnessOperation?: boolean;
  q_seriousIllnessOperationDetails?: string | null;
  q_hospitalized?: boolean;
  q_hospitalizedDetails?: string | null;
  q_takingMedication?: boolean;
  q_medicationDetails?: string | null;
  q_useTobacco?: boolean;
  q_useDrugs?: boolean;

  // Allergies
  allergy_localAnaesthetic?: boolean;
  allergy_penicillin?: boolean;
  allergy_aspirin?: boolean;
  allergy_latex?: boolean;
  allergy_other?: boolean;
  allergy_other_details?: string | null;

  // Pregnancy/Misc
  bleedingTime?: string | null;
  q_isPregnant?: boolean;
  q_isNursing?: boolean;
  q_onBirthControl?: boolean;

  // Vitals
  bloodType?: string | null;
  bloodTypeOther?: string | null;
  bloodPressure?: string | null;

  // Conditions Checklist
  cond_highBloodPressure?: boolean;
  cond_heartDisease?: boolean;
  cond_cancerTumors?: boolean;
  cond_lowBloodPressure?: boolean;
  cond_heartMurmur?: boolean;
  cond_anemia?: boolean;
  cond_epilepsyConvulsions?: boolean;
  cond_hepatitisLiverDisease?: boolean;
  cond_angina?: boolean;
  cond_aidsHiv?: boolean;
  cond_rheumaticFever?: boolean;
  cond_asthma?: boolean;
  cond_std?: boolean;
  cond_hayFeverAllergies?: boolean;
  cond_emphysema?: boolean;
  cond_stomachTroublesUlcers?: boolean;
  cond_respiratoryProblems?: boolean;
  cond_bleedingProblems?: boolean;
  cond_faintingSeizure?: boolean;
  cond_hepatitisJaundice?: boolean;
  cond_bloodDisease?: boolean;
  cond_rapidWeightLoss?: boolean;
  cond_tuberculosis?: boolean;
  cond_heartInjuries?: boolean;
  cond_radiationTherapy?: boolean;
  cond_swollenAnkles?: boolean;
  cond_arthritisRheumatism?: boolean;
  cond_jointReplacementImplant?: boolean;
  cond_kidneyDisease?: boolean;
  cond_heartSurgery?: boolean;
  cond_heartAttack?: boolean;
  cond_thyroidProblem?: boolean;
  cond_diabetes?: boolean;
  cond_chestPain?: boolean;
  cond_stroke?: boolean;
  cond_others?: boolean;
  cond_others_details?: string | null;

  reasonForVisit: string;
  submissionDate: string; // ISO string format

  // Consent
  consentGiven: boolean;
  signature: string;
}


    