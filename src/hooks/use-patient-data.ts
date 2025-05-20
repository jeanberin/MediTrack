
"use client";
import { useState, useEffect, useCallback } from 'react';
import type { Patient } from '@/types';
import type { PatientFormData } from '@/lib/schemas';

const PATIENTS_STORAGE_KEY = 'mediTrackPatients';

// Helper function to generate a simple unique ID
const generateId = () => new Date().toISOString() + Math.random().toString(36).substring(2, 9);

export function usePatientData() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPatients = useCallback(async () => {
    setIsLoading(true);
    try {
      const storedPatients = localStorage.getItem(PATIENTS_STORAGE_KEY);
      if (storedPatients) {
        const parsedPatients = JSON.parse(storedPatients) as Patient[];
        // Ensure dates are consistently strings and sort
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
      setPatients([]); // Set to empty array on error
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const addPatient = useCallback(async (patientData: PatientFormData) => {
    setIsLoading(true);
    try {
      const newPatient: Patient = {
        ...patientData,
        id: generateId(),
        submissionDate: new Date().toISOString(),
      };
      
      const currentPatients = JSON.parse(localStorage.getItem(PATIENTS_STORAGE_KEY) || '[]') as Patient[];
      const updatedPatients = [newPatient, ...currentPatients].sort((a, b) => new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime());
      
      localStorage.setItem(PATIENTS_STORAGE_KEY, JSON.stringify(updatedPatients));
      setPatients(updatedPatients);
    } catch (error) {
      console.error("Failed to add patient to localStorage", error);
    }
    setIsLoading(false);
  }, []);

  const updatePatient = useCallback(async (updatedPatient: Patient) => {
    setIsLoading(true);
    try {
      const currentPatients = JSON.parse(localStorage.getItem(PATIENTS_STORAGE_KEY) || '[]') as Patient[];
      const patientIndex = currentPatients.findIndex(p => p.id === updatedPatient.id);

      if (patientIndex !== -1) {
        const updatedPatientsList = [...currentPatients];
        // Ensure submissionDate is in ISO string format if it's being updated
        updatedPatientsList[patientIndex] = {
            ...updatedPatient,
            submissionDate: updatedPatient.submissionDate ? new Date(updatedPatient.submissionDate).toISOString() : new Date().toISOString(),
            dateOfBirth: updatedPatient.dateOfBirth ? new Date(updatedPatient.dateOfBirth).toISOString().split('T')[0] : '',
        };
        
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
      setPatients(updatedPatients); // No need to re-sort if order is maintained by addition
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
