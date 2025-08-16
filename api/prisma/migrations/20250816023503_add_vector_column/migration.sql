-- migration.sql
CREATE EXTENSION IF NOT EXISTS vector;
ALTER TABLE "DocumentChunk" ALTER COLUMN "embedding" SET DATA TYPE vector(1536) USING NULL;