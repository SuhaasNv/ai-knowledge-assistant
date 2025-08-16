// web/src/components/document-list.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import axios from "axios";
import { toast } from "sonner";
import io from "socket.io-client";
import { useDocumentStore, Document } from "@/lib/store";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { FileText, MessageSquare, Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } };

export function DocumentList() {
  const { documents, setDocuments, addDocument, updateDocument, removeDocument, removeAllDocuments } = useDocumentStore();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  
  // State to control the delete confirmation dialog programmatically
  const [dialogState, setDialogState] = useState<{ isOpen: boolean; docId: string | null }>({ isOpen: false, docId: null });

  useEffect(() => {
    const fetchInitialDocuments = async () => {
      try {
        const response = await axios.get("http://localhost:3000/documents");
        setDocuments(response.data);
      } catch (error) { toast.error("Could not load documents."); }
    };
    if (useDocumentStore.getState().documents.length === 0) {
      fetchInitialDocuments();
    }
    const socket = io("http://localhost:3000");
    socket.on('documentCreated', (newDoc: Document) => addDocument(newDoc));
    socket.on('documentUpdate', (updatedDoc: Partial<Document> & { id: string }) => updateDocument(updatedDoc));
    socket.on('documentDeleted', (data: { id: string }) => removeDocument(data.id));
    socket.on('allDocumentsDeleted', () => removeAllDocuments());
    return () => { socket.disconnect(); };
  }, [setDocuments, addDocument, updateDocument, removeDocument, removeAllDocuments]);
  
  const openDeleteDialog = (e: React.MouseEvent, docId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDialogState({ isOpen: true, docId: docId });
  };

  const handleDelete = async () => {
    if (!dialogState.docId) return;
    setIsDeleting(dialogState.docId);
    try {
      await axios.delete(`http://localhost:3000/documents/${dialogState.docId}`);
      toast.success("Document deleted successfully.");
    } catch (error) {
      toast.error("Failed to delete document.");
    } finally {
      setIsDeleting(null);
      setDialogState({ isOpen: false, docId: null }); // Close the dialog
    }
  };
  
  const getBadgeVariant = (status: Document["status"]) => {
    switch (status) {
      case "PROCESSING": case "PENDING": return "secondary";
      case "FAILED": return "destructive";
      default: return "default";
    }
  };

  return (
    <>
      <motion.div className="mt-4 grid gap-4" variants={containerVariants} initial="hidden" animate="visible">
        {documents.map((doc) => (
          <motion.div key={doc.id} variants={itemVariants} whileHover={{ scale: 1.02, y: -2 }} className="transition-transform">
            <Link href={doc.status === 'DONE' ? `/chat/${doc.id}` : '#'} className={`${doc.status !== 'DONE' && 'pointer-events-none'}`}>
              <Card className={`${doc.status === 'DONE' ? 'hover:border-primary cursor-pointer' : 'opacity-70 cursor-not-allowed'} transition-colors`}>
                <CardHeader>
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1">
                      <CardTitle className="truncate w-40 md:w-full">{doc.name}</CardTitle>
                      <CardDescription>Uploaded on {new Date(doc.createdAt).toLocaleString()}</CardDescription>
                    </div>
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      {doc.status !== "PROCESSING" && <Badge variant={getBadgeVariant(doc.status)}>{doc.status}</Badge>}
                      <Button variant="secondary" className="px-3 shadow-none hidden sm:flex" disabled={doc.status !== 'DONE'}><MessageSquare className="mr-2 h-4 w-4" />Chat</Button>
                      {/* This button now just opens the dialog via state */}
                      <Button variant="destructive" size="icon" disabled={isDeleting === doc.id} onClick={(e) => openDeleteDialog(e, doc.id)}>
                        {isDeleting === doc.id ? <div className="h-4 w-4 border-2 border-t-transparent border-white rounded-full animate-spin" /> : <Trash2 className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  {doc.status === 'PROCESSING' && (
                    <div className="mt-2 text-sm text-muted-foreground">
                      Processing...
                      <Progress value={doc.progress} className="w-full mt-1" />
                    </div>
                  )}
                </CardHeader>
              </Card>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      {/* The AlertDialog now lives outside the loop and is controlled by our state */}
      <AlertDialog open={dialogState.isOpen} onOpenChange={(isOpen) => setDialogState({ ...dialogState, isOpen })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone. This will permanently delete this document.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}