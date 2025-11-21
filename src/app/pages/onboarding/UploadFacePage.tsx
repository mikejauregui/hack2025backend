import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { api } from "../../lib/api";

export default function UploadFacePage() {
  const [loading, setLoading] = useState(false);
  const [, navigate] = useLocation();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setLoading(true);
    
    const formData = new FormData();
    formData.append("face", e.target.files[0]);
    formData.append("is_primary", "true");

    try {
        const res = await api.post("/users/upload-face", formData);
        if (res.ok) {
            navigate("/onboarding/wallet");
        } else {
            alert("Upload failed");
        }
    } catch (err) {
        alert("Error uploading");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
            <CardTitle>Upload Your Face</CardTitle>
            <CardDescription>We need a photo for biometric payments.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
            <input type="file" accept="image/*" onChange={handleUpload} disabled={loading} />
            {loading && <p>Uploading...</p>}
            <div className="pt-4">
                <Button variant="ghost" onClick={() => navigate("/onboarding/wallet")}>Skip for now</Button>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
