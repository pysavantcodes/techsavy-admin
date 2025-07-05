"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Upload, ArrowLeft, Plus, Trash2 } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import { RichTextEditor } from "@/components/rich-text-editor";

interface Category {
  id: number;
  name: string;
  slug: string;
  status: number;
  created_at: string;
  updated_at: string;
}

interface AddonOption {
  option: string;
  price: string;
}

interface Addon {
  name: string;
  is_required: "1" | "0";
  options: AddonOption[];
}

export function AddProduct() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [selectedCondition, setSelectedCondition] = useState("new");
  const [addons, setAddons] = useState<Addon[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    price: "",
    category_id: "",
    sku: "",
    quantity: "",
    description: "",
    is_deal: "0",
    discount_type: "cash",
    discount_amount: "",
    deal_expires_at: "",
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
    if (token) {
      fetchCategories();
    }
  }, [token]);

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

  // Addon management functions
  const addAddon = () => {
    setAddons((prev) => [
      ...prev,
      {
        name: "",
        is_required: "0",
        options: [{ option: "", price: "" }],
      },
    ]);
  };

  const removeAddon = (addonIndex: number) => {
    setAddons((prev) => prev.filter((_, index) => index !== addonIndex));
  };

  const updateAddon = (addonIndex: number, field: keyof Addon, value: any) => {
    setAddons((prev) =>
      prev.map((addon, index) =>
        index === addonIndex ? { ...addon, [field]: value } : addon
      )
    );
  };

  const addOption = (addonIndex: number) => {
    setAddons((prev) =>
      prev.map((addon, index) =>
        index === addonIndex
          ? { ...addon, options: [...addon.options, { option: "", price: "" }] }
          : addon
      )
    );
  };

  const removeOption = (addonIndex: number, optionIndex: number) => {
    setAddons((prev) =>
      prev.map((addon, index) =>
        index === addonIndex
          ? {
              ...addon,
              options: addon.options.filter(
                (_, optIndex) => optIndex !== optionIndex
              ),
            }
          : addon
      )
    );
  };

  const updateOption = (
    addonIndex: number,
    optionIndex: number,
    field: keyof AddonOption,
    value: string
  ) => {
    setAddons((prev) =>
      prev.map((addon, index) =>
        index === addonIndex
          ? {
              ...addon,
              options: addon.options.map((option, optIndex) =>
                optIndex === optionIndex
                  ? { ...option, [field]: value }
                  : option
              ),
            }
          : addon
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate deal fields if it's a deal
    if (formData.is_deal === "1") {
      if (!formData.discount_amount.trim()) {
        toast.error("Please enter a discount amount for the deal");
        return;
      }
      if (!formData.deal_expires_at.trim()) {
        toast.error("Please select an expiration date for the deal");
        return;
      }
      // Validate discount amount is a valid number
      if (
        isNaN(Number(formData.discount_amount)) ||
        Number(formData.discount_amount) < 0
      ) {
        toast.error("Please enter a valid discount amount");
        return;
      }
      // Validate percentage discount doesn't exceed 100%
      if (
        formData.discount_type === "percentage" &&
        Number(formData.discount_amount) > 100
      ) {
        toast.error("Percentage discount cannot exceed 100%");
        return;
      }
    }

    // Validate addons if any exist
    if (addons.length > 0) {
      for (let i = 0; i < addons.length; i++) {
        const addon = addons[i];

        // Check if addon name is filled
        if (!addon.name.trim()) {
          toast.error(`Please fill in the name for Addon ${i + 1}`);
          return;
        }

        // Check if all options are filled
        for (let j = 0; j < addon.options.length; j++) {
          const option = addon.options[j];
          if (!option.option.trim()) {
            toast.error(
              `Please fill in the option name for Addon ${i + 1}, Option ${
                j + 1
              }`
            );
            return;
          }
          if (!option.price.trim()) {
            toast.error(
              `Please fill in the price for Addon ${i + 1}, Option ${j + 1}`
            );
            return;
          }
          // Validate price is a valid number
          if (isNaN(Number(option.price)) || Number(option.price) < 0) {
            toast.error(
              `Please enter a valid price for Addon ${i + 1}, Option ${j + 1}`
            );
            return;
          }
        }
      }
    }

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
      formDataToSend.append("is_deal", formData.is_deal);
      if (formData.is_deal === "1") {
        formDataToSend.append("discount_type", formData.discount_type);
        formDataToSend.append("discount_amount", formData.discount_amount);
        formDataToSend.append("deal_expires_at", formData.deal_expires_at);
      }

      selectedImages.forEach((image, index) => {
        formDataToSend.append(`images[${index}]`, image);
      });

      // Add addons data
      addons.forEach((addon, addonIndex) => {
        formDataToSend.append(`addons[${addonIndex}][name]`, addon.name);
        formDataToSend.append(
          `addons[${addonIndex}][is_required]`,
          addon.is_required
        );

        addon.options.forEach((option, optionIndex) => {
          formDataToSend.append(
            `addons[${addonIndex}][options][${optionIndex}][option]`,
            option.option
          );
          formDataToSend.append(
            `addons[${addonIndex}][options][${optionIndex}][price]`,
            option.price
          );
        });
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
      toast.error(
        axios.isAxiosError(error)
          ? error.response?.data?.message || "Failed to create product"
          : "An unexpected error occurred",
        { id: toastId }
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
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

        <Button type="submit" className="bg-primary" disabled={loading}>
          {loading ? "Creating Product..." : "Save Product"}
        </Button>
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
            <RichTextEditor
              value={formData.description}
              onChange={(value) =>
                setFormData((prev) => ({ ...prev, description: value }))
              }
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

          {/* Deal Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="is-deal"
                checked={formData.is_deal === "1"}
                onCheckedChange={(checked: boolean) =>
                  setFormData((prev) => ({
                    ...prev,
                    is_deal: checked ? "1" : "0",
                  }))
                }
                disabled={loading}
              />
              <Label htmlFor="is-deal" className="text-base font-medium">
                This is a deal
              </Label>
            </div>

            {formData.is_deal === "1" && (
              <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                <div className="space-y-2">
                  <Label htmlFor="discount_type">
                    Discount Type <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.discount_type}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, discount_type: value }))
                    }
                    disabled={loading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select discount type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage</SelectItem>
                      <SelectItem value="cash">Cash</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="discount_amount">
                    Discount Amount
                    {formData.discount_type === "percentage"
                      ? " (%)"
                      : " (₦)"}{" "}
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="discount_amount"
                    name="discount_amount"
                    placeholder={
                      formData.discount_type === "percentage" ? "10" : "1000"
                    }
                    type="number"
                    min="0"
                    max={
                      formData.discount_type === "percentage"
                        ? "100"
                        : undefined
                    }
                    step={
                      formData.discount_type === "percentage" ? "1" : "0.01"
                    }
                    value={formData.discount_amount}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deal_expires_at">
                    Deal Expires At <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="deal_expires_at"
                    name="deal_expires_at"
                    type="date"
                    value={formData.deal_expires_at}
                    onChange={handleInputChange}
                    disabled={loading}
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Addons Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h2 className="text-lg font-semibold text-gray-900">
            Product Addons
          </h2>
          <Button
            type="button"
            variant="outline"
            onClick={addAddon}
            disabled={loading}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Addon
          </Button>
        </div>

        {addons.length === 0 && (
          <Card>
            <CardContent className="p-6 text-center text-gray-500">
              <p className="text-sm">
                No addons added yet. Click "Add Addon" to get started.
              </p>
            </CardContent>
          </Card>
        )}

        <div className="grid max-lg:grid-cols-1 grid-cols-3 max-xl:grid-cols-2 gap-4">
          {addons.map((addon, addonIndex) => (
            <Card key={addonIndex} className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">
                    Addon {addonIndex + 1}
                  </h3>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeAddon(addonIndex)}
                    disabled={loading}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor={`addon-name-${addonIndex}`}>
                      Addon Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id={`addon-name-${addonIndex}`}
                      placeholder="e.g., Color, Size, Material, etc.  "
                      value={addon.name}
                      onChange={(e) =>
                        updateAddon(addonIndex, "name", e.target.value)
                      }
                      disabled={loading}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id={`addon-required-${addonIndex}`}
                        checked={addon.is_required === "1"}
                        onCheckedChange={(checked: boolean) =>
                          updateAddon(
                            addonIndex,
                            "is_required",
                            checked ? "1" : "0"
                          )
                        }
                        disabled={loading}
                      />
                      <Label htmlFor={`addon-required-${addonIndex}`}>
                        Required
                      </Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>
                      Options <span className="text-red-500">*</span>
                    </Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addOption(addonIndex)}
                      disabled={loading}
                      className="gap-2"
                    >
                      <Plus className="h-3 w-3" />
                      Add Option
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500">
                    Each addon must have at least one option with a name and
                    price.
                  </p>

                  {addon.options.map((option, optionIndex) => (
                    <div
                      key={optionIndex}
                      className="flex items-center gap-4 p-4 border rounded-lg"
                    >
                      <div className="flex-1 space-y-2">
                        <Label htmlFor={`option-${addonIndex}-${optionIndex}`}>
                          Option Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id={`option-${addonIndex}-${optionIndex}`}
                          placeholder="e.g., Red, Large, Plastic"
                          value={option.option}
                          onChange={(e) =>
                            updateOption(
                              addonIndex,
                              optionIndex,
                              "option",
                              e.target.value
                            )
                          }
                          disabled={loading}
                          required
                        />
                      </div>
                      <div className="flex-1 space-y-2">
                        <Label htmlFor={`price-${addonIndex}-${optionIndex}`}>
                          Price <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id={`price-${addonIndex}-${optionIndex}`}
                          placeholder="0.00"
                          type="number"
                          min="0"
                          step="0.01"
                          value={option.price}
                          onChange={(e) =>
                            updateOption(
                              addonIndex,
                              optionIndex,
                              "price",
                              e.target.value
                            )
                          }
                          disabled={loading}
                          required
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeOption(addonIndex, optionIndex)}
                        disabled={loading || addon.options.length === 1}
                        className="text-red-600 hover:text-red-700 mt-6"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </form>
  );
}
