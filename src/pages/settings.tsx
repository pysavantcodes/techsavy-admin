"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader, Phone, Mail, MapPin, Facebook, Twitter } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import axios from "axios";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

interface ContactSettings {
  id: number;
  contacts: {
    email: string;
    phone: string;
    address: string;
  };
  socials: {
    twitter: string;
    facebook: string;
  };
  created_at: string;
  updated_at: string;
}

export function Settings() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<ContactSettings | null>(null);
  const [formData, setFormData] = useState({
    contacts: {
      email: "",
      phone: "",
      address: "",
    },
    socials: {
      twitter: "",
      facebook: "",
    },
  });

  const fetchSettings = async () => {
    try {
      const response = await axios.get(
        "https://api.techsavyhub.ng/api/admin/contact-settings",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.status === "success") {
        setSettings(response.data.data);
        setFormData({
          contacts: response.data.data.contacts || {
            email: "",
            phone: "",
            address: "",
          },
          socials: response.data.data.socials || { twitter: "", facebook: "" },
        });
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      // Don't show error toast for initial load, just set empty form
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchSettings();
    }
  }, [token]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    section: "contacts" | "socials"
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [name]: value,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const toastId = toast.loading("Saving settings...");

    try {
      const formDataToSend = new FormData();

      // Add contact fields
      Object.entries(formData.contacts).forEach(([key, value]) => {
        formDataToSend.append(`contacts[${key}]`, value);
      });

      // Add social fields
      Object.entries(formData.socials).forEach(([key, value]) => {
        formDataToSend.append(`socials[${key}]`, value);
      });

      const response = await axios.post(
        "https://api.techsavyhub.ng/api/admin/contact-settings",
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.status === "success") {
        toast.success("Settings saved successfully!", { id: toastId });
        // Update the settings state with the new data
        setSettings(response.data.data);
      }
    } catch (error: any) {
      console.error("Error saving settings:", error);
      toast.error(error.response?.data?.message || "Failed to save settings", {
        id: toastId,
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-atlantis-800">Settings</h1>
          <p className="text-muted-foreground">
            Manage your contact information and social media links.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end">
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-atlantis-800">Settings</h1>
        <p className="text-muted-foreground">
          Manage your contact information and social media links.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="contact@example.com"
                  value={formData.contacts.email}
                  onChange={(e) => handleInputChange(e, "contacts")}
                  disabled={saving}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+1234567890"
                  value={formData.contacts.phone}
                  onChange={(e) => handleInputChange(e, "contacts")}
                  disabled={saving}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Address
                </Label>
                <Input
                  id="address"
                  name="address"
                  placeholder="Lagos, Nigeria"
                  value={formData.contacts.address}
                  onChange={(e) => handleInputChange(e, "contacts")}
                  disabled={saving}
                />
              </div>
            </CardContent>
          </Card>

          {/* Social Media Links */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Social Media Links
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="facebook" className="flex items-center gap-2">
                  <Facebook className="h-4 w-4" />
                  Facebook URL
                </Label>
                <Input
                  id="facebook"
                  name="facebook"
                  type="url"
                  placeholder="https://facebook.com/yourpage"
                  value={formData.socials.facebook}
                  onChange={(e) => handleInputChange(e, "socials")}
                  disabled={saving}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="twitter" className="flex items-center gap-2">
                  <Twitter className="h-4 w-4" />
                  Twitter URL
                </Label>
                <Input
                  id="twitter"
                  name="twitter"
                  type="url"
                  placeholder="https://twitter.com/yourhandle"
                  value={formData.socials.twitter}
                  onChange={(e) => handleInputChange(e, "socials")}
                  disabled={saving}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Current Settings Display */}
        {settings && (
          <Card>
            <CardHeader>
              <CardTitle>Current Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-medium mb-2">Contact Information</h4>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>
                      <span className="font-medium">Email:</span>{" "}
                      {settings.contacts.email || "Not set"}
                    </p>
                    <p>
                      <span className="font-medium">Phone:</span>{" "}
                      {settings.contacts.phone || "Not set"}
                    </p>
                    <p>
                      <span className="font-medium">Address:</span>{" "}
                      {settings.contacts.address || "Not set"}
                    </p>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Social Media</h4>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>
                      <span className="font-medium">Facebook:</span>{" "}
                      {settings.socials.facebook ? (
                        <a
                          href={settings.socials.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          View Page
                        </a>
                      ) : (
                        "Not set"
                      )}
                    </p>
                    <p>
                      <span className="font-medium">Twitter:</span>{" "}
                      {settings.socials.twitter ? (
                        <a
                          href={settings.socials.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          View Profile
                        </a>
                      ) : (
                        "Not set"
                      )}
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t">
                <p className="text-xs text-muted-foreground">
                  Last updated: {new Date(settings.updated_at).toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-end">
          <Button type="submit" disabled={saving} className="bg-primary">
            {saving ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Settings"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
