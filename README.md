# AI Knowledge Base 🧠

An intelligent, full-stack application that transforms any PDF document into an interactive chatbot, allowing users to ask questions and receive context-aware answers. This project leverages a modern tech stack and a Retrieval-Augmented Generation (RAG) pipeline to provide accurate, AI-powered insights from your documents.

---

## ⭐ Key Features

* **Dynamic Knowledge Base:** Upload any PDF to create a new, queryable knowledge base on the fly.
* **Asynchronous Processing Pipeline:** Utilizes a robust backend queue system with **Redis** and **BullMQ** to handle document processing, text splitting, and vectorization as background jobs without blocking the user interface.
* **AI-Powered Q&A:** Employs **Google's Gemini models** (via LangChain.js) for both generating vector embeddings (`text-embedding-004`) and powering the conversational chat (`gemini-1.5-flash`).
* **Vector Similarity Search:** Performs efficient, real-time similarity searches using a **PostgreSQL** database supercharged with the `pgvector` extension to find the most relevant document chunks for any given question.
* **Modern, Responsive Frontend:** A beautiful and fully responsive user interface built with the **Next.js 14+ App Router**, styled with **Tailwind CSS**, and brought to life with components from **shadcn/ui** and animations from **Framer Motion**.
* **Full Document Management:** Includes complete CRUD (Create, Read, Delete) functionality, allowing users to manage their uploaded documents with individual and bulk delete options.

## 🛠️ Tech Stack

| Category      | Technology                                                                                                  |
| :------------ | :---------------------------------------------------------------------------------------------------------- |
| **Frontend** | [Next.js](https://nextjs.org/), [React](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Tailwind CSS](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/), [Framer Motion](https://www.framer.com/motion/), [Axios](https://axios-http.com/) |
| **Backend** | [NestJS](https://nestjs.com/), [Node.js](https://nodejs.org/), [TypeScript](https://www.typescriptlang.org/), [Prisma](https://www.prisma.io/)                                       |
| **Database** | [PostgreSQL](https://www.postgresql.org/), [pgvector](https://github.com/pgvector/pgvector), [Redis](https://redis.io/)                                                             |
| **AI** | [Google Gemini API](https://ai.google.dev/), [LangChain.js](https://js.langchain.com/)                       |
| **DevOps & Tooling** | [Docker](https://www.docker.com/), [BullMQ](https://bullmq.io/)                                                                |


## 🚀 Running the Project Locally

### Prerequisites

* [Node.js](https://nodejs.org/en) (v18 or later)
* [Docker](https://www.docker.com/products/docker-desktop/) and Docker Compose
* A Google AI API Key (from [Google AI Studio](https://aistudio.google.com/))

### 1. Clone the Repository

```bash
git clone [https://github.com/your-username/ai-knowledge-assistant.git](https://github.com/your-username/ai-knowledge-assistant.git)
cd ai-knowledge-assistant