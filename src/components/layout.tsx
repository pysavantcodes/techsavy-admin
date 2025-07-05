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
import { ExternalLink, LogOut } from "lucide-react";
import { AppSidebar } from "./app-sidebar";
import { useAuth } from "@/context/auth-context";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { useState } from "react";

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
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  if (!isAuthenticated()) {
    return <Navigate to="/login" />;
  }

  const handleLogoutClick = () => {
    setShowLogoutDialog(true);
  };

  const handleLogoutConfirm = () => {
    logout();
    navigate("/login");
    setShowLogoutDialog(false);
  };

  const handleLogoutCancel = () => {
    setShowLogoutDialog(false);
  };

  return (
    <>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 sticky top-0 z-[20] items-center gap-2 border-b px-4 bg-white">
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
                          {item.label !== "Edit" ? (
                            <Link to={item.href}>{item.label}</Link>
                          ) : (
                            <p>{item.label}</p>
                          )}
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
                onClick={handleLogoutClick}
                className="hover:bg-red-100 hover:text-red-600"
              >
                <LogOut className="size-4" />
              </Button>
              <a href="https://techsavyhub.vercel.app" target="_blank">
                <ExternalLink className="size-4" />
              </a>
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-6">
            <Outlet />
          </div>
        </SidebarInset>
      </SidebarProvider>

      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to logout? You will need to sign in again to
              access the admin dashboard.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleLogoutCancel}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLogoutConfirm}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600 text-white"
            >
              Logout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
