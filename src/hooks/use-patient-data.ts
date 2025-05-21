
"use client";
import { useState, useEffect, useCallback } from 'react';
import type { Patient } from '@/types';
import type { PatientFormData } from '@/lib/schemas';
import { isValid, parse as parseDateFns, format as formatDateFns } from 'date-fns';

const PATIENTS_STORAGE_KEY = 'mediTrackPatients';

const generateId = () => new Date().toISOString() + Math.random().toString(36).substring(2, 9);

const constructFullName = (firstName: string, middleName: string | undefined | null, lastName: string): string => {
  return `${firstName} ${middleName ? middleName + ' ' : ''}${lastName}`.trim();
};

const getDefaultPatientFormData = (): Omit<PatientFormData, 'firstName' | 'lastName' | 'dateOfBirth' | 'gender' | 'mobileNo' | 'email' | 'address' | 'reasonForVisit'> => ({
  middleName: "",
  religion: "",
  nationality: "",
  homeNo: "",
  occupation: "",
  officeNo: "",
  dentalInsurance: "",
  faxNo: "",
  effectiveDate: "",
  referredBy: "",
  guardianEmail: "",
  parentOrGuardianName: "",
  parentOrGuardianOccupation: "",
  previousDentist: "",
  lastDentalVisit: "",
  physicianName: "",
  physicianSpecialty: "",
  physicianSpecialtyOther: "",
  physicianOfficeAddress: "",
  physicianOfficeNumber: "",
  q_goodHealth: false,
  q_medicalTreatmentNow: false,
  q_medicalTreatmentCondition: "",
  q_seriousIllnessOperation: false,
  q_seriousIllnessOperationDetails: "",
  q_hospitalized: false,
  q_hospitalizedDetails: "",
  q_takingMedication: false,
  q_medicationDetails: "",
  q_useTobacco: false,
  q_useDrugs: false,
  allergy_localAnaesthetic: false,
  allergy_penicillin: false,
  allergy_aspirin: false,
  allergy_latex: false,
  allergy_other: false,
  allergy_other_details: "",
  bleedingTime: "",
  q_isPregnant: false,
  q_isNursing: false,
  q_onBirthControl: false,
  bloodType: "",
  bloodTypeOther: "",
  bloodPressure: "",
  cond_highBloodPressure: false,
  cond_heartDisease: false,
  cond_cancerTumors: false,
  cond_lowBloodPressure: false,
  cond_heartMurmur: false,
  cond_anemia: false,
  cond_epilepsyConvulsions: false,
  cond_hepatitisLiverDisease: false,
  cond_angina: false,
  cond_aidsHiv: false,
  cond_rheumaticFever: false,
  cond_asthma: false,
  cond_std: false,
  cond_hayFeverAllergies: false,
  cond_emphysema: false,
  cond_stomachTroublesUlcers: false,
  cond_respiratoryProblems: false,
  cond_bleedingProblems: false,
  cond_faintingSeizure: false,
  cond_hepatitisJaundice: false,
  cond_bloodDisease: false,
  cond_rapidWeightLoss: false,
  cond_tuberculosis: false,
  cond_heartInjuries: false,
  cond_radiationTherapy: false,
  cond_swollenAnkles: false,
  cond_arthritisRheumatism: false,
  cond_jointReplacementImplant: false,
  cond_kidneyDisease: false,
  cond_heartSurgery: false,
  cond_heartAttack: false,
  cond_thyroidProblem: false,
  cond_diabetes: false,
  cond_chestPain: false,
  cond_stroke: false,
  cond_others: false,
  cond_others_details: "",
});

const safeFormatToYyyyMmDd = (dateInput: any): string | null => {
  if (!dateInput) return null;
  try {
    const parsedDate = parseDateFns(dateInput, 'yyyy-MM-dd', new Date());
    if (isValid(parsedDate)) {
      return formatDateFns(parsedDate, 'yyyy-MM-dd');
    }
    // Attempt to parse from ISO if it's not already yyyy-MM-dd
    const isoParsed = new Date(dateInput);
    if (isValid(isoParsed)) {
      return formatDateFns(isoParsed, 'yyyy-MM-dd');
    }
  } catch (e) { /* ignore parse errors, return null */ }
  return null;
};

const safeFormatToIsoString = (dateInput: any, defaultDate: Date = new Date()): string => {
  if (!dateInput) return defaultDate.toISOString();
  try {
    const parsedDate = new Date(dateInput);
    if (isValid(parsedDate)) {
      return parsedDate.toISOString();
    }
  } catch (e) { /* ignore parse errors, return default */ }
  return defaultDate.toISOString();
};


