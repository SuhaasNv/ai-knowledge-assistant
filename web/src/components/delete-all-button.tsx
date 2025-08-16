// web/src/components/delete-all-button.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import { useDocumentStore } from "@/lib/store"; // <-- Import the store
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";

export function DeleteAllButton() {
  const [isDeleting, setIsDeleting] = useState(false);
  const documents = useDocumentStore((state) => state.documents); // <-- Get documents from store

  const handleDeleteAll = async () => {
    setIsDeleting(true);
    try {
      await axios.delete("http://localhost:3000/documents");
      toast.success("All documents deleted successfully.");
      // UI will update via WebSocket
    } catch (error) {
      toast.error("Failed to delete all documents.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (documents.length === 0) return null;

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm" disabled={isDeleting}>
          {isDeleting ? "Deleting..." : <><Trash2 className="mr-2 h-4 w-4" /> Delete All</>}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>This action cannot be undone. This will permanently delete ALL documents.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDeleteAll}>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}