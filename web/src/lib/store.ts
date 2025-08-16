// web/src/lib/store.ts
import { create } from 'zustand';

export type Document = {
  id: string;
  name: string;
  status: "PENDING" | "PROCESSING" | "DONE" | "FAILED";
  createdAt: string;
  progress: number;
};

type DocumentState = {
  documents: Document[];
  setDocuments: (documents: Document[]) => void;
  addDocument: (document: Document) => void;
  updateDocument: (update: Partial<Document> & { id: string }) => void;
  removeDocument: (id: string) => void;
  removeAllDocuments: () => void;
};

export const useDocumentStore = create<DocumentState>((set) => ({
  documents: [],
  setDocuments: (documents) => set({ documents }),
  addDocument: (document) => set((state) => ({ documents: [document, ...state.documents] })),
  updateDocument: (update) => set((state) => ({
    documents: state.documents.map((doc) =>
      doc.id === update.id ? { ...doc, ...update } : doc
    ),
  })),
  removeDocument: (id) => set((state) => ({
    documents: state.documents.filter((doc) => doc.id !== id),
  })),
  removeAllDocuments: () => set({ documents: [] }),
}));