// web/src/app/page.tsx
"use client" // <-- Make this a client component to use the store

import { UploadButton } from "@/components/upload-button";
import { DocumentList } from "@/components/document-list";
import { DeleteAllButton } from "@/components/delete-all-button";

export default function HomePage() {
  return (
    <div className="container mx-auto max-w-3xl py-12">
      <div className="flex flex-col items-center text-center">
        <h1 className="text-4xl font-bold tracking-tight">AI Knowledge Base</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          The easiest way to chat with your documents.
        </p>
        <UploadButton />
      </div>

      <div className="mt-16">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold tracking-tight">
            Your Documents
          </h2>
          <DeleteAllButton />
        </div>
        <DocumentList />
      </div>
    </div>
  );
}