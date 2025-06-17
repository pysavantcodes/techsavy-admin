import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import axios from "axios";
import { useAuth } from "@/context/auth-context";
import { formatCurrency } from "@/lib/utils";
import { Link } from "react-router";

interface DashboardData {
  total_sales_this_month: string;
  customers_this_month: number;
  total_orders: number;
  best_selling_products: {
    product: string;
    total_sold: string;
  }[];
  recent_orders: {
    order_number: string;
    date: string;
    total: string;
    status: string;
    items: string[];
  }[];
}

export function Dashboard() {
  const { token } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get(
        "https://api.techsavyhub.ng/api/admin/dashboard",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.status === "success") {
        setData(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchDashboardData();
    }
  }, [token]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-7 w-32" />
            ) : (
              <div className="text-2xl font-bold text-atlantis-800">
                {formatCurrency(data?.total_sales_this_month || 0)}
              </div>
            )}
            <div className="text-xs mt-2 text-muted-foreground uppercase">
              This Month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customers</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-7 w-32" />
            ) : (
              <div className="text-2xl font-bold text-atlantis-800">
                {data?.customers_this_month}
              </div>
            )}
            <div className="text-xs mt-2 text-muted-foreground uppercase">
              This Month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-7 w-32" />
            ) : (
              <div className="text-2xl font-bold text-atlantis-800">
                {data?.total_orders}
              </div>
            )}
            <div className="text-xs mt-2 text-muted-foreground uppercase">
              All Time
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Best Selling */}
        <Card>
          <CardHeader>
            <CardTitle className="text-atlantis-800">Best Selling</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-2xl font-bold">
                ₦{data?.total_sales_this_month || 0} — Total Sales
              </div>
              <div className="space-y-3">
                {data?.best_selling_products.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center"
                  >
                    <span className="text-sm">{item.product}</span>
                    <span className="text-sm font-medium text-green-600">
                      {item.total_sold} Sold
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-atlantis-800">Recent Orders</CardTitle>
            </div>
            <Link to="/dashboard/orders">
              <div className="text-sm text-muted-foreground">View All</div>
            </Link>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <>
                    <TableRow>
                      <TableCell colSpan={4}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    </TableRow>{" "}
                    <TableRow>
                      <TableCell colSpan={4}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    </TableRow>
                  </>
                ) : data?.recent_orders && data?.recent_orders.length > 0 ? (
                  data?.recent_orders.map((order, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        {order.order_number}
                      </TableCell>
                      <TableCell>{formatDate(order.date)}</TableCell>
                      <TableCell>${order.total}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            order.status === "completed"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {order.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5}>No recent orders found</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
