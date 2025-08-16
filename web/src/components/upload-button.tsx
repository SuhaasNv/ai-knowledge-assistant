// web/src/components/upload-button.tsx
"use client";

import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { UploadCloud } from "lucide-react";

export function UploadButton() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
    } else {
      setFile(null);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file) {
      toast.error("Please select a file first.");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      await axios.post("http://localhost:3000/documents/upload", formData);
      toast.success("File uploaded! Processing has started.");
      setFile(null);
      setIsOpen(false);
    } catch (error) {
      toast.error("An error occurred during upload.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="mt-8">
          <UploadCloud className="mr-2 h-4 w-4" /> Upload PDF
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload a new PDF document</DialogTitle>
          <DialogDescription>
            Your document will be processed and you can start chatting with it.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
          <Input type="file" onChange={handleFileChange} accept=".pdf" />
          <Button type="submit" disabled={isUploading || !file}>
            {isUploading ? "Uploading..." : "Upload & Process"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}