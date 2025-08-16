// web/src/app/page.tsx
import { UploadButton } from "@/components/upload-button";
import { DocumentList } from "@/components/document-list";
import { DeleteAllButton } from "@/components/delete-all-button";

type Document = {
  id: string;
  name: string;
  status: "PENDING" | "PROCESSING" | "DONE" | "FAILED";
  createdAt: string;
};

async function getDocuments(): Promise<Document[]> {
  try {
    const res = await fetch("http://localhost:3000/documents", {
      cache: "no-store",
    });
    if (!res.ok) return [];
    return res.json();
  } catch (error) {
    console.error("Error fetching documents:", error);
    return [];
  }
}

export default async function HomePage() {
  const documents = await getDocuments();

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
          <DeleteAllButton hasDocuments={documents.length > 0} />
        </div>
        <DocumentList documents={documents} />
      </div>
    </div>
  );
}