
"use client";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { patientFormSchema, type PatientFormData } from '@/lib/schemas';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription as ShadcnCardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { usePatientData } from '@/hooks/use-patient-data';
import { Save, CheckCircle, Edit3, CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format as formatDateFns, parse as parseDateFns, isValid as isValidDateFns } from 'date-fns';
import { useState, useEffect } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';

const SectionTitle: React.FC<{ title: string; className?: string }> = ({ title, className }) => (
  <h2 className={cn("text-xl font-semibold text-primary mt-6 mb-3 pb-2 border-b", className)}>{title}</h2>
);

const SubSectionTitle: React.FC<{ title: string; className?: string }> = ({ title, className }) => (
  <h3 className={cn("text-lg font-medium text-foreground mt-4 mb-2", className)}>{title}</h3>
);

const PHYSICIAN_SPECIALTIES = [
  "General Practice", "Internal Medicine", "Pediatrics", "Cardiology",
  "Oncology", "Neurology", "Dermatology", "Orthopedics", "Endocrinology",
  "Gastroenterology", "Pulmonology", "Rheumatology", "Urology", "Ophthalmology",
  "Psychiatry", "other"
] as const;

const BLOOD_TYPES = [
  "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Unknown", "other"
] as const;

const RELIGIONS = [
  "Roman Catholic",
  "Agnostic",
  "Atheist",
  "Bahá'í Faith",
  "Buddhism",
  "Christianity",
  "Hinduism",
  "Islam",
  "Jainism",
  "Judaism",
  "Shinto",
  "Sikhism",
  "Spiritual but not religious",
  "Taoism",
  "Other",
  "Prefer not to say"
].sort((a, b) => {
  if (a === "Roman Catholic") return -1;
  if (b === "Roman Catholic") return 1;
  if (a === "Other" || a === "Prefer not to say") return 1;
  if (b === "Other" || b === "Prefer not to say") return -1;
  return a.localeCompare(b);
});


const NATIONALITIES = [
  "Filipino",
  "Afghan", "Albanian", "Algerian", "American", "Andorran", "Angolan", "Argentine", "Armenian", "Australian", "Austrian",
  "Azerbaijani", "Bahamian", "Bahraini", "Bangladeshi", "Barbadian", "Belarusian", "Belgian", "Belizean", "Beninese", "Bhutanese",
  "Bolivian", "Bosnian", "Botswanan", "Brazilian", "British", "Bruneian", "Bulgarian", "Burkinabe", "Burmese", "Burundian",
  "Cambodian", "Cameroonian", "Canadian", "Cape Verdean", "Central African", "Chadian", "Chilean", "Chinese", "Colombian", "Comoran",
  "Congolese (Congo-Brazzaville)", "Congolese (Congo-Kinshasa)", "Costa Rican", "Croatian", "Cuban", "Cypriot", "Czech", "Danish",
  "Djiboutian", "Dominican (Dominica)", "Dominican (Dominican Republic)", "Dutch", "East Timorese", "Ecuadorean", "Egyptian",
  "Emirati", "Equatorial Guinean", "Eritrean", "Estonian", "Ethiopian", "Fijian", "Finnish", "French", "Gabonese",
  "Gambian", "Georgian", "German", "Ghanaian", "Greek", "Grenadian", "Guatemalan", "Guinean", "Guinean-Bissauan", "Guyanese",
  "Haitian", "Honduran", "Hungarian", "Icelandic", "Indian", "Indonesian", "Iranian", "Iraqi", "Irish", "Israeli", "Italian",
  "Ivorian", "Jamaican", "Japanese", "Jordanian", "Kazakhstani", "Kenyan", "Kittian and Nevisian", "Kuwaiti", "Kyrgyz", "Laotian",
  "Latvian", "Lebanese", "Liberian", "Libyan", "Liechtensteiner", "Lithuanian", "Luxembourger", "Macedonian", "Malagasy", "Malawian",
  "Malaysian", "Maldivan", "Malian", "Maltese", "Marshallese", "Mauritanian", "Mauritian", "Mexican", "Micronesian", "Moldovan",
  "Monacan", "Mongolian", "Montenegrin", "Moroccan", "Mosotho", "Motswana", "Mozambican", "Namibian", "Nauruan", "Nepalese",
  "New Zealander", "Nicaraguan", "Nigerian", "Nigerien", "North Korean", "Northern Irish", "Norwegian", "Omani", "Pakistani",
  "Palauan", "Panamanian", "Papua New Guinean", "Paraguayan", "Peruvian", "Polish", "Portuguese", "Qatari", "Romanian", "Russian",
  "Rwandan", "Saint Lucian", "Salvadoran", "Samoan", "San Marinese", "Sao Tomean", "Saudi", "Scottish", "Senegalese", "Serbian",
  "Seychellois", "Sierra Leonean", "Singaporean", "Slovakian", "Slovenian", "Solomon Islander", "Somali", "South African",
  "South Korean", "South Sudanese", "Spanish", "Sri Lankan", "Sudanese", "Surinamer", "Swazi", "Swedish", "Swiss", "Syrian",
  "Taiwanese", "Tajik", "Tanzanian", "Thai", "Togolese", "Tongan", "Trinidadian or Tobagonian", "Tunisian", "Turkish", "Tuvaluan",
  "Ugandan", "Ukrainian", "Uruguayan", "Uzbekistani", "Venezuelan", "Vietnamese", "Welsh", "Yemenite", "Zambian", "Zimbabwean",
  "Other"
].sort((a, b) => {
  if (a === "Filipino") return -1;
  if (b === "Filipino") return 1;
  if (a === "Other") return 1;
  if (b === "Other") return -1;
  return a.localeCompare(b);
});


