"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Loader2, CheckCircle2, X } from "lucide-react";

interface VideoUploadProps {
  patientId: string;
  currentVideoUrl?: string;
  onUploadComplete: (url: string) => void;
}

export function VideoUpload({
  patientId,
  currentVideoUrl,
  onUploadComplete,
}: VideoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("video/")) {
      setError("Please select a valid video file");
      return;
    }

    // Validate file size (max 100MB)
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      setError("File size must be less than 100MB");
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(false);
    setUploadProgress(10);

    try {
      // Step 1: Upload video to storage
      const formData = new FormData();
      formData.append("file", file);
      formData.append("patientId", patientId);

      setUploadProgress(30);
      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload video");
      }

      const uploadData = await uploadResponse.json();
      setUploadProgress(70);

      // Step 2: Update patient record with video URL
      const updateResponse = await fetch(`/api/patients/${patientId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          video_url: uploadData.url,
        }),
      });

      if (!updateResponse.ok) {
        throw new Error("Failed to update patient record");
      }

      setUploadProgress(100);
      setSuccess(true);
      onUploadComplete(uploadData.url);

      // Reset after success
      setTimeout(() => {
        setSuccess(false);
        setUploadProgress(0);
      }, 3000);
    } catch (err) {
      setError("Failed to upload video. Please try again.");
      console.error("Upload error:", err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      <Label htmlFor="video-upload">Patient Video</Label>

      {currentVideoUrl && !success && (
        <div className="text-sm text-green-600 dark:text-green-400 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" />
          Video uploaded
        </div>
      )}

      <div className="flex items-center gap-2">
        <Input
          id="video-upload"
          type="file"
          accept="video/*"
          onChange={handleFileChange}
          disabled={uploading}
          className="cursor-pointer"
        />
        {uploading && (
          <div className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
            <span className="text-sm text-slate-600">{uploadProgress}%</span>
          </div>
        )}
      </div>

      {error && (
        <div className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
          <X className="h-4 w-4" />
          {error}
        </div>
      )}

      {success && (
        <div className="text-sm text-green-600 dark:text-green-400 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" />
          Video uploaded successfully!
        </div>
      )}

      <p className="text-xs text-slate-500">
        Upload a video file (max 100MB). Supported formats: MP4, MOV, AVI, WebM
      </p>
    </div>
  );
}
