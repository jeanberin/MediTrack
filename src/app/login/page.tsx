
import { LoginForm } from "@/components/login-form";
import { PageHeader } from "@/components/page-header";
import { KeyRound } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center">
      <PageHeader 
        title="Doctor Portal Access"
        description="Log in to manage patient records and view submissions."
        icon={KeyRound}
        className="text-center"
      />
      <LoginForm />
    </div>
  );
}
