import { useState, useRef, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { X, Upload, Loader } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import axios from "axios";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AddAdDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AddAdDialog({
  open,
  onOpenChange,
  onSuccess,
}: AddAdDialogProps) {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    text: "",
    link: "",
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please select a valid image file");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }

      setSelectedImage(file);
    }
  };

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];

      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please select a valid image file");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }

      setSelectedImage(file);
    }
  }, []);

  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const removeImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedImage) {
      toast.error("Please select an image");
      return;
    }

    if (!formData.text.trim()) {
      toast.error("Please enter ad text");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Creating ad...");

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("image", selectedImage);
      formDataToSend.append("text", formData.text);
      if (formData.link.trim()) {
        formDataToSend.append("link", formData.link);
      }

      const response = await axios.post(
        "https://api.techsavyhub.ng/api/admin/ads/store",
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.status === "success") {
        toast.success("Ad created successfully!", { id: toastId });
        setFormData({ text: "", link: "" });
        setSelectedImage(null);
        onSuccess();
      }
    } catch (error: any) {
      console.error("Error creating ad:", error);
      toast.error(error.response?.data?.message || "Failed to create ad", {
        id: toastId,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({ text: "", link: "" });
      setSelectedImage(null);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Ad</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="image">Ad Image (16:9 ratio recommended)</Label>
            <div
              onDrop={onDrop}
              onDragOver={onDragOver}
              className={cn(
                "border-2 border-dashed rounded-lg transition-colors",
                "hover:border-primary/50 hover:bg-primary/5",
                "focus-within:border-primary/50 focus-within:bg-primary/5"
              )}
            >
              <Card className="border-0">
                <CardContent className="flex flex-col items-center justify-center p-6">
                  {selectedImage ? (
                    <div className="w-full space-y-4">
                      <div className="aspect-video relative rounded-lg overflow-hidden bg-gray-100">
                        <img
                          src={URL.createObjectURL(selectedImage)}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          className="absolute top-2 right-2 h-6 w-6 rounded-full p-0"
                          onClick={removeImage}
                          disabled={loading}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                      <p className="text-sm text-gray-500 text-center">
                        {selectedImage.name}
                      </p>
                    </div>
                  ) : (
                    <>
                      <Upload className="size-8 text-gray-400 mb-2" />
                      <Input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        id="image"
                        disabled={loading}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleButtonClick}
                        disabled={loading}
                      >
                        Choose image
                      </Button>
                      <p className="text-sm text-gray-500 mt-2">
                        or drag and drop image here
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
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
                  Creating...
                </>
              ) : (
                "Create Ad"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
