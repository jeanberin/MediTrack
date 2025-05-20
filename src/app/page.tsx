
import { PatientForm } from "@/components/patient-form";
import { PageHeader } from "@/components/page-header";
import { Users } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center">
      <PageHeader 
        title="Patient Registration"
        description="Securely submit your medical information to MediTrack."
        icon={Users}
        className="text-center"
      />
      <PatientForm />
    </div>
  );
}
