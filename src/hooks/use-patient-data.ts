
"use client";
import { useState, useEffect, useCallback } from 'react';
import type { Patient } from '@/types';
import type { PatientFormData } from '@/lib/schemas';
import { db } from '@/lib/firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  serverTimestamp,
  Timestamp
} from "firebase/firestore";

const PATIENTS_COLLECTION = 'patients';

export function usePatientData() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPatients = useCallback(async () => {
    setIsLoading(true);
    try {
      const patientsCollection = collection(db, PATIENTS_COLLECTION);
      const q = query(patientsCollection, orderBy("submissionDate", "desc"));
      const querySnapshot = await getDocs(q);
      const patientsData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          // Ensure dateOfBirth and submissionDate are correctly formatted if stored as Timestamps
          dateOfBirth: data.dateOfBirth instanceof Timestamp ? data.dateOfBirth.toDate().toISOString().split('T')[0] : data.dateOfBirth,
          submissionDate: data.submissionDate instanceof Timestamp ? data.submissionDate.toDate().toISOString() : data.submissionDate,
        } as Patient;
      });
      setPatients(patientsData);
    } catch (error) {
      console.error("Failed to load patients from Firestore", error);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const addPatient = useCallback(async (patientData: PatientFormData) => {
    setIsLoading(true);
    try {
      const newPatientData = {
        ...patientData,
        submissionDate: Timestamp.fromDate(new Date()), // Store as Firestore Timestamp
      };
      const docRef = await addDoc(collection(db, PATIENTS_COLLECTION), newPatientData);
      // Optimistically add to local state or refetch
      // For simplicity, we can refetch, or add locally with the new ID
      const newPatient: Patient = {
        id: docRef.id,
        ...patientData,
        submissionDate: (newPatientData.submissionDate as Timestamp).toDate().toISOString(),
      };
      setPatients((prevPatients) => [newPatient, ...prevPatients].sort((a, b) => new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime()));
    } catch (error) {
      console.error("Failed to add patient to Firestore", error);
    }
    setIsLoading(false);
  }, []);

  const updatePatient = useCallback(async (updatedPatient: Patient) => {
    setIsLoading(true);
    try {
      const patientDocRef = doc(db, PATIENTS_COLLECTION, updatedPatient.id);
      // Separate id from the rest of the data to be updated
      const { id, ...dataToUpdate } = updatedPatient;
       // Ensure submissionDate is a Firestore Timestamp if it was converted to string locally
      const finalDataToUpdate = {
        ...dataToUpdate,
        submissionDate: dataToUpdate.submissionDate ? Timestamp.fromDate(new Date(dataToUpdate.submissionDate)) : serverTimestamp(),
        dateOfBirth: dataToUpdate.dateOfBirth, // Assuming dateOfBirth is already a string 'YYYY-MM-DD'
      };

      await updateDoc(patientDocRef, finalDataToUpdate);
      setPatients((prevPatients) =>
        prevPatients.map((p) => (p.id === updatedPatient.id ? updatedPatient : p))
      );
    } catch (error) {
      console.error("Failed to update patient in Firestore", error);
    }
    setIsLoading(false);
  }, []);

  const deletePatient = useCallback(async (patientId: string) => {
    setIsLoading(true);
    try {
      const patientDocRef = doc(db, PATIENTS_COLLECTION, patientId);
      await deleteDoc(patientDocRef);
      setPatients((prevPatients) =>
        prevPatients.filter((p) => p.id !== patientId)
      );
    } catch (error) {
      console.error("Failed to delete patient from Firestore", error);
    }
    setIsLoading(false);
  }, []);

  const getPatientById = useCallback((id: string): Patient | undefined => {
    return patients.find(p => p.id === id);
  }, [patients]);

  return { patients, addPatient, updatePatient, deletePatient, getPatientById, isLoading, refetchPatients: fetchPatients };
}
