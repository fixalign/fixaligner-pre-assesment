"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  User,
  Activity,
  FileText,
  CheckCircle2,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ModeToggle } from "@/components/mode-toggle";

export default function AssessmentPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const router = useRouter();
  const [patient, setPatient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isNotEligible, setIsNotEligible] = useState(false);
  const [steps, setSteps] = useState("");
  const [notes, setNotes] = useState("");
  const [patientId, setPatientId] = useState<string | null>(null);

  // Unwrap params (handle both Promise and direct object)
  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await Promise.resolve(params);
      setPatientId(resolvedParams.id);
    };
    resolveParams();
  }, [params]);

  // Fetch patient data when patientId is available
  useEffect(() => {
    if (!patientId) return;

    const fetchPatient = async () => {
      try {
        console.log("Fetching patient with ID:", patientId);
        const response = await fetch(`/api/patients/${patientId}`);
        console.log("Response status:", response.status);
        if (response.ok) {
          const data = await response.json();
          console.log("Patient data:", data);
          setPatient(data);
          setIsNotEligible(!data.is_eligible);
          setSteps(data.estimated_steps?.toString() || "");
          setNotes(data.notes || "");
        } else {
          console.error("Patient not found, status:", response.status);
        }
      } catch (error) {
        console.error("Error fetching patient:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPatient();
  }, [patientId]);

  const handleEligibilityChange = (checked: boolean) => {
    setIsNotEligible(checked);
    if (checked) {
      setSteps("");
    }
  };

  const handleSubmit = async () => {
    if (!patientId) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/patients/${patientId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          is_eligible: !isNotEligible,
          estimated_steps: steps ? parseInt(steps) : null,
          notes: notes,
          assessed_at: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        alert("Assessment submitted successfully!");
        // Redirect back to the dashboard
        router.push("/");
      } else {
        alert("Failed to submit assessment");
      }
    } catch (error) {
      console.error("Error submitting assessment:", error);
      alert("Error submitting assessment");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Patient Not Found</CardTitle>
            <CardDescription>
              The patient youre looking for doesnt exist.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Link href="/">
              <Button>Back to Dashboard</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:bg-slate-950/95 dark:border-slate-800">
        <div className="container mx-auto flex h-14 items-center">
          <div className="mr-4 hidden md:flex">
            <Link href="/" className="mr-6 flex items-center space-x-2">
              <Activity className="h-6 w-6 text-blue-600" />
              <span className="hidden font-bold sm:inline-block">
                FixAligner Admin
              </span>
            </Link>
          </div>
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <div className="w-full flex-1 md:w-auto md:flex-none"></div>
            <nav className="flex items-center gap-2">
              <ModeToggle />
              <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-sm font-medium text-slate-600">
                AD
              </div>
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-6 md:py-10">
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" className="pl-0 hover:pl-2 transition-all">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
          {/* Left Column: Patient Info & Video (4 cols on lg) */}
          <div className="md:col-span-2 lg:col-span-4 space-y-6">
            <Card className="overflow-hidden border-slate-200 dark:border-slate-800 shadow-sm">
              <CardHeader className="bg-slate-100/50 dark:bg-slate-900/50 pb-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-2xl flex items-center gap-2">
                      <User className="h-5 w-5 text-slate-500" />
                      {patient.name}
                    </CardTitle>
                    <CardDescription>
                      Patient ID: {patient.id}
                      {patient.email && ` • ${patient.email}`}
                      {patient.phone && ` • ${patient.phone}`}
                    </CardDescription>
                  </div>
                  <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium border border-green-200">
                    Active Assessment
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="aspect-video w-full bg-black relative flex items-center justify-center group">
                  {/* Video Player */}
                  {patient.video_url ? (
                    <video
                      className="w-full h-full object-cover"
                      controls
                      src={patient.video_url}
                      poster="https://placehold.co/600x400/black/white?text=Patient+Video+Preview"
                    >
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                    <div className="text-white text-center">
                      <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p>No video uploaded</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Assessment Form (3 cols on lg) */}
          <div className="md:col-span-2 lg:col-span-3">
            <Card className="border-slate-200 dark:border-slate-800 shadow-md h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  Assessment
                </CardTitle>
                <CardDescription>
                  Complete the evaluation for {patient.name}.
                </CardDescription>
              </CardHeader>
              <Separator />
              <CardContent className="space-y-6 pt-6">
                {/* Eligibility Toggle */}
                <div className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                  <div className="space-y-0.5">
                    <Label className="text-base">Not Eligible</Label>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Patient is not a candidate for aligners.
                    </p>
                  </div>
                  <Switch
                    id="not-eligible"
                    checked={isNotEligible}
                    onCheckedChange={handleEligibilityChange}
                  />
                </div>

                <Separator className="my-4" />

                {/* Estimated Steps */}
                <div className="space-y-2">
                  <Label htmlFor="steps">Estimated Aligner Steps</Label>
                  <div className="relative">
                    <Input
                      id="steps"
                      type="number"
                      placeholder={isNotEligible ? "Not eligible" : "e.g. 24"}
                      className="pl-10 text-lg font-medium"
                      disabled={isNotEligible}
                      value={steps}
                      onChange={(e) => setSteps(e.target.value)}
                    />
                    <Activity
                      className={`absolute left-3 top-3 h-4 w-4 ${
                        isNotEligible ? "text-slate-300" : "text-slate-400"
                      }`}
                    />
                  </div>
                  <p className="text-xs text-slate-500">
                    Enter the total estimated number of steps for treatment.
                  </p>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Add any specific instructions or observations..."
                    className="min-h-[120px] resize-none"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-3 bg-slate-50/50 dark:bg-slate-900/50 p-6">
                <Button
                  className="w-full text-lg h-12"
                  size="lg"
                  onClick={handleSubmit}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-5 w-5" />
                      Submit Assessment
                    </>
                  )}
                </Button>
                <p className="text-xs text-center text-slate-500">
                  Assessment will be saved and sent for review.
                </p>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
