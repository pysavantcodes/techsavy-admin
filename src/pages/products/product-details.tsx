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
  CheckCircle,
  Star,
  MessageSquare,
  ArrowDownUpIcon,
} from "lucide-react";
import axios from "axios";
import { useAuth } from "@/context/auth-context";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ProductCategory {
  id: number;
  name: string;
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

interface ReviewUser {
  id: number;
  name: string;
  email: string;
  phone: string;
  email_verified_at: string;
  created_at: string;
  updated_at: string;
}

interface Review {
  id: number;
  user_id: string;
  product_id: string;
  rating: string;
  comment: string;
  created_at: string;
  updated_at: string;
  user: ReviewUser;
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
  addons?: Addon[];
  is_deal?: boolean;
  discount_type?: string;
  discount_amount?: string;
  deal_expires_at?: string;
  reviews?: Review[];
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
  const [showFullDescription, setShowFullDescription] = useState(false);

  // Reviews state
  const [deleteReviewId, setDeleteReviewId] = useState<number | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDeleteProductDialog, setShowDeleteProductDialog] = useState(false);

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
    if (token) {
      fetchProduct();
    }
  }, [token]);

  const handleImageError = useCallback((index: number) => {
    setImageLoadErrors((prev) => new Set(prev).add(index));
  }, []);

  const handleEditProduct = useCallback(() => {
    if (product) {
      navigate(`/dashboard/products/edit/${product.id}`);
    }
  }, [navigate, product]);

  const handleDeleteProduct = useCallback(() => {
    setShowDeleteProductDialog(true);
  }, []);

  const confirmDeleteProduct = useCallback(async () => {
    if (!product || !token) return;

    const toastId = toast.loading("Deleting product...");

    try {
      const response = await axios.delete(
        `https://api.techsavyhub.ng/api/admin/products/delete/${product.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.status === "success") {
        toast.success("Product deleted successfully", { id: toastId });
        navigate("/dashboard/products");
      } else {
        throw new Error(response.data.message || "Failed to delete product");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error(
        axios.isAxiosError(error)
          ? error.response?.data?.message || "Failed to delete product"
          : "An unexpected error occurred",
        { id: toastId }
      );
    } finally {
      setShowDeleteProductDialog(false);
    }
  }, [product, token, navigate]);

  const handleRetry = useCallback(() => {
    fetchProduct();
  }, [fetchProduct]);

  const handleDeleteReview = useCallback((reviewId: number) => {
    setDeleteReviewId(reviewId);
    setShowDeleteDialog(true);
  }, []);

  const confirmDeleteReview = useCallback(async () => {
    if (!deleteReviewId || !token) return;

    const toastId = toast.loading("Deleting review...");

    try {
      const response = await axios.post(
        `https://api.techsavyhub.ng/api/admin/reviews/delete/${deleteReviewId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.status === "success") {
        toast.success("Review deleted successfully", { id: toastId });
        // Update the product's reviews by removing the deleted review
        setProduct((prev) =>
          prev
            ? {
                ...prev,
                reviews:
                  prev.reviews?.filter(
                    (review) => review.id !== deleteReviewId
                  ) || [],
              }
            : null
        );
      } else {
        throw new Error(response.data.message || "Failed to delete review");
      }
    } catch (error) {
      console.error("Error deleting review:", error);
      toast.error(
        axios.isAxiosError(error)
          ? error.response?.data?.message || "Failed to delete review"
          : "An unexpected error occurred",
        { id: toastId }
      );
    } finally {
      setShowDeleteDialog(false);
      setDeleteReviewId(null);
    }
  }, [deleteReviewId, token]);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const renderStars = (rating: string) => {
    const numRating = parseInt(rating);
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= numRating
                ? "text-yellow-400 fill-current"
                : "text-gray-300"
            }`}
          />
        ))}
        <span className="ml-1 text-sm text-gray-600">({rating})</span>
      </div>
    );
  };

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
  const hasAddons = product.addons && product.addons.length > 0;

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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 ">
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
              <div className="aspect-video relative rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
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
              <CardTitle className="flex items-center flex-wrap gap-2 justify-between max-lg:items-start">
                <div className="space-y-2">
                  <span className="text-3xl font-bold">
                    {formatCurrency(product.price)}
                  </span>
                  {product.is_deal && product.discount_amount && (
                    <div className="flex items-center gap-2">
                      <Badge variant="destructive" className="gap-1">
                        <Tag className="h-3 w-3" />
                        {product.discount_type === "percentage"
                          ? `${product.discount_amount}% OFF`
                          : `${formatCurrency(product.discount_amount)} OFF`}
                      </Badge>
                      {product.deal_expires_at && (
                        <Badge variant="outline" className="gap-1 text-xs">
                          <Calendar className="h-3 w-3" />
                          Deal Expires {formatDate(product.deal_expires_at)}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
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
                  {product.is_deal && (
                    <Badge
                      variant="secondary"
                      className="gap-1 bg-orange-100 text-orange-800 border-orange-200"
                    >
                      <Tag className="h-3 w-3" />
                      Deal
                    </Badge>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 max-lg:grid-cols-1 gap-4 text-sm">
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
              <div className="prose max-w-none text-sm">
                <div
                  className={`text-gray-600 text-sm ${
                    !showFullDescription ? "line-clamp-6" : ""
                  }`}
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
                {product.description.length > 300 && (
                  <button
                    onClick={() => setShowFullDescription(!showFullDescription)}
                    className="text-primary hover:text-primary/80 font-medium mt-2"
                  >
                    {showFullDescription ? "See less" : "See more"}
                  </button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Deal Information */}
          {product.is_deal && (
            <Card className="border-orange-200 bg-orange-50/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-800">
                  <Tag className="h-5 w-5" />
                  Deal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Tag className="h-4 w-4 text-orange-600" />
                    <div>
                      <p className="text-sm text-orange-700">Discount Type</p>
                      <p className="font-medium text-orange-800 capitalize">
                        {product.discount_type}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Tag className="h-4 w-4 text-orange-600" />
                    <div>
                      <p className="text-sm text-orange-700">Discount Amount</p>
                      <p className="font-medium text-orange-800">
                        {product.discount_type === "percentage"
                          ? `${product.discount_amount}%`
                          : formatCurrency(product.discount_amount || "0")}
                      </p>
                    </div>
                  </div>
                  {product.deal_expires_at && (
                    <div className="flex items-center gap-3 sm:col-span-2">
                      <Calendar className="h-4 w-4 text-orange-600" />
                      <div>
                        <p className="text-sm text-orange-700">Expires On</p>
                        <p className="font-medium text-orange-800">
                          {formatDate(product.deal_expires_at)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

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

      {/* Addons Section */}
      {hasAddons && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Product Addons
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6 grid max-lg:grid-cols-1 grid-cols-3 max-xl:grid-cols-2 gap-4">
              {product.addons!.map((addon, addonIndex) => (
                <div key={addonIndex} className="border rounded-lg p-4 !mt-0">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-medium">{addon.name}</h3>
                      {addon.is_required === "1" && (
                        <Badge variant="secondary" className="text-xs">
                          Required
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    {addon.options.map((option, optionIndex) => (
                      <div
                        key={optionIndex}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border flex-wrap gap-2"
                      >
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="font-medium">{option.option}</span>
                        </div>
                        <span className="font-semibold text-green-600 text-sm">
                          +{formatCurrency(option.price)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reviews Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Customer Reviews ({product.reviews?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {product.reviews && product.reviews.length > 0 ? (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <ArrowDownUpIcon className="size-4" />
                    </TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Review</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {product.reviews.map((review) => (
                    <TableRow key={review.id}>
                      <TableCell>
                        <Avatar className="size-8">
                          <AvatarFallback className="bg-blue-500 text-white text-xs">
                            {getInitials(review.user.name)}
                          </AvatarFallback>
                        </Avatar>
                      </TableCell>
                      <TableCell className="font-medium">
                        {review.user.name}
                      </TableCell>
                      <TableCell>{renderStars(review.rating)}</TableCell>
                      <TableCell className="max-w-md">
                        <p className="truncate">{review.comment}</p>
                      </TableCell>
                      <TableCell>{formatDate(review.created_at)}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteReview(review.id)}
                          className="text-red-600 hover:text-red-700 h-8 px-2"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-2" />
              <p className="text-gray-500">No reviews yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Review Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Review</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this review? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteReview}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete Review
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Product Confirmation Dialog */}
      <AlertDialog
        open={showDeleteProductDialog}
        onOpenChange={setShowDeleteProductDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{product?.title}"? This action
              cannot be undone and will also remove all associated reviews and
              data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteProduct}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete Product
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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
            <Skeleton className="aspect-video w-full rounded-lg" />
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
