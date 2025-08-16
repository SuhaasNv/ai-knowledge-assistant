# AI Knowledge Base 🧠

A full-stack AI chatbot that lets you upload and chat with your PDF documents using a Retrieval-Augmented Generation (RAG) pipeline built with modern, in-demand technologies.

![App Demo](_demo/app-demo.gif)

---

## Tech Stack

- **Frontend:** Next.js, React, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion
- **Backend:** NestJS, Node.js, TypeScript, Prisma
- **Database & AI:** PostgreSQL with `pgvector`, Redis, Google Gemini API, LangChain.js
- **DevOps:** Docker

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- Docker
- A Google AI API Key

### 1. Clone & Setup
```bash
# Clone the repository
git clone [https://github.com/your-username/ai-knowledge-assistant.git](https://github.com/your-username/ai-knowledge-assistant.git)
cd ai-knowledge-assistant

# Start the database and Redis
docker-compose up -d