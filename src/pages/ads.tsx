import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Plus,
  Edit,
  Trash2,
  ImageOff,
  ExternalLink,
  Calendar,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import axios from "axios";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils";
import { AddAdDialog } from "@/components/add-ad-dialog";
import { EditAdDialog } from "@/components/edit-ad-dialog";
import { DeleteAdDialog } from "@/components/delete-ad-dialog";

interface Ad {
  id: number;
  image: string;
  text: string;
  link?: string;
  created_at: string;
  updated_at: string;
  image_url: string;
}

export function Ads() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null);
  const { token } = useAuth();

  const fetchAds = async () => {
    try {
      const response = await axios.get(
        "https://api.techsavyhub.ng/api/admin/ads",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.status === "success") {
        setAds(response.data.ads);
      }
    } catch (error) {
      console.error("Error fetching ads:", error);
      toast.error("Failed to fetch ads");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchAds();
    }
  }, [token]);

  const handleEditClick = (ad: Ad) => {
    setSelectedAd(ad);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (ad: Ad) => {
    setSelectedAd(ad);
    setIsDeleteDialogOpen(true);
  };

  const handleAddSuccess = () => {
    fetchAds();
    setIsAddDialogOpen(false);
  };

  const handleEditSuccess = () => {
    fetchAds();
    setIsEditDialogOpen(false);
    setSelectedAd(null);
  };

  const handleDeleteSuccess = () => {
    fetchAds();
    setIsDeleteDialogOpen(false);
    setSelectedAd(null);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between flex-wrap gap-4 items-center">
          <div>
            <h1 className="text-2xl font-bold text-atlantis-800">Ads</h1>
            <p className="text-sm text-gray-500">
              Manage your ads and their details
            </p>
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="aspect-video w-full rounded-lg mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4 mb-4" />
                <div className="flex justify-between items-center">
                  <Skeleton className="h-4 w-20" />
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between flex-wrap gap-4 items-center">
          <div>
            <h1 className="text-2xl font-bold text-atlantis-800">Ads</h1>
            <p className="text-sm text-gray-500">
              Manage your ads and their details
            </p>
          </div>
          <Button
            onClick={() => setIsAddDialogOpen(true)}
            className="bg-primary gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Ad
          </Button>
        </div>

        {ads.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <ImageOff className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No ads found
              </h3>
              <p className="text-gray-500 mb-4">
                Get started by creating your first advertisement.
              </p>
              <Button
                onClick={() => setIsAddDialogOpen(true)}
                className="bg-primary"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Ad
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {ads.map((ad) => (
              <Card key={ad.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="aspect-video relative overflow-hidden">
                    {ad.image_url ? (
                      <img
                        src={ad.image_url}
                        alt={ad.text}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = "none";
                          target.nextElementSibling?.classList.remove("hidden");
                        }}
                      />
                    ) : null}
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {ad.text}
                    </p>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Calendar className="h-3 w-3" />
                        {formatDate(ad.created_at)}
                      </div>
                      <div className="flex gap-2">
                        {ad.link && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(ad.link, "_blank")}
                            className="h-8 w-8 p-0"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditClick(ad)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(ad)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <AddAdDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSuccess={handleAddSuccess}
      />

      <EditAdDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        ad={selectedAd}
        onSuccess={handleEditSuccess}
      />

      <DeleteAdDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        ad={selectedAd}
        onSuccess={handleDeleteSuccess}
      />
    </>
  );
}
