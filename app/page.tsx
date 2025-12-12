"use client";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Activity, ArrowRight, Search, Loader2, Plus } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { ModeToggle } from "@/components/mode-toggle";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface Patient {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  expo_token: string | null;
  video_url: string | null;
  is_eligible: boolean;
  estimated_steps: number | null;
  notes: string | null;
  assessed_at: string | null;
  created_at: string;
  updated_at: string;
}

export default function Home() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newPatient, setNewPatient] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await fetch("/api/patients");
      if (response.ok) {
        const data = await response.json();
        setPatients(data);
      }
    } catch (error) {
      console.error("Error fetching patients:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePatient = async () => {
    if (!newPatient.name.trim()) {
      alert("Please enter patient name");
      return;
    }

    setCreating(true);
    try {
      const response = await fetch("/api/patients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newPatient),
      });

      if (response.ok) {
        const patient = await response.json();
        setPatients([patient, ...patients]);
        setShowAddDialog(false);
        setNewPatient({ name: "", email: "", phone: "" });
      } else {
        alert("Failed to create patient");
      }
    } catch (error) {
      console.error("Error creating patient:", error);
      alert("Error creating patient");
    } finally {
      setCreating(false);
    }
  };

  const getStatus = (patient: Patient) => {
    if (patient.assessed_at) {
      return { label: "Completed", color: "bg-slate-100 text-slate-800" };
    } else if (patient.video_url) {
      return {
        label: "Pending Review",
        color: "bg-yellow-100 text-yellow-800",
      };
    } else {
      return { label: "Awaiting Video", color: "bg-blue-100 text-blue-800" };
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const filteredPatients = patients.filter(
    (patient) =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phone?.includes(searchTerm)
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:bg-slate-950/95 dark:border-slate-800">
        <div className="container mx-auto flex h-14 items-center">
          <div className="mr-4 hidden md:flex">
            <a className="mr-6 flex items-center space-x-2" href="/">
              <Activity className="h-6 w-6 text-blue-600" />
              <span className="hidden font-bold sm:inline-block">
                FixAligner Admin
              </span>
            </a>
          </div>
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <div className="w-full flex-1 md:w-auto md:flex-none">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search patients..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <nav className="flex items-center gap-2">
              <ModeToggle />
              <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-sm font-medium text-slate-600">
                AD
              </div>
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Patient Dashboard
            </h1>
            <p className="text-muted-foreground">
              Manage patient assessments and aligner plans.
            </p>
          </div>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Patient
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Patient</DialogTitle>
                <DialogDescription>
                  Create a new patient record for assessment.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    placeholder="Enter patient name"
                    value={newPatient.name}
                    onChange={(e) =>
                      setNewPatient({ ...newPatient, name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter email"
                    value={newPatient.email}
                    onChange={(e) =>
                      setNewPatient({ ...newPatient, email: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter phone number"
                    value={newPatient.phone}
                    onChange={(e) =>
                      setNewPatient({ ...newPatient, phone: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowAddDialog(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreatePatient} disabled={creating}>
                  {creating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Patient"
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="rounded-md border bg-white dark:bg-slate-900 shadow-sm">
            <Table>
              <TableCaption>
                {filteredPatients.length === 0
                  ? "No patients found."
                  : `Total: ${filteredPatients.length} patient(s)`}
              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Video</TableHead>
                  <TableHead>Date Added</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPatients.map((patient) => {
                  const status = getStatus(patient);
                  return (
                    <TableRow key={patient.id}>
                      <TableCell className="font-medium">
                        {patient.name}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {patient.email && (
                            <div className="text-slate-600">
                              {patient.email}
                            </div>
                          )}
                          {patient.phone && (
                            <div className="text-slate-500">
                              {patient.phone}
                            </div>
                          )}
                          {!patient.email && !patient.phone && (
                            <div className="text-slate-400">No contact</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {patient.video_url ? (
                          <span className="text-green-600 text-sm">
                            ✓ Uploaded
                          </span>
                        ) : (
                          <span className="text-slate-400 text-sm">
                            No video
                          </span>
                        )}
                      </TableCell>
                      <TableCell>{formatDate(patient.created_at)}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${status.color}`}
                        >
                          {status.label}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/assessment/${patient.id}`}>
                          <Button variant="ghost" size="sm">
                            View Assessment{" "}
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </main>
    </div>
  );
}
