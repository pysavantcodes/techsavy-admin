"use client";

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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
  ArrowLeft,
  Package,
  Calendar,
  MapPin,
  AlertCircle,
  CheckCircle,
  Plus,
  User,
  Mail,
  Phone,
  Clock,
  ShoppingBag,
  Truck,
} from "lucide-react";
import axios from "axios";
import { useAuth } from "@/context/auth-context";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatDate } from "@/lib/utils";

interface OrderItemAddon {
  price: string;
  option: string;
  addon_name: string;
}

interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  price: string;
  created_at: string;
  updated_at: string;
  product: {
    id: number;
    title: string;
    price: string;
    images: string[];
  };
  addons?: OrderItemAddon[];
}

interface ShippingAddress {
  id: number;
  city: string;
  state: string;
  address: string;
  country: string;
  user_id: string;
  zip_code: string;
  created_at: string;
  updated_at: string;
}

interface OrderUser {
  id: number;
  name: string;
  email: string;
  phone: string;
  email_verified_at: string;
  created_at: string;
  updated_at: string;
}

interface Order {
  id: number;
  user_id: number;
  order_number: string;
  total_amount: string;
  status: string;
  shipping_address: ShippingAddress;
  created_at: string;
  updated_at: string;
  user: OrderUser;
  items: OrderItem[];
}

