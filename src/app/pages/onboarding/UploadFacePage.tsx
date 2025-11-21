import { Camera, UploadCloud } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { api } from "../../lib/api";

export default function UploadFacePage() {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [, navigate] = useLocation();

  const triggerFileSelect = () => {
    const input = document.getElementById(
      "face-upload",
    ) as HTMLInputElement | null;
    input?.click();
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setLoading(true);
    const file = e.target.files[0];
    if (!file) {
      setLoading(false);
      return;
    }
    setPreview(URL.createObjectURL(file));

    const formData = new FormData();
    formData.append("face", file);
    formData.append("is_primary", "true");

    try {
      const res = await api.post("/users/upload-face", formData);
      if (res.ok) {
        navigate("/onboarding/wallet");
      } else {
        alert("Upload failed");
      }
    } catch (err) {
      console.error("Face upload failed", err);
      alert("Error uploading");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#fde6ee,#fff)] px-4 py-10">
      <Card className="mx-auto flex w-full max-w-4xl flex-col gap-10 rounded-4xl border-cerise-red-100 bg-white/90 p-10 shadow-[0_20px_60px_rgba(133,30,49,0.08)]">
        <header className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cerise-red-400">
            Step 2 of 4
          </p>
          <h1 className="text-3xl font-semibold text-cerise-red-900">
            Upload your face
          </h1>
          <p className="text-sm text-cerise-red-600">
            Center your face, remove glasses, and capture front lighting for the
            best match rate.
          </p>
        </header>

        <label
          htmlFor="face-upload"
          className="cursor-pointer rounded-3xl border border-dashed border-cerise-red-200 bg-cerise-red-50/50 p-8 text-center transition hover:border-cerise-red-400"
        >
          <input
            id="face-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleUpload}
            disabled={loading}
          />
          {preview ? (
            <div className="mx-auto max-w-xs overflow-hidden rounded-3xl border border-cerise-red-200">
              <img
                src={preview}
                alt="Preview"
                className="w-full object-cover"
              />
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <UploadCloud className="size-10 text-cerise-red-500" />
              <div className="space-y-1 text-sm text-cerise-red-700">
                <p className="text-base font-semibold text-cerise-red-900">
                  Drag a photo or click to upload
                </p>
                <p>PNG or JPG · Max 5MB</p>
              </div>
              <div className="flex items-center justify-center gap-2 text-xs text-cerise-red-500">
                {[1, 2, 3].map((slot) => (
                  <span
                    key={slot}
                    className="flex size-12 items-center justify-center rounded-2xl border border-cerise-red-100 bg-white"
                  >
                    #{slot}
                  </span>
                ))}
              </div>
            </div>
          )}
        </label>

        <div className="grid gap-4 rounded-3xl bg-cerise-red-50/80 p-6 text-sm text-cerise-red-700 lg:grid-cols-2">
          <div className="flex items-start gap-3">
            <Camera className="mt-1 size-4 text-cerise-red-500" />
            <p>
              Good lighting and neutral background improve match scores by 30%.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="mt-1 size-3 rounded-full bg-cerise-red-500" />
            <p>
              We'll auto-run liveness checks and securely store the biometric
              template.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 lg:flex-row">
          <Button
            disabled={loading}
            onClick={triggerFileSelect}
            className="flex-1 rounded-2xl py-6 text-base font-semibold"
          >
            {loading ? "Uploading..." : "Continue"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="rounded-2xl text-cerise-red-700"
            onClick={() => navigate("/onboarding/wallet")}
          >
            I'll do this later
          </Button>
        </div>
      </Card>
    </div>
  );
}
