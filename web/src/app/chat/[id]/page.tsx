// src/app/chat/[id]/page.tsx
import { ChatInterface } from "@/components/chat-interface";

type Document = {
  id: string;
  name: string;
};

async function getDocument(id: string): Promise<Document | null> {
  try {
    const res = await fetch(`http://localhost:3000/documents/${id}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    return null;
  }
}

// THE FIX IS IN THE LINE BELOW: We destructure 'id' directly from 'params'
export default async function ChatPage({ params: { id } }: { params: { id: string } }) {
  const document = await getDocument(id); // And now we can use 'id' directly

  if (!document) {
    return (
      <div className="container mx-auto max-w-3xl py-12 text-center">
        <h1 className="text-2xl font-bold">Document not found</h1>
        <p className="mt-2 text-muted-foreground">
          This document may have been deleted or is still being processed.
        </p>
      </div>
    );
  }

  return (
    <ChatInterface documentId={document.id} documentName={document.name} />
  );
}