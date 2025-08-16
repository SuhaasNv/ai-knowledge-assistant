## ⚡ Quick Setup

If you want to run everything locally in one go, just copy and paste this into your terminal:

```bash
# Clone the repository
git clone https://github.com/your-username/ai-knowledge-assistant.git
cd ai-knowledge-assistant

# Create backend .env file with required environment variables
mkdir -p api
cat > api/.env <<EOL
# api/.env

# This connection string is for the Docker setup
DATABASE_URL="postgresql://myuser:mypassword@localhost:5432/mydatabase"

# Get your key from Google AI Studio
GOOGLE_API_KEY="AIzaSyYourSecretApiKeyHere..."
EOL

# Install backend dependencies
cd api
npm install

# Install frontend dependencies
cd ../web
npm install

# Go back to root
cd ..

# Start PostgreSQL and Redis via Docker
docker-compose up -d

# Run database migrations
cd api
npx prisma migrate dev

# Start backend (Terminal A)
echo "👉 Run this in Terminal A:"
echo "cd api && npm run start:dev"

# Start frontend (Terminal B)
echo "👉 Run this in Terminal B:"
echo "cd web && npm run dev"

echo "✅ Setup complete! Visit http://localhost:3001 to start chatting with your PDFs."