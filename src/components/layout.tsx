import { Navigate, Outlet, useLocation, Link } from "react-router-dom";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";

import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ExternalLink, LogOut } from "lucide-react";
import { AppSidebar } from "./app-sidebar";
import { useAuth } from "@/context/auth-context";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

const isAuthenticated = () => {
  return !!Cookies.get("techSavyAdminAuthToken");
};

const getBreadcrumbItems = (pathname: string) => {
  const paths = pathname.split("/").filter(Boolean);
  const items = [];

  items.push({
    label: "Dashboard",
    href: "/dashboard",
  });

  let currentPath = "";
  paths.forEach((path) => {
    currentPath += `/${path}`;
    if (path === "dashboard") return;

    const label = path
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    items.push({
      label,
      href: currentPath,
    });
  });

  return items;
};

export function Layout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const breadcrumbItems = getBreadcrumbItems(location.pathname);

  if (!isAuthenticated()) {
    return <Navigate to="/login" />;
  }

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbItems.map((item, index) => (
                <BreadcrumbItem key={item.href}>
                  {index === breadcrumbItems.length - 1 ? (
                    <BreadcrumbPage>{item.label}</BreadcrumbPage>
                  ) : (
                    <>
                      <BreadcrumbLink asChild>
                        <Link to={item.href}>{item.label}</Link>
                      </BreadcrumbLink>
                      <BreadcrumbSeparator />
                    </>
                  )}
                </BreadcrumbItem>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="hover:bg-red-100 hover:text-red-600"
            >
              <LogOut className="size-4" />
            </Button>
            <ExternalLink className="size-4" />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-6">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
