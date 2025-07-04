"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, ArrowRight, ArrowLeft, ArrowDownUpIcon } from "lucide-react";

import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "@/context/auth-context";
import { Skeleton } from "@/components/ui/skeleton";

interface Product {
  id: number;
  title: string;
  price: string;
  sku: string;
  quantity: number;
  condition: string;
  images: string[];
  category: {
    id: number;
    name: string;
  };
}

export function Products() {
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { token } = useAuth();
  const navigate = useNavigate();

  const fetchProducts = async (page: number) => {
    try {
      const response = await axios.get(
        `https://api.techsavyhub.ng/api/admin/products?page=${page}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.status === "success") {
        setProducts(response.data.products);
        setTotalPages(response.data.total_page);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchProducts(currentPage);
    }
  }, [token, currentPage]);

  const filteredProducts = products.filter((product) =>
    product.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center max-lg:flex-col max-lg:gap-4 max-lg:items-start">
          <h1 className="text-2xl font-bold text-atlantis-800">Products</h1>
          <div className="flex gap-4 flex-wrap">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <ArrowDownUpIcon className="size-4" />
                </TableHead>
                <TableHead>Name</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Categories</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[1, 2, 3, 4, 5].map((i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-8 w-8" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[200px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[100px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[80px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[60px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[100px]" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center max-lg:flex-col max-lg:gap-4 max-lg:items-start">
        <h1 className="text-2xl font-bold text-atlantis-800">Products</h1>
        <div className="flex gap-2 flex-wrap">
          <Button asChild className="bg-primary">
            <Link to="/dashboard/products/add">Add product</Link>
          </Button>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 size-4" />
            <Input
              placeholder="Search products"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <ArrowDownUpIcon className="size-4" />
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Categories</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <TableRow
                  onClick={() => navigate(`/dashboard/products/${product.id}`)}
                  key={product.id}
                  className="cursor-pointer"
                >
                  <TableCell>
                    <img
                      src={product.images[0]}
                      alt={product.title}
                      className="w-8 h-8 object-cover rounded"
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    {product.title.slice(0, 25) +
                      (product.title.length > 25 ? "..." : "")}
                  </TableCell>
                  <TableCell>{product.sku}</TableCell>
                  <TableCell>
                    ₦{Number(product.price).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        product.quantity > 0 ? "secondary" : "destructive"
                      }
                    >
                      {product.quantity > 0 ? "In Stock" : "Out of Stock"}
                    </Badge>
                  </TableCell>
                  <TableCell>{product.category.name}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  No products found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center space-x-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ArrowLeft />
        </Button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <Button
            key={page}
            variant={currentPage === page ? "default" : "outline"}
            size="sm"
            onClick={() => handlePageChange(page)}
          >
            {page}
          </Button>
        ))}
        <Button
          variant="outline"
          size="icon"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <ArrowRight />
        </Button>
      </div>
    </div>
  );
}
