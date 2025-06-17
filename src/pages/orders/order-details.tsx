import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Package,
  Calendar,
  MapPin,
  AlertCircle,
} from "lucide-react";
import axios from "axios";
import { useAuth } from "@/context/auth-context";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatDate } from "@/lib/utils";

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
}

interface Order {
  id: number;
  user_id: number;
  order_number: string;
  total_amount: string;
  status: string;
  shipping_address: string;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
}

export function OrderDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return "default";
      case "processing":
        return "secondary";
      case "shipped":
        return "outline";
      case "pending":
        return "secondary";
      default:
        return "outline";
    }
  };

  if (loading) {
    return <OrderDetailsSkeleton />;
  }

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Failed to Load Order
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              {error ||
                "An unexpected error occurred while loading the order details."}
            </p>
          </div>

          <Button
            onClick={() => navigate("/dashboard/orders")}
            variant="outline"
          >
            Back to Orders
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between max-lg:flex-col max-lg:gap-4 max-lg:items-start">
        <div className="flex items-center gap-4">
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
              Order {order.order_number}
            </h1>
            <p className="text-sm text-muted-foreground">
              Placed on {formatDate(order.created_at)}
            </p>
          </div>
        </div>

        <Badge variant={getStatusVariant(order.status)} className="text-sm">
          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Order Items */}
        <Card>
          <CardHeader>
            <CardTitle>Order Items</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 p-4 border rounded-lg"
              >
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                  {item.product.images[0] ? (
                    <img
                      src={item.product.images[0]}
                      alt={item.product.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{item.product.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    Quantity: {item.quantity}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatCurrency(item.price)}</p>
                  <p className="text-sm text-muted-foreground">
                    Total: {formatCurrency(Number(item.price) * item.quantity)}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Order Information */}
        <div className="space-y-6">
          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{order.shipping_address}</p>
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(order.total_amount)}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Total</span>
                <span>{formatCurrency(order.total_amount)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Order Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Order Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Order Placed</p>
                <p className="font-medium">{formatDate(order.created_at)}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Last Updated</p>
                <p className="font-medium">{formatDate(order.updated_at)}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function OrderDetailsSkeleton() {
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
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-4 border rounded-lg"
              >
                <Skeleton className="h-16 w-16 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
