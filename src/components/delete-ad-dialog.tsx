import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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

interface DeleteAdDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ad: Ad | null;
  onSuccess: () => void;
}

export function DeleteAdDialog({
  open,
  onOpenChange,
  ad,
  onSuccess,
}: DeleteAdDialogProps) {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!ad) return;

    setLoading(true);
    const toastId = toast.loading("Deleting ad...");

    try {
      const response = await axios.delete(
        `https://api.techsavyhub.ng/api/admin/ads/delete/${ad.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.status === "success") {
        toast.success("Ad deleted successfully!", { id: toastId });
        onSuccess();
      }
    } catch (error: any) {
      console.error("Error deleting ad:", error);
      toast.error(error.response?.data?.message || "Failed to delete ad", {
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
    <AlertDialog open={open} onOpenChange={handleClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the ad "{ad.text}". This action cannot
            be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600 text-white"
          >
            {loading ? (
              <>
                <Loader className="mr-2 size-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete Ad"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
