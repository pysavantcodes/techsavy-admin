import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(price: string | number): string {
  const numericPrice =
    typeof price === "string" ? Number.parseFloat(price) : price;

  if (isNaN(numericPrice)) {
    return "₦0.00";
  }

  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  }).format(numericPrice);
}

export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch (error) {
    return "Invalid date";
  }
}

export const getBadge = (status: string) => {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800 border border-yellow-300 capitalize";
    case "processing":
      return "bg-blue-100 text-blue-800 border border-blue-300 capitalize";
    case "shipped":
      return "bg-green-100 text-green-800 border border-green-300 capitalize";
    case "delivered":
      return "bg-green-100 text-green-800 border border-green-300 capitalize";
  }
  return "bg-gray-100 text-gray-800 border border-gray-300 capitalize";
};
