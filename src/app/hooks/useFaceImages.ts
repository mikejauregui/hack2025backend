import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../lib/api";

export interface FaceImageRecord {
  id: string;
  imageData: string | null;
  isPrimary: boolean;
  matchCount?: number | null;
  uploadedAt?: string | null;
  lastUsedAt?: string | null;
  s3Key?: string | null;
}

export function useFaceImages() {
  const { token } = useAuth();
  const [faceImages, setFaceImages] = useState<FaceImageRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(!!token);
  const [error, setError] = useState<string | null>(null);
  const [refreshIndex, setRefreshIndex] = useState(0);

  useEffect(() => {
    if (!token) {
      setFaceImages([]);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchFaces() {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get("/users/face-images");
        const payload = await res.json().catch(() => null);
        if (!res.ok) {
          throw new Error(payload?.error || "Failed to load face images");
        }

        if (cancelled) return;

        const normalized: FaceImageRecord[] = Array.isArray(payload?.faceImages)
          ? payload.faceImages.map((face: any, index: number) => ({
              id: face.id ?? `face-${index}`,
              imageData: face.image_data ?? face.imageData ?? null,
              isPrimary: Boolean(face.is_primary ?? face.isPrimary),
              matchCount: face.match_count ?? face.matchCount ?? null,
              uploadedAt: face.uploaded_at ?? face.uploadedAt ?? null,
              lastUsedAt: face.last_used_at ?? face.lastUsedAt ?? null,
              s3Key: face.s3_key ?? face.s3Key ?? null,
            }))
          : [];

        setFaceImages(normalized);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }
        console.error("Face images fetch error", err);
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load face images",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchFaces();

    return () => {
      cancelled = true;
    };
  }, [token, refreshIndex]);

  const refetch = () => setRefreshIndex((index) => index + 1);

  return { faceImages, loading, error, refetch };
}
