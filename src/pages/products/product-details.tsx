"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Package,
  Calendar,
  Tag,
  AlertCircle,
  ImageOff,
} from "lucide-react";
import axios from "axios";
import { useAuth } from "@/context/auth-context";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatDate } from "@/lib/utils";

interface ProductCategory {
  id: number;
  name: string;
}

interface Product {
  id: number;
  title: string;
  price: string;
  sku: string;
  description: string;
  quantity: number;
  condition: string;
  images: string[];
  category: ProductCategory;
  created_at: string;
  updated_at: string;
}

interface ApiResponse {
  status: string;
  product: Product;
  message?: string;
}

type LoadingState = "idle" | "loading" | "success" | "error";

export function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [loadingState, setLoadingState] = useState<LoadingState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [imageLoadErrors, setImageLoadErrors] = useState<Set<number>>(
    new Set()
  );

  const fetchProduct = useCallback(async () => {
    if (!token || !id) return;

    setLoadingState("loading");
    setError(null);

    try {
      const response = await axios.get<ApiResponse>(
        `https://api.techsavyhub.ng/api/admin/products/show/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          timeout: 10000, // 10 second timeout
        }
      );

      if (response.data.status === "success" && response.data.product) {
        setProduct(response.data.product);
        setLoadingState("success");
      } else {
        throw new Error(response.data.message || "Failed to fetch product");
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      setError(
        axios.isAxiosError(error)
          ? error.response?.data?.message ||
              error.message ||
              "Network error occurred"
          : "An unexpected error occurred"
      );
      setLoadingState("error");
    }
  }, [token, id]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  const handleImageError = useCallback((index: number) => {
    setImageLoadErrors((prev) => new Set(prev).add(index));
  }, []);

  const handleEditProduct = useCallback(() => {
    if (product) {
      navigate(`/dashboard/products/edit/${product.id}`);
    }
  }, [navigate, product]);

  const handleDeleteProduct = useCallback(() => {
    if (product) {
      console.log("Delete product:", product.id);
    }
  }, [product]);

  const handleRetry = useCallback(() => {
    fetchProduct();
  }, [fetchProduct]);

  if (loadingState === "loading") {
    return <ProductDetailsSkeleton />;
  }

  if (loadingState === "error") {
    return (
      <ErrorState
        error={error}
        onRetry={handleRetry}
        onBack={() => navigate("/dashboard/products")}
      />
    );
  }

  if (!product) {
    return <NotFoundState onBack={() => navigate("/dashboard/products")} />;
  }

  const hasImages = product.images && product.images.length > 0;
  const currentImage = hasImages ? product.images[selectedImageIndex] : null;
  const isInStock = product.quantity > 0;

  return (
    <div className="container mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between max-lg:flex-col max-lg:gap-4 max-lg:items-start">
        <div className="flex items-center gap-4 max-lg:flex-col max-lg:gap-4 max-lg:items-start">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {product.title}
            </h1>
            <p className="text-sm text-muted-foreground">
              Product ID: {product.id}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleEditProduct}
            className="gap-2 rounded-full"
          >
            <Edit className="h-4 w-4" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDeleteProduct}
            className="gap-2 rounded-full text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Product Images */}
        <Card className="!f-fit">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="aspect-square relative rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                {currentImage && !imageLoadErrors.has(selectedImageIndex) ? (
                  <img
                    src={currentImage || "/placeholder.svg"}
                    alt={product.title}
                    className="object-cover w-full h-full"
                    onError={() => handleImageError(selectedImageIndex)}
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full">
                    <div className="text-center">
                      <ImageOff className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500">
                        No image available
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {hasImages && product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`aspect-square relative rounded-lg overflow-hidden border-2 transition-colors ${
                        selectedImageIndex === index
                          ? "border-primary"
                          : "border-transparent hover:border-gray-300"
                      }`}
                    >
                      {!imageLoadErrors.has(index) ? (
                        <img
                          src={image || "/placeholder.svg"}
                          alt={`${product.title} ${index + 1}`}
                          className="object-cover w-full h-full"
                          onError={() => handleImageError(index)}
                        />
                      ) : (
                        <div className="flex items-center justify-center w-full h-full bg-gray-100 dark:bg-gray-800">
                          <ImageOff className="h-4 w-4 text-gray-400" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Product Information */}
        <div className="space-y-6">
          {/* Price and Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between max-lg:flex-col max-lg:gap-4 max-lg:items-start">
                <span className="text-3xl font-bold">
                  {formatCurrency(product.price)}
                </span>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={isInStock ? "default" : "destructive"}
                    className="gap-1"
                  >
                    <Package className="h-3 w-3" />
                    {isInStock
                      ? `${product.quantity} in stock`
                      : "Out of stock"}
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    <Tag className="h-3 w-3" />
                    {product.condition}
                  </Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">SKU</p>
                  <p className="font-mono font-medium">{product.sku}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Category</p>
                  <p className="font-medium">{product.category.name}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                {product.description || "No description available."}
              </p>
            </CardContent>
          </Card>

          {/* Product Details */}
          <Card>
            <CardHeader>
              <CardTitle>Product Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Created</p>
                    <p className="font-medium">
                      {formatDate(product.created_at)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Last Updated
                    </p>
                    <p className="font-medium">
                      {formatDate(product.updated_at)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Loading skeleton component
function ProductDetailsSkeleton() {
  return (
    <div className="container mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="p-6">
            <Skeleton className="aspect-square w-full rounded-lg" />
            <div className="grid grid-cols-4 gap-2 mt-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-lg" />
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-24" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Error state component
interface ErrorStateProps {
  error: string | null;
  onRetry: () => void;
  onBack: () => void;
}

function ErrorState({ error, onRetry, onBack }: ErrorStateProps) {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center space-y-6">
        <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
          <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Failed to Load Product
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            {error ||
              "An unexpected error occurred while loading the product details."}
          </p>
        </div>

        <div className="flex items-center justify-center gap-4">
          <Button onClick={onRetry} className="gap-2">
            Try Again
          </Button>
          <Button variant="outline" onClick={onBack}>
            Back to Products
          </Button>
        </div>
      </div>
    </div>
  );
}

// Not found state component
interface NotFoundStateProps {
  onBack: () => void;
}

function NotFoundState({ onBack }: NotFoundStateProps) {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center space-y-6">
        <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
          <Package className="h-8 w-8 text-gray-400" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Product Not Found
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            The product you're looking for doesn't exist or has been removed.
          </p>
        </div>

        <Button onClick={onBack} variant="outline">
          Back to Products
        </Button>
      </div>
    </div>
  );
}
