
"use client";
import { useState, useEffect, useCallback } from 'react';
import type { Patient } from '@/types';
import type { PatientFormData } from '@/lib/schemas';

const PATIENTS_STORAGE_KEY = 'mediTrackPatients';

// Helper function to generate a simple unique ID
const generateId = () => new Date().toISOString() + Math.random().toString(36).substring(2, 9);

// Helper function to construct full name
const constructFullName = (firstName: string, middleName: string | undefined, lastName: string): string => {
  return `${firstName} ${middleName ? middleName + ' ' : ''}${lastName}`.trim();
};

export function usePatientData() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPatients = useCallback(async () => {
    setIsLoading(true);
    try {
      const storedPatients = localStorage.getItem(PATIENTS_STORAGE_KEY);
      if (storedPatients) {
        const parsedPatients = JSON.parse(storedPatients) as Patient[];
        const formattedPatients = parsedPatients.map(p => ({
          ...p,
          dateOfBirth: typeof p.dateOfBirth === 'string' ? p.dateOfBirth : new Date(p.dateOfBirth).toISOString().split('T')[0],
          submissionDate: typeof p.submissionDate === 'string' ? p.submissionDate : new Date(p.submissionDate).toISOString(),
        }));
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
        ...patientData,
        id: generateId(),
        fullName: fullName,
        submissionDate: new Date().toISOString(),
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
    // Note: updatedPatientData here is the full Patient object, potentially with new firstName, lastName, middleName
    // So, fullName should be reconstructed based on these.
    setIsLoading(true);
    try {
      const currentPatients = JSON.parse(localStorage.getItem(PATIENTS_STORAGE_KEY) || '[]') as Patient[];
      const patientIndex = currentPatients.findIndex(p => p.id === updatedPatientData.id);

      if (patientIndex !== -1) {
        const fullName = constructFullName(updatedPatientData.firstName, updatedPatientData.middleName, updatedPatientData.lastName);
        const patientToSave: Patient = {
          ...updatedPatientData,
          fullName: fullName, // Ensure fullName is updated
          submissionDate: updatedPatientData.submissionDate ? new Date(updatedPatientData.submissionDate).toISOString() : new Date().toISOString(),
          dateOfBirth: updatedPatientData.dateOfBirth ? new Date(updatedPatientData.dateOfBirth).toISOString().split('T')[0] : '',
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