export function OrderDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<string>("");

  const fetchOrder = async () => {
    try {
      const response = await axios.get(
        `https://api.techsavyhub.ng/api/admin/orders/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.status === "success") {
        setOrder(response.data.order);
      }
    } catch (error) {
      console.error("Error fetching order:", error);
      setError("Failed to fetch order details");
      toast.error("Failed to fetch order details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && id) {
      fetchOrder();
    }
  }, [token, id]);

  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return {
          variant: "default" as const,
          color: "bg-green-100 text-green-800 border-green-200",
          icon: CheckCircle,
        };
      case "processing":
        return {
          variant: "secondary" as const,
          color: "bg-blue-100 text-blue-800 border-blue-200",
          icon: Clock,
        };
      case "shipped":
        return {
          variant: "outline" as const,
          color: "bg-purple-100 text-purple-800 border-purple-200",
          icon: Truck,
        };
      case "pending":
        return {
          variant: "secondary" as const,
          color: "bg-yellow-100 text-yellow-800 border-yellow-200",
          icon: Clock,
        };
      default:
        return {
          variant: "outline" as const,
          color: "bg-gray-100 text-gray-800 border-gray-200",
          icon: Package,
        };
    }
  };

  const calculateItemTotal = (item: OrderItem) => {
    const basePrice = Number(item.price);
    const addonsTotal =
      item.addons?.reduce((sum, addon) => sum + Number(addon.price), 0) || 0;
    const itemTotal = (basePrice + addonsTotal) * item.quantity;
    return itemTotal;
  };

  const formatAddress = (shippingAddress: ShippingAddress) => {
    const parts = [
      shippingAddress.address,
      shippingAddress.city,
      shippingAddress.state,
      shippingAddress.zip_code,
      shippingAddress.country,
    ].filter(Boolean);

    return parts.join(", ");
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (!order) return;

    const toastId = toast.loading("Updating order status...");
    try {
      const formData = new FormData();
      formData.append("order_id", order.id.toString());
      formData.append("status", newStatus);

      const response = await axios.post(
        "https://api.techsavyhub.ng/api/admin/orders/update/status",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.status === "success") {
        toast.success("Order status updated successfully!", { id: toastId });
        fetchOrder(); // Refresh the order data
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("Failed to update order status", { id: toastId });
    }
  };

  const handleStatusUpdateClick = (newStatus: string) => {
    setPendingStatus(newStatus);
    setShowStatusDialog(true);
  };

  const handleStatusUpdateConfirm = () => {
    handleStatusUpdate(pendingStatus);
    setShowStatusDialog(false);
    setPendingStatus("");
  };

  const handleStatusUpdateCancel = () => {
    setShowStatusDialog(false);
    setPendingStatus("");
  };

  if (loading) {
    return <OrderDetailsSkeleton />;
  }

  if (error || !order) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-6 max-w-md">
          <div className="mx-auto w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center">
            <AlertCircle className="h-10 w-10 text-red-500" />
          </div>
          <div className="space-y-3">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              Order Not Found
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {error ||
                "The order you're looking for doesn't exist or has been removed."}
            </p>
          </div>
          <Button
            onClick={() => navigate("/dashboard/orders")}
            variant="outline"
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Orders
          </Button>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(order.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="container mx-auto space-y-8">
      {/* Enhanced Header */}
      <div className="">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4 flex-wrap">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate(-1)}
              className="rounded-full hover:bg-white/50"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="space-y-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl max-md:text-xl font-bold text-gray-900 dark:text-gray-100">
                  #{order.order_number}
                </h1>
                <div
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border ${statusConfig.color}`}
                >
                  <StatusIcon className="h-4 w-4 max-md:h-3 max-md:w-3" />
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4" />
                Placed on {formatDate(order.created_at)}
              </p>
            </div>
          </div>
          <div className="text-right max-md:text-left">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Total Amount
            </p>
            <p className="text-2xl font-bold text-atlantis-800">
              {formatCurrency(order.total_amount)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Order Items - Takes up 2 columns */}
        <div className="lg:col-span-2">
          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl max-md:text-base">
                <ShoppingBag className="h-5 w-5 max-md:h-4 max-md:w-4" />
                Order Items ({order.items.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {order.items.map((item, index) => (
                <div key={item.id}>
                  <div className="border-b pb-5 space-y-4">
                    {/* Product Info */}
                    <div className="flex items-start max-md:flex-col flex-wrap gap-4">
                      <div className="w-20 h-20 rounded-xl overflow-hidden bg-white shadow-sm flex-shrink-0">
                        {item.product.images[0] ? (
                          <img
                            src={item.product.images[0] || "/placeholder.svg"}
                            alt={item.product.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100">
                            <Package className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg text-atlantis-800 dark:text-gray-100 mb-2">
                          {item.product.title}
                        </h3>
                        <div className="text-sm">
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">
                              Unit Price:
                            </span>
                            <span className="ml-2 font-medium">
                              {formatCurrency(item.price)}
                            </span>
                          </div>
                        </div>
                        <div className="text-sm">
                          <span className="text-gray-600 dark:text-gray-400">
                            Quantity:
                          </span>
                          <span className="ml-2 font-medium">
                            {item.quantity}
                          </span>
                        </div>
                      </div>
                      <div className="text-right max-md:text-left">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Item Total
                        </p>
                        <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                          {formatCurrency(calculateItemTotal(item))}
                        </p>
                      </div>
                    </div>

                    {/* Addons */}
                    {item.addons && item.addons.length > 0 && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                          <Plus className="h-4 w-4" />
                          Add-ons ({item.addons.length})
                        </div>
                        <div className="grid gap-2">
                          {item.addons.map((addon, addonIndex) => (
                            <div
                              key={addonIndex}
                              className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border"
                            >
                              <div className="flex items-center gap-3">
                                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                                <div>
                                  <span className="font-medium text-gray-900 dark:text-gray-100">
                                    {addon.addon_name}
                                  </span>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {addon.option}
                                  </p>
                                </div>
                              </div>
                              <span className="font-semibold text-green-600">
                                +{formatCurrency(addon.price)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  {index < order.items.length - 1 && (
                    <Separator className="my-6" />
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Order Information Sidebar */}
        <div className="space-y-6">
          {/* Customer Information */}
          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 max-md:w-8 max-md:h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 max-md:h-4 max-md:w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="font-semibold max-md:text-sm">
                      {order.user.name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Full Name
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 max-md:w-8 max-md:h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                    <Mail className="h-5 w-5 max-md:h-4 max-md:w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="font-medium max-md:text-sm">
                      {order.user.email}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Email
                    </p>
                  </div>
                </div>
                {order.user.phone && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 max-md:w-8 max-md:h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                      <Phone className="h-5 w-5 max-md:h-4 max-md:w-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {order.user.phone}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Phone
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                <p className="text-gray-900 dark:text-gray-100 leading-relaxed">
                  {formatAddress(order.shipping_address)}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Status Update */}
          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <StatusIcon className="h-5 w-5" />
                Update Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => handleStatusUpdateClick("processing")}
                  disabled={
                    order.status === "pending" ||
                    order.status === "processing" ||
                    order.status === "shipped" ||
                    order.status === "delivered"
                  }
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Mark as Processing
                  {order.status === "processing" && (
                    <CheckCircle className="h-4 w-4 ml-auto text-green-600" />
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => handleStatusUpdateClick("shipped")}
                  disabled={
                    order.status === "pending" ||
                    order.status === "shipped" ||
                    order.status === "delivered"
                  }
                >
                  <Truck className="h-4 w-4 mr-2" />
                  Mark as Shipped
                  {order.status === "shipped" && (
                    <CheckCircle className="h-4 w-4 ml-auto text-green-600" />
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => handleStatusUpdateClick("delivered")}
                  disabled={
                    order.status === "pending" || order.status === "delivered"
                  }
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark as Delivered
                  {order.status === "delivered" && (
                    <CheckCircle className="h-4 w-4 ml-auto text-green-600" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Order Timeline */}
          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      Order Placed
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {formatDate(order.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Status Update Confirmation Dialog */}
      <AlertDialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Status Update</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to update the order status to{" "}
              <span className="font-semibold capitalize">{pendingStatus}</span>?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleStatusUpdateCancel}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleStatusUpdateConfirm}
              className="bg-atlantis-600 hover:bg-atlantis-700 focus:ring-atlantis-600 text-white"
            >
              Update Status
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function OrderDetailsSkeleton() {
  return (
    <div className="container mx-auto space-y-8">
      {/* Header Skeleton */}
      <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2"></div>
          </div>
          <div className="text-right space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-8 w-24" />
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Order Items Skeleton */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent className="space-y-6">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-6 space-y-4"
                >
                  <div className="flex items-start gap-4">
                    <Skeleton className="h-20 w-20 rounded-xl" />
                    <div className="flex-1 space-y-3">
                      {/* <Skeleton className="h-6 w-64" /> */}
                      <div className="grid grid-cols-2 gap-4">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-28" />
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-6 w-20" />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Skeleton */}
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-12 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
