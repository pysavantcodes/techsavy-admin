"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Upload, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/auth-context";
import axios from "axios";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface Category {
  id: number;
  name: string;
  slug: string;
  status: number;
  created_at: string;
  updated_at: string;
}

export function AddProduct() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [selectedCondition, setSelectedCondition] = useState("new");
  const [formData, setFormData] = useState({
    title: "",
    price: "",
    category_id: "",
    sku: "",
    quantity: "",
    description: "",
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(
        "https://api.techsavyhub.ng/api/admin/categories",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.status === "success") {
        setCategories(response.data.categories);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to fetch categories");
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files);
      setSelectedImages((prev) => [...prev, ...newImages]);
    }
  };

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.dataTransfer.files) {
      const newImages = Array.from(e.dataTransfer.files).filter((file) =>
        file.type.startsWith("image/")
      );
      setSelectedImages((prev) => [...prev, ...newImages]);
    }
  }, []);

  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const toastId = toast.loading("Creating product...");

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("price", formData.price);
      formDataToSend.append("category_id", formData.category_id);
      formDataToSend.append("sku", formData.sku);
      formDataToSend.append("quantity", formData.quantity);
      formDataToSend.append("condition", selectedCondition);
      formDataToSend.append("description", formData.description);

      selectedImages.forEach((image, index) => {
        formDataToSend.append(`images[${index}]`, image);
      });

      const response = await axios.post(
        "https://api.techsavyhub.ng/api/admin/products/create",
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.status === "success") {
        toast.success("Product created successfully!", { id: toastId });
        navigate("/dashboard/products");
      }
    } catch (error) {
      console.error("Error creating product:", error);
      toast.error("Failed to create product. Please try again.", {
        id: toastId,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate("/dashboard/products")}
        >
          <ArrowLeft />
        </Button>
        <h1 className="text-2xl font-bold text-atlantis-800">Add Product</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              placeholder="Product title"
              value={formData.title}
              onChange={handleInputChange}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Price</Label>
            <Input
              id="price"
              name="price"
              placeholder="0.00"
              type="number"
              value={formData.price}
              onChange={handleInputChange}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category_id">Category</Label>
            <Select
              value={formData.category_id}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, category_id: value }))
              }
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sku">SKU</Label>
            <Input
              id="sku"
              name="sku"
              placeholder="Product SKU"
              value={formData.sku}
              onChange={handleInputChange}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Product description"
              className="min-h-32"
              value={formData.description}
              onChange={handleInputChange}
              required
              disabled={loading}
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="quantity">Available quantity</Label>
            <Input
              id="quantity"
              name="quantity"
              placeholder="0"
              type="number"
              value={formData.quantity}
              onChange={handleInputChange}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label>Images</Label>
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
                  <Upload className="size-8 text-gray-400 mb-2" />
                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="hidden"
                    id="images"
                    disabled={loading}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleButtonClick}
                    disabled={loading}
                  >
                    Choose product images
                  </Button>
                  <p className="text-sm text-gray-500 mt-2">
                    or drag and drop images here
                  </p>
                </CardContent>
              </Card>
            </div>

            {selectedImages.length > 0 && (
              <div className="flex gap-2 mt-10 flex-wrap">
                {selectedImages.map((image, index) => (
                  <div key={index} className="relative">
                    <div className="w-24 h-24 rounded border-2 overflow-hidden">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                      onClick={() => removeImage(index)}
                      disabled={loading}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Condition</Label>
            <div className="flex gap-2">
              {["new", "refurbished", "old"].map((condition) => (
                <Badge
                  key={condition}
                  variant={
                    selectedCondition === condition ? "default" : "outline"
                  }
                  className="cursor-pointer"
                  onClick={() => setSelectedCondition(condition)}
                >
                  {condition.charAt(0).toUpperCase() + condition.slice(1)}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Button type="submit" className="bg-primary" disabled={loading}>
        {loading ? "Creating Product..." : "Save Product"}
      </Button>
    </form>
  );
}
