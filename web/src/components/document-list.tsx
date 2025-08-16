// web/src/components/document-list.tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { toast } from "sonner";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, MessageSquare, Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

type Document = {
  id: string;
  name: string;
  status: "PENDING" | "PROCESSING" | "DONE" | "FAILED";
  createdAt: string;
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
  },
};

export function DocumentList({ documents }: { documents: Document[] }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const getBadgeVariant = (status: Document["status"]) => {
    switch (status) {
      case "PROCESSING":
      case "PENDING":
        return "secondary";
      case "FAILED":
        return "destructive";
      default:
        return "default";
    }
  };

  const handleDelete = async (e: React.MouseEvent, docId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDeleting(docId);
    try {
      await axios.delete(`http://localhost:3000/documents/${docId}`);
      toast.success("Document deleted successfully.");
      router.refresh();
    } catch (error) {
      toast.error("Failed to delete document.");
    } finally {
      setIsDeleting(null);
    }
  };

  if (documents.length === 0) {
    return (
        <div className="mt-8 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/50 p-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No documents yet</h3>
            <p className="mt-2 text-sm text-muted-foreground">
                Upload your first PDF to get started.
            </p>
        </div>
    );
  }

  return (
    <motion.div
      className="mt-4 grid gap-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {documents.map((doc) => (
        <motion.div
          key={doc.id}
          variants={itemVariants}
          whileHover={{ scale: 1.02, y: -2 }}
          className="transition-transform"
        >
          <Link href={doc.status === 'DONE' ? `/chat/${doc.id}` : '#'}>
            <Card className={`${doc.status === 'DONE' ? 'hover:border-primary cursor-pointer' : 'opacity-70 cursor-not-allowed'} transition-colors`}>
              <CardHeader className="grid grid-cols-[1fr_auto] items-center gap-4 space-y-0">
                <div className="space-y-1">
                  <CardTitle className="truncate w-40 md:w-full">
                    {doc.name}
                  </CardTitle>
                  <CardDescription>
                    Uploaded on {new Date(doc.createdAt).toLocaleDateString()}
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={getBadgeVariant(doc.status)}>{doc.status}</Badge>
                  <Button variant="secondary" className="px-3 shadow-none hidden sm:flex" disabled={doc.status !== 'DONE'}><MessageSquare className="mr-2 h-4 w-4" />Chat</Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="icon" disabled={isDeleting === doc.id} onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                        {isDeleting === doc.id ? <div className="h-4 w-4 border-2 border-t-transparent border-white rounded-full animate-spin" /> : <Trash2 className="h-4 w-4" />}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>This action cannot be undone. This will permanently delete this document and all of its processed data.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={(e) => handleDelete(e, doc.id)}>Continue</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardHeader>
            </Card>
          </Link>
        </motion.div>
      ))}
    </motion.div>
  );
}