export function usePatientData() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPatients = useCallback(async () => {
    setIsLoading(true);
    try {
      const storedPatients = localStorage.getItem(PATIENTS_STORAGE_KEY);
      if (storedPatients) {
        const parsedPatients = JSON.parse(storedPatients) as any[];
        const formattedPatients = parsedPatients.map(p => ({
          ...getDefaultPatientFormData(),
          ...p,
          id: p.id || generateId(),
          fullName: p.fullName || constructFullName(p.firstName, p.middleName, p.lastName),
          dateOfBirth: safeFormatToYyyyMmDd(p.dateOfBirth) || "",
          effectiveDate: safeFormatToYyyyMmDd(p.effectiveDate),
          lastDentalVisit: safeFormatToYyyyMmDd(p.lastDentalVisit),
          submissionDate: safeFormatToIsoString(p.submissionDate),
          mobileNo: p.mobileNo || p.contactNumber || "",
          physicianSpecialtyOther: p.physicianSpecialty === 'other' ? p.physicianSpecialtyOther || "" : "",
          bloodTypeOther: p.bloodType === 'other' ? p.bloodTypeOther || "" : "",
        } as Patient));
        setPatients(formattedPatients.sort((a, b) => new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime()));
      } else {
        setPatients([]);
      }
    } catch (error) {
      console.error("Failed to load patients from localStorage", error);
      setPatients([]);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const addPatient = useCallback(async (patientData: PatientFormData) => {
    setIsLoading(true);
    try {
      const fullName = constructFullName(patientData.firstName, patientData.middleName, patientData.lastName);
      const newPatient: Patient = {
        ...getDefaultPatientFormData(),
        ...patientData,
        id: generateId(),
        fullName: fullName,
        submissionDate: new Date().toISOString(),
        dateOfBirth: safeFormatToYyyyMmDd(patientData.dateOfBirth) || "",
        effectiveDate: safeFormatToYyyyMmDd(patientData.effectiveDate),
        lastDentalVisit: safeFormatToYyyyMmDd(patientData.lastDentalVisit),
        physicianSpecialtyOther: patientData.physicianSpecialty === 'other' ? patientData.physicianSpecialtyOther : "",
        bloodTypeOther: patientData.bloodType === 'other' ? patientData.bloodTypeOther : "",
      };

      const currentPatients = JSON.parse(localStorage.getItem(PATIENTS_STORAGE_KEY) || '[]') as Patient[];
      const updatedPatientsList = [newPatient, ...currentPatients].sort((a, b) => new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime());

      localStorage.setItem(PATIENTS_STORAGE_KEY, JSON.stringify(updatedPatientsList));
      setPatients(updatedPatientsList);
    } catch (error) {
      console.error("Failed to add patient to localStorage", error);
    }
    setIsLoading(false);
  }, []);

  const updatePatient = useCallback(async (updatedPatientData: Patient) => {
    setIsLoading(true);
    try {
      const currentPatients = JSON.parse(localStorage.getItem(PATIENTS_STORAGE_KEY) || '[]') as Patient[];
      const patientIndex = currentPatients.findIndex(p => p.id === updatedPatientData.id);

      if (patientIndex !== -1) {
        const fullName = constructFullName(updatedPatientData.firstName, updatedPatientData.middleName, updatedPatientData.lastName);
        const patientToSave: Patient = {
          ...getDefaultPatientFormData(),
          ...updatedPatientData,
          fullName: fullName,
          submissionDate: safeFormatToIsoString(updatedPatientData.submissionDate),
          dateOfBirth: safeFormatToYyyyMmDd(updatedPatientData.dateOfBirth) || '',
          effectiveDate: safeFormatToYyyyMmDd(updatedPatientData.effectiveDate),
          lastDentalVisit: safeFormatToYyyyMmDd(updatedPatientData.lastDentalVisit),
          physicianSpecialtyOther: updatedPatientData.physicianSpecialty === 'other' ? updatedPatientData.physicianSpecialtyOther : "",
          bloodTypeOther: updatedPatientData.bloodType === 'other' ? updatedPatientData.bloodTypeOther : "",
        };

        const updatedPatientsList = [...currentPatients];
        updatedPatientsList[patientIndex] = patientToSave;

        localStorage.setItem(PATIENTS_STORAGE_KEY, JSON.stringify(updatedPatientsList));
        setPatients(updatedPatientsList.sort((a, b) => new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime()));
      }
    } catch (error) {
      console.error("Failed to update patient in localStorage", error);
    }
    setIsLoading(false);
  }, []);

  const deletePatient = useCallback(async (patientId: string) => {
    setIsLoading(true);
    try {
      const currentPatients = JSON.parse(localStorage.getItem(PATIENTS_STORAGE_KEY) || '[]') as Patient[];
      const updatedPatients = currentPatients.filter((p) => p.id !== patientId);

      localStorage.setItem(PATIENTS_STORAGE_KEY, JSON.stringify(updatedPatients));
      setPatients(updatedPatients);
    } catch (error) {
      console.error("Failed to delete patient from localStorage", error);
    }
    setIsLoading(false);
  }, []);

  const getPatientById = useCallback((id: string): Patient | undefined => {
    return patients.find(p => p.id === id);
  }, [patients]);

  return { patients, addPatient, updatePatient, deletePatient, getPatientById, isLoading, refetchPatients: fetchPatients };
}