export function PatientForm() {
  const { toast } = useToast();
  const { addPatient } = usePatientData();
  const [isSubmittedSuccessfully, setIsSubmittedSuccessfully] = useState(false);

  const form = useForm<PatientFormData>({
    resolver: zodResolver(patientFormSchema),
    defaultValues: {
      firstName: "",
      middleName: "",
      lastName: "",
      dateOfBirth: "", 
      sex: undefined,
      mobileNo: "",
      email: "",
      address: "",
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
      reasonForVisit: "",
      consentGiven: false,
      signature: "",
    },
  });

  const watchMedicalTreatmentNow = form.watch("q_medicalTreatmentNow");
  const watchSeriousIllnessOperation = form.watch("q_seriousIllnessOperation");
  const watchHospitalized = form.watch("q_hospitalized");
  const watchTakingMedication = form.watch("q_takingMedication");
  const watchAllergyOther = form.watch("allergy_other");
  const watchCondOthers = form.watch("cond_others");
  const watchPhysicianSpecialty = form.watch("physicianSpecialty");
  const watchBloodType = form.watch("bloodType");

  const [isMinor, setIsMinor] = useState(false);
  const dob = form.watch("dateOfBirth");

  useEffect(() => {
    if (dob && /^\d{4}-\d{2}-\d{2}$/.test(dob)) {
      try {
        const birthDate = parseDateFns(dob, 'yyyy-MM-dd', new Date());
        if (isValidDateFns(birthDate)) {
          const today = new Date();
          let age = today.getFullYear() - birthDate.getFullYear();
          const m = today.getMonth() - birthDate.getMonth();
          if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
          }
          setIsMinor(age < 18);
        } else {
          setIsMinor(false);
        }
      } catch (e) {
        setIsMinor(false);
      }
    } else {
      setIsMinor(false);
    }
  }, [dob]);


  async function onSubmit(data: PatientFormData) {
    try {
      const processedData = {
        ...data,
        dateOfBirth: data.dateOfBirth ? data.dateOfBirth : "", 
        effectiveDate: data.effectiveDate ? data.effectiveDate : null, 
        lastDentalVisit: data.lastDentalVisit ? data.lastDentalVisit : null, 
        physicianSpecialtyOther: data.physicianSpecialty === 'other' ? data.physicianSpecialtyOther : "",
        bloodTypeOther: data.bloodType === 'other' ? data.bloodTypeOther : "",
      };
      await addPatient(processedData);
      toast({
        title: "Form Submitted",
        description: "Your medical information has been successfully submitted.",
      });
      form.reset();
      setIsSubmittedSuccessfully(true);
    } catch (error) {
      console.error("Submission error:", error);
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your form. Please try again.",
        variant: "destructive",
      });
      setIsSubmittedSuccessfully(false);
    }
  }

  const handleNewSubmission = () => {
    setIsSubmittedSuccessfully(false);
    form.reset(); 
  };

  const conditionChecklistItems = [
    { id: "cond_highBloodPressure", label: "High Blood Pressure" }, { id: "cond_heartDisease", label: "Heart Disease" },
    { id: "cond_cancerTumors", label: "Cancer/Tumors" }, { id: "cond_lowBloodPressure", label: "Low Blood Pressure" },
    { id: "cond_heartMurmur", label: "Heart Murmur" }, { id: "cond_anemia", label: "Anemia" },
    { id: "cond_epilepsyConvulsions", label: "Epilepsy/Convulsions" }, { id: "cond_hepatitisLiverDisease", label: "Hepatitis/Liver Disease" },
    { id: "cond_angina", label: "Angina" }, { id: "cond_aidsHiv", label: "AIDS/HIV Infection" },
    { id: "cond_rheumaticFever", label: "Rheumatic Fever" }, { id: "cond_asthma", label: "Asthma" },
    { id: "cond_std", label: "Sexually Transmitted Disease" }, { id: "cond_hayFeverAllergies", label: "Hay Fever/Allergies" },
    { id: "cond_emphysema", label: "Emphysema" }, { id: "cond_stomachTroublesUlcers", label: "Stomach Troubles/Ulcers" },
    { id: "cond_respiratoryProblems", label: "Respiratory Problems" }, { id: "cond_bleedingProblems", label: "Bleeding Problems" },
    { id: "cond_faintingSeizure", label: "Fainting/Seizure" }, { id: "cond_hepatitisJaundice", label: "Hepatitis/Jaundice" },
    { id: "cond_bloodDisease", label: "Blood Disease" }, { id: "cond_rapidWeightLoss", label: "Rapid Weight Loss" },
    { id: "cond_tuberculosis", label: "Tuberculosis" }, { id: "cond_heartInjuries", label: "Heart Injuries" },
    { id: "cond_radiationTherapy", label: "Radiation Therapy" }, { id: "cond_swollenAnkles", label: "Swollen Ankles" },
    { id: "cond_arthritisRheumatism", label: "Arthritis/Rheumatism" }, { id: "cond_jointReplacementImplant", label: "Joint Replacement/Implant" },
    { id: "cond_kidneyDisease", label: "Kidney Disease" }, { id: "cond_heartSurgery", label: "Heart Surgery" },
    { id: "cond_heartAttack", label: "Heart Attack" }, { id: "cond_thyroidProblem", label: "Thyroid Problem" },
    { id: "cond_diabetes", label: "Diabetes" }, { id: "cond_chestPain", label: "Chest Pain" },
    { id: "cond_stroke", label: "Stroke" }, { id: "cond_others", label: "Others (please specify)" }
  ] as const;


  if (isSubmittedSuccessfully) {
    return (
      <Card className="w-full max-w-2xl mx-auto shadow-lg text-center">
        <CardHeader>
          <div className="flex flex-col items-center text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
            <CardTitle className="text-2xl">Submission Successful!</CardTitle>
            <ShadcnCardDescription className="mt-2 text-lg">
              Your medical information has been recorded.
            </ShadcnCardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Button onClick={handleNewSubmission} className="w-full max-w-xs mx-auto">
            <Edit3 className="mr-2 h-4 w-4" /> Submit Another Response
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-3xl mx-auto shadow-lg">
      <CardHeader>
        <CardTitle>Patient Medical Information Form</CardTitle>
        <ShadcnCardDescription>Please fill out the form with accurate details. All fields marked with <span className="text-destructive">*</span> are required.</ShadcnCardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

            <SectionTitle title="Patient Information Record" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField control={form.control} name="firstName" render={({ field }) => ( <FormItem> <FormLabel>First Name <span className="text-destructive">*</span></FormLabel> <FormControl><Input placeholder="John" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
              <FormField control={form.control} name="lastName" render={({ field }) => ( <FormItem> <FormLabel>Last Name <span className="text-destructive">*</span></FormLabel> <FormControl><Input placeholder="Doe" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
              <FormField control={form.control} name="middleName" render={({ field }) => ( <FormItem> <FormLabel>Middle Name</FormLabel> <FormControl><Input placeholder="Michael" {...field} value={field.value || ""} /></FormControl> <FormMessage /> </FormItem> )} />

              <FormField
                control={form.control}
                name="dateOfBirth"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date of Birth <span className="text-destructive">*</span></FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          ref={field.ref} 
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          <span className="flex items-center justify-between w-full">
                            <span>
                              {field.value && isValidDateFns(parseDateFns(field.value, 'yyyy-MM-dd', new Date()))
                                ? formatDateFns(parseDateFns(field.value, 'yyyy-MM-dd', new Date()), "PPP")
                                : "Pick a date"}
                            </span>
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </span>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value && isValidDateFns(parseDateFns(field.value, 'yyyy-MM-dd', new Date())) ? parseDateFns(field.value, 'yyyy-MM-dd', new Date()) : undefined}
                          onSelect={(date) => field.onChange(date ? formatDateFns(date, "yyyy-MM-dd") : '')}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                          captionLayout="dropdown-buttons"
                          fromYear={1900}
                          toYear={new Date().getFullYear()}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField control={form.control} name="sex" render={({ field }) => ( <FormItem> <FormLabel>Sex <span className="text-destructive">*</span></FormLabel> <Select onValueChange={field.onChange} value={field.value}> <FormControl><SelectTrigger><SelectValue placeholder="Select sex" /></SelectTrigger></FormControl> <SelectContent> <SelectItem value="male">Male</SelectItem> <SelectItem value="female">Female</SelectItem> </SelectContent> </Select> <FormMessage /> </FormItem> )} />
              <FormField control={form.control} name="mobileNo" render={({ field }) => ( <FormItem> <FormLabel>Mobile No. <span className="text-destructive">*</span></FormLabel> <FormControl><Input type="tel" placeholder="(123) 456-7890" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
              <FormField control={form.control} name="email" render={({ field }) => ( <FormItem> <FormLabel>Email Address <span className="text-destructive">*</span></FormLabel> <FormControl><Input type="email" placeholder="john.doe@example.com" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
              <FormField control={form.control} name="address" render={({ field }) => ( <FormItem className="md:col-span-2"> <FormLabel>Address <span className="text-destructive">*</span></FormLabel> <FormControl><Textarea placeholder="123 Main St, Anytown, USA" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
              
              <FormField control={form.control} name="religion" render={({ field }) => (
                <FormItem>
                  <FormLabel>Religion</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ""}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select religion" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {RELIGIONS.map(religion => (
                        <SelectItem key={religion} value={religion}>{religion}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="nationality" render={({ field }) => (
                <FormItem>
                  <FormLabel>Nationality</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ""}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select nationality" /></SelectTrigger></FormControl>
                    <SelectContent className="max-h-60">
                      {NATIONALITIES.map(nationality => (
                        <SelectItem key={nationality} value={nationality}>{nationality}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="homeNo" render={({ field }) => ( <FormItem> <FormLabel>Home No.</FormLabel> <FormControl><Input type="tel" {...field} value={field.value || ""} /></FormControl> <FormMessage /> </FormItem> )} />
              <FormField control={form.control} name="occupation" render={({ field }) => ( <FormItem> <FormLabel>Occupation</FormLabel> <FormControl><Input {...field} value={field.value || ""} /></FormControl> <FormMessage /> </FormItem> )} />
              <FormField control={form.control} name="officeNo" render={({ field }) => ( <FormItem> <FormLabel>Office No.</FormLabel> <FormControl><Input type="tel" {...field} value={field.value || ""} /></FormControl> <FormMessage /> </FormItem> )} />
              <FormField control={form.control} name="dentalInsurance" render={({ field }) => ( <FormItem> <FormLabel>Dental Insurance</FormLabel> <FormControl><Input {...field} value={field.value || ""} /></FormControl> <FormMessage /> </FormItem> )} />
              <FormField control={form.control} name="faxNo" render={({ field }) => ( <FormItem> <FormLabel>Fax No.</FormLabel> <FormControl><Input type="tel" {...field} value={field.value || ""} /></FormControl> <FormMessage /> </FormItem> )} />

              <FormField
                control={form.control}
                name="effectiveDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Effective Date (Insurance)</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                         <Button
                            ref={field.ref}
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            <span className="flex items-center justify-between w-full">
                              <span>
                                {field.value && isValidDateFns(parseDateFns(field.value, 'yyyy-MM-dd', new Date()))
                                  ? formatDateFns(parseDateFns(field.value, 'yyyy-MM-dd', new Date()), "PPP")
                                  : "Pick a date"}
                              </span>
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </span>
                          </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value && isValidDateFns(parseDateFns(field.value, 'yyyy-MM-dd', new Date())) ? parseDateFns(field.value, 'yyyy-MM-dd', new Date()) : undefined}
                          onSelect={(date) => field.onChange(date ? formatDateFns(date, "yyyy-MM-dd") : '')}
                          initialFocus
                          captionLayout="dropdown-buttons"
                          fromYear={new Date().getFullYear() - 10}
                          toYear={new Date().getFullYear() + 10}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField control={form.control} name="referredBy" render={({ field }) => ( <FormItem className="md:col-span-2"> <FormLabel>Whom may we thank for referring you?</FormLabel> <FormControl><Input {...field} value={field.value || ""} /></FormControl> <FormMessage /> </FormItem> )} />
            </div>

            {isMinor && (
              <>
                <SubSectionTitle title="Parent/Guardian Information (for Minors)" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField control={form.control} name="parentOrGuardianName" render={({ field }) => ( <FormItem> <FormLabel>Parent/Guardian's Name <span className="text-destructive">*</span></FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                  <FormField control={form.control} name="guardianEmail" render={({ field }) => ( <FormItem> <FormLabel>Parent/Guardian's Email <span className="text-destructive">*</span></FormLabel> <FormControl><Input type="email" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                  <FormField control={form.control} name="parentOrGuardianOccupation" render={({ field }) => ( <FormItem className="md:col-span-2"> <FormLabel>Parent/Guardian's Occupation</FormLabel> <FormControl><Input {...field} value={field.value || ""} /></FormControl> <FormMessage /> </FormItem> )} />
                </div>
              </>
            )}

            <SectionTitle title="Dental History" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField control={form.control} name="previousDentist" render={({ field }) => ( <FormItem> <FormLabel>Previous Dentist (Dr.)</FormLabel> <FormControl><Input {...field} value={field.value || ""} /></FormControl> <FormMessage /> </FormItem> )} />
              <FormField
                control={form.control}
                name="lastDentalVisit"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Last Dental Visit</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          ref={field.ref}
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          <span className="flex items-center justify-between w-full">
                            <span>
                              {field.value && isValidDateFns(parseDateFns(field.value, 'yyyy-MM-dd', new Date()))
                                ? formatDateFns(parseDateFns(field.value, 'yyyy-MM-dd', new Date()), "PPP")
                                : "Pick a date"}
                            </span>
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </span>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value && isValidDateFns(parseDateFns(field.value, 'yyyy-MM-dd', new Date())) ? parseDateFns(field.value, 'yyyy-MM-dd', new Date()) : undefined}
                          onSelect={(date) => field.onChange(date ? formatDateFns(date, "yyyy-MM-dd") : '')}
                          initialFocus
                          captionLayout="dropdown-buttons"
                          fromYear={new Date().getFullYear() - 50}
                          toYear={new Date().getFullYear()}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <SectionTitle title="Medical History" />
            <SubSectionTitle title="Physician Information" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField control={form.control} name="physicianName" render={({ field }) => ( <FormItem> <FormLabel>Name of Physician (Dr.)</FormLabel> <FormControl><Input {...field} value={field.value || ""} /></FormControl> <FormMessage /> </FormItem> )} />
              <FormField control={form.control} name="physicianSpecialty" render={({ field }) => (
                <FormItem>
                  <FormLabel>Physician's Specialty</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ""}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select specialty" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {PHYSICIAN_SPECIALTIES.map(spec => (
                        <SelectItem key={spec} value={spec}>{spec === 'other' ? 'Other' : spec}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              {watchPhysicianSpecialty === "other" && (
                <FormField control={form.control} name="physicianSpecialtyOther" render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Please specify other specialty <span className="text-destructive">*</span></FormLabel>
                    <FormControl><Input {...field} placeholder="Specify specialty" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              )}
              <FormField control={form.control} name="physicianOfficeAddress" render={({ field }) => ( <FormItem className={watchPhysicianSpecialty === "other" ? "" : "md:col-span-2"}> <FormLabel>Physician's Office Address</FormLabel> <FormControl><Textarea {...field} value={field.value || ""} /></FormControl> <FormMessage /> </FormItem> )} />
              <FormField control={form.control} name="physicianOfficeNumber" render={({ field }) => ( <FormItem> <FormLabel>Physician's Office Number</FormLabel> <FormControl><Input type="tel" {...field} value={field.value || ""} /></FormControl> <FormMessage /> </FormItem> )} />
            </div>

            <SubSectionTitle title="Health Questions" />

            <FormField control={form.control} name="q_goodHealth" render={({ field }) => ( <FormItem className="flex flex-row items-center space-x-3 space-y-0 p-3 border rounded-md"> <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl> <FormLabel className="font-normal">Are you in good health?</FormLabel> </FormItem> )} />

            <FormField control={form.control} name="q_medicalTreatmentNow" render={({ field }) => ( <FormItem className="flex flex-row items-center space-x-3 space-y-0 p-3 border rounded-md"> <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl> <FormLabel className="font-normal">Are you under medical treatment now?</FormLabel> </FormItem> )} />
            {watchMedicalTreatmentNow && <FormField control={form.control} name="q_medicalTreatmentCondition" render={({ field }) => ( <FormItem> <FormLabel>If so, what is the condition being treated?</FormLabel> <FormControl><Textarea {...field} value={field.value || ""} /></FormControl> <FormMessage /> </FormItem> )} />}

            <FormField control={form.control} name="q_seriousIllnessOperation" render={({ field }) => ( <FormItem className="flex flex-row items-center space-x-3 space-y-0 p-3 border rounded-md"> <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl> <FormLabel className="font-normal">Have you ever had serious illness or surgical operation?</FormLabel> </FormItem> )} />
            {watchSeriousIllnessOperation && <FormField control={form.control} name="q_seriousIllnessOperationDetails" render={({ field }) => ( <FormItem> <FormLabel>If so, what illness or surgical operation?</FormLabel> <FormControl><Textarea {...field} value={field.value || ""} /></FormControl> <FormMessage /> </FormItem> )} />}

            <FormField control={form.control} name="q_hospitalized" render={({ field }) => ( <FormItem className="flex flex-row items-center space-x-3 space-y-0 p-3 border rounded-md"> <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl> <FormLabel className="font-normal">Have you ever been hospitalized?</FormLabel> </FormItem> )} />
            {watchHospitalized && <FormField control={form.control} name="q_hospitalizedDetails" render={({ field }) => ( <FormItem> <FormLabel>If so, when and why?</FormLabel> <FormControl><Textarea {...field} value={field.value || ""} /></FormControl> <FormMessage /> </FormItem> )} />}

            <FormField control={form.control} name="q_takingMedication" render={({ field }) => ( <FormItem className="flex flex-row items-center space-x-3 space-y-0 p-3 border rounded-md"> <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl> <FormLabel className="font-normal">Are you taking any prescription / non-prescription medication?</FormLabel> </FormItem> )} />
            {watchTakingMedication && <FormField control={form.control} name="q_medicationDetails" render={({ field }) => ( <FormItem> <FormLabel>If so, please specify.</FormLabel> <FormControl><Textarea placeholder="List medications and dosages" {...field} value={field.value || ""} /></FormControl> <FormMessage /> </FormItem> )} />}

            <FormField control={form.control} name="q_useTobacco" render={({ field }) => ( <FormItem className="flex flex-row items-center space-x-3 space-y-0 p-3 border rounded-md"> <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl> <FormLabel className="font-normal">Do you use tobacco products?</FormLabel> </FormItem> )} />
            <FormField control={form.control} name="q_useDrugs" render={({ field }) => ( <FormItem className="flex flex-row items-center space-x-3 space-y-0 p-3 border rounded-md"> <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl> <FormLabel className="font-normal">Do you use alcohol, cocaine, or other dangerous drugs?</FormLabel> </FormItem> )} />

            <SubSectionTitle title="Allergies" />
            <FormDescription>Are you allergic to any of the following:</FormDescription>
            <div className="space-y-2">
              <FormField control={form.control} name="allergy_localAnaesthetic" render={({ field }) => ( <FormItem className="flex flex-row items-center space-x-3 space-y-0 p-2 border rounded-md"> <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl> <FormLabel className="font-normal">Local Anaesthetic (e.g., Lidocaine)</FormLabel> </FormItem> )} />
              <FormField control={form.control} name="allergy_penicillin" render={({ field }) => ( <FormItem className="flex flex-row items-center space-x-3 space-y-0 p-2 border rounded-md"> <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl> <FormLabel className="font-normal">Penicillin/Antibiotics</FormLabel> </FormItem> )} />
              <FormField control={form.control} name="allergy_aspirin" render={({ field }) => ( <FormItem className="flex flex-row items-center space-x-3 space-y-0 p-2 border rounded-md"> <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl> <FormLabel className="font-normal">Aspirin</FormLabel> </FormItem> )} />
              <FormField control={form.control} name="allergy_latex" render={({ field }) => ( <FormItem className="flex flex-row items-center space-x-3 space-y-0 p-2 border rounded-md"> <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl> <FormLabel className="font-normal">Latex</FormLabel> </FormItem> )} />
              <FormField control={form.control} name="allergy_other" render={({ field }) => ( <FormItem className="flex flex-row items-center space-x-3 space-y-0 p-2 border rounded-md"> <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl> <FormLabel className="font-normal">Other</FormLabel> </FormItem> )} />
              {watchAllergyOther && <FormField control={form.control} name="allergy_other_details" render={({ field }) => ( <FormItem> <FormLabel>Please specify other allergies:</FormLabel> <FormControl><Textarea {...field} value={field.value || ""} /></FormControl> <FormMessage /> </FormItem> )} />}
            </div>

            <SubSectionTitle title="Additional Medical Information" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField control={form.control} name="bleedingTime" render={({ field }) => ( <FormItem> <FormLabel>Bleeding Time</FormLabel> <FormControl><Input placeholder="e.g., Normal, Prolonged" {...field} value={field.value || ""} /></FormControl> <FormMessage /> </FormItem> )} />
              <FormField control={form.control} name="bloodType" render={({ field }) => (
                <FormItem>
                  <FormLabel>Blood Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ""}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select blood type" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {BLOOD_TYPES.map(type => (
                        <SelectItem key={type} value={type}>{type === 'other' ? 'Other' : type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              {watchBloodType === "other" && (
                 <FormField control={form.control} name="bloodTypeOther" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Please specify other blood type <span className="text-destructive">*</span></FormLabel>
                    <FormControl><Input {...field} placeholder="Specify blood type" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              )}
              <FormField control={form.control} name="bloodPressure" render={({ field }) => ( <FormItem> <FormLabel>Blood Pressure</FormLabel> <FormControl><Input placeholder="e.g., 120/80" {...field} value={field.value || ""} /></FormControl> <FormMessage /> </FormItem> )} />
            </div>

            <SubSectionTitle title="For Female Patients" />
            <FormField control={form.control} name="q_isPregnant" render={({ field }) => ( <FormItem className="flex flex-row items-center space-x-3 space-y-0 p-3 border rounded-md"> <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl> <FormLabel className="font-normal">Are you pregnant?</FormLabel> </FormItem> )} />
            <FormField control={form.control} name="q_isNursing" render={({ field }) => ( <FormItem className="flex flex-row items-center space-x-3 space-y-0 p-3 border rounded-md"> <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl> <FormLabel className="font-normal">Are you nursing?</FormLabel> </FormItem> )} />
            <FormField control={form.control} name="q_onBirthControl" render={({ field }) => ( <FormItem className="flex flex-row items-center space-x-3 space-y-0 p-3 border rounded-md"> <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl> <FormLabel className="font-normal">Are you taking birth control pills?</FormLabel> </FormItem> )} />

            <SubSectionTitle title="Conditions Checklist" />
            <FormDescription>Do you have or have you had any of the following? Check which apply.</FormDescription>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3">
              {conditionChecklistItems.map((item) => (
                <FormField
                  key={item.id}
                  control={form.control}
                  name={item.id}
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0 p-2 border rounded-md">
                      <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} id={`form-${item.id}`} /></FormControl>
                      <FormLabel htmlFor={`form-${item.id}`} className="font-normal cursor-pointer flex-grow">{item.label}</FormLabel>
                    </FormItem>
                  )}
                />
              ))}
            </div>
            {watchCondOthers && <FormField control={form.control} name="cond_others_details" render={({ field }) => ( <FormItem> <FormLabel>Please specify other conditions:</FormLabel> <FormControl><Textarea {...field} value={field.value || ""} /></FormControl> <FormMessage /> </FormItem> )} />}

            <Separator className="my-8" />
            <FormField control={form.control} name="reasonForVisit" render={({ field }) => ( <FormItem> <FormLabel>Primary Reason for This Visit / Chief Complaint <span className="text-destructive">*</span></FormLabel> <FormControl><Textarea placeholder="e.g., Routine check-up, toothache, etc." {...field} /></FormControl> <FormMessage /> </FormItem> )} />
            
            <Separator className="my-8" />
            <SectionTitle title="Patient Consent & Signature" />
            <div className="space-y-6 rounded-md border p-4 shadow-sm bg-card">
              <FormField
                control={form.control}
                name="consentGiven"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        id="consentGiven"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel htmlFor="consentGiven" className="font-medium cursor-pointer text-sm">
                        I hereby authorize MediTrack and its affiliated healthcare providers to collect, use, and disclose my personal and medical information as described in the Privacy Policy and for the purpose of providing medical care. I understand that my information will be kept confidential and used in accordance with applicable laws. <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormDescription className="text-xs">
                        You must agree to the terms to proceed.
                      </FormDescription>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="signature"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Signature (Type your full name as entered above) <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., John Michael Doe" {...field} />
                    </FormControl>
                    <FormDescription>
                      Typing your full name serves as your electronic signature. Ensure it matches the name provided in the "Patient Information Record" section.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" className="w-full mt-8" disabled={form.formState.isSubmitting}>
              <Save className="mr-2 h-4 w-4" />
              {form.formState.isSubmitting ? "Submitting..." : "Submit Information"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

    