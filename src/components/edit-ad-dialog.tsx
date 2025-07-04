import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import axios from "axios";
import { toast } from "sonner";

interface Ad {
  id: number;
  image: string;
  text: string;
  link?: string;
  created_at: string;
  updated_at: string;
  image_url: string;
}

interface EditAdDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ad: Ad | null;
  onSuccess: () => void;
}

export function EditAdDialog({
  open,
  onOpenChange,
  ad,
  onSuccess,
}: EditAdDialogProps) {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    text: "",
    link: "",
  });

  useEffect(() => {
    if (ad) {
      setFormData({
        text: ad.text || "",
        link: ad.link || "",
      });
    }
  }, [ad]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!ad) return;

    if (!formData.text.trim()) {
      toast.error("Please enter ad text");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Updating ad...");

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("text", formData.text);
      if (formData.link.trim()) {
        formDataToSend.append("link", formData.link);
      }

      const response = await axios.post(
        `https://api.techsavyhub.ng/api/admin/ads/update/${ad.id}`,
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.status === "success") {
        toast.success("Ad updated successfully!", { id: toastId });
        onSuccess();
      }
    } catch (error: any) {
      console.error("Error updating ad:", error);
      toast.error(error.response?.data?.message || "Failed to update ad", {
        id: toastId,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onOpenChange(false);
    }
  };

  if (!ad) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Ad</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Current Image</Label>
            <div className="aspect-video relative rounded-lg overflow-hidden bg-gray-100">
              {ad.image_url ? (
                <img
                  src={ad.image_url}
                  alt={ad.text}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full">
                  <p className="text-sm text-gray-500">No image available</p>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500">
              Note: Image cannot be changed. Create a new ad to use a different
              image.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="text">Ad Text</Label>
            <Input
              id="text"
              name="text"
              placeholder="Enter ad text"
              value={formData.text}
              onChange={handleInputChange}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="link">Link (Optional)</Label>
            <Input
              id="link"
              name="link"
              type="url"
              placeholder="https://example.com"
              value={formData.link}
              onChange={handleInputChange}
              disabled={loading}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader className="mr-2 size-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Ad"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
