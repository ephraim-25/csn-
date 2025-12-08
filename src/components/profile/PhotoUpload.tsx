import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Camera, Loader2, Upload, X } from "lucide-react";

interface PhotoUploadProps {
  currentPhotoUrl: string | null;
  chercheurId: string;
  initials: string;
  onPhotoUpdated: (url: string) => void;
}

export default function PhotoUpload({
  currentPhotoUrl,
  chercheurId,
  initials,
  onPhotoUpdated,
}: PhotoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner une image",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Erreur",
        description: "L'image ne doit pas dépasser 5MB",
        variant: "destructive",
      });
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => setPreviewUrl(e.target?.result as string);
    reader.readAsDataURL(file);

    // Upload file
    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${chercheurId}-${Date.now()}.${fileExt}`;
      const filePath = `photos/${fileName}`;

      // Delete old photo if exists
      if (currentPhotoUrl) {
        const oldPath = currentPhotoUrl.split("/").pop();
        if (oldPath) {
          await supabase.storage.from("chercheurs-photos").remove([`photos/${oldPath}`]);
        }
      }

      // Upload new photo
      const { error: uploadError } = await supabase.storage
        .from("chercheurs-photos")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("chercheurs-photos")
        .getPublicUrl(filePath);

      // Update chercheur record
      const { error: updateError } = await supabase
        .from("chercheurs")
        .update({ photo_url: urlData.publicUrl })
        .eq("id", chercheurId);

      if (updateError) throw updateError;

      onPhotoUpdated(urlData.publicUrl);
      toast({
        title: "Succès",
        description: "Photo de profil mise à jour",
      });
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de télécharger la photo",
        variant: "destructive",
      });
      setPreviewUrl(null);
    } finally {
      setUploading(false);
    }
  };

  const handleRemovePhoto = async () => {
    if (!currentPhotoUrl) return;

    setUploading(true);
    try {
      // Extract filename from URL
      const urlParts = currentPhotoUrl.split("/");
      const fileName = urlParts[urlParts.length - 1];

      // Remove from storage
      await supabase.storage.from("chercheurs-photos").remove([`photos/${fileName}`]);

      // Update database
      const { error } = await supabase
        .from("chercheurs")
        .update({ photo_url: null })
        .eq("id", chercheurId);

      if (error) throw error;

      onPhotoUpdated("");
      setPreviewUrl(null);
      toast({
        title: "Succès",
        description: "Photo de profil supprimée",
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la photo",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const displayUrl = previewUrl || currentPhotoUrl;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative group">
        <Avatar className="h-32 w-32 border-4 border-primary/20 transition-all group-hover:border-primary/40">
          <AvatarImage src={displayUrl || undefined} />
          <AvatarFallback className="bg-primary/10 text-primary text-3xl">
            {initials}
          </AvatarFallback>
        </Avatar>

        {/* Overlay on hover */}
        <div
          className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          {uploading ? (
            <Loader2 className="h-8 w-8 text-white animate-spin" />
          ) : (
            <Camera className="h-8 w-8 text-white" />
          )}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
        disabled={uploading}
      />

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="gap-2"
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          {uploading ? "Téléchargement..." : "Changer la photo"}
        </Button>

        {currentPhotoUrl && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRemovePhoto}
            disabled={uploading}
            className="gap-2 text-destructive hover:text-destructive"
          >
            <X className="h-4 w-4" />
            Supprimer
          </Button>
        )}
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Formats acceptés: JPG, PNG, GIF (max 5MB)
      </p>
    </div>
  );
}
