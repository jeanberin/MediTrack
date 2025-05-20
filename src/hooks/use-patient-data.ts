
"use client";
import { useState, useEffect, useCallback } from 'react';
import type { Patient } from '@/types';
import type { PatientFormData } from '@/lib/schemas';

const LOCAL_STORAGE_KEY = 'mediTrackPatients';

export function usePatientData() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    try {
      const storedPatients = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedPatients) {
        setPatients(JSON.parse(storedPatients));
      }
    } catch (error) {
      console.error("Failed to load patients from localStorage", error);
      // localStorage.removeItem(LOCAL_STORAGE_KEY); // Optional: clear corrupted data
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(patients));
      } catch (error) {
        console.error("Failed to save patients to localStorage", error);
      }
    }
  }, [patients, isLoading]);

  const addPatient = useCallback((patientData: PatientFormData) => {
    setPatients((prevPatients) => {
      const newPatient: Patient = {
        ...patientData,
        id: new Date().toISOString() + Math.random().toString(36).substring(2, 9),
        submissionDate: new Date().toISOString(),
      };
      return [newPatient, ...prevPatients];
    });
  }, []);

  const updatePatient = useCallback((updatedPatient: Patient) => {
    setPatients((prevPatients) =>
      prevPatients.map((p) => (p.id === updatedPatient.id ? updatedPatient : p))
    );
  }, []);

  const deletePatient = useCallback((patientId: string) => {
    setPatients((prevPatients) =>
      prevPatients.filter((p) => p.id !== patientId)
    );
  }, []);

  const getPatientById = useCallback((id: string): Patient | undefined => {
    return patients.find(p => p.id === id);
  }, [patients]);

  return { patients, addPatient, updatePatient, deletePatient, getPatientById, isLoading };
}
