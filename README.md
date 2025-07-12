# Wizetale - Transform Learning into Magical Stories

Wizetale is an educational platform that transforms complex humanities subjects into AI-generated video stories, making learning fun and engaging for students aged 10-18.

## 🚀 Project Structure

```
Wizetale/
├── wizetale-api/          # FastAPI Backend
├── wizetale-app/          # Next.js Frontend (Main App)
├── docker-compose.yml     # Full stack orchestration
└── README.md
```

## 🛠️ Tech Stack

### Backend (FastAPI)
- **Framework**: FastAPI
- **Database**: Supabase (PostgreSQL)
- **Cache**: Redis
- **Authentication**: Supabase Auth
- **AI Services**: GPT-4, ElevenLabs, Runway/Sora (planned)

### Frontend (Next.js)
- **Framework**: Next.js 15
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI + shadcn/ui
- **Forms**: React Hook Form + Zod validation

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 20+
- Python 3.11+

### 1. Environment Setup

Create `.env` file in `wizetale-api/`:
```bash
SUPABASE_URL=your-supabase-url
SUPABASE_KEY=your-supabase-service-role-key
SUPABASE_JWT_SECRET=your-supabase-jwt-secret
REDIS_URL=redis://redis:6379/0
```

### 2. Database Setup

Run this SQL in your Supabase dashboard:
```sql
-- Create waitlist table
CREATE TABLE IF NOT EXISTS waitlist (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create stories table
CREATE TABLE IF NOT EXISTS stories (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  user_id INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create media table
CREATE TABLE IF NOT EXISTS media (
  id SERIAL PRIMARY KEY,
  type VARCHAR(50) NOT NULL CHECK (type IN ('audio', 'video')),
  url TEXT NOT NULL,
  user_id INTEGER NOT NULL,
  story_id INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 3. Run the Application

```bash
# Start all services
docker-compose up --build

# Or run in background
docker-compose up -d --build
```

### 4. Access the Application

- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Frontend App**: http://localhost:3001
- **Redis**: localhost:6379

## 📚 API Endpoints

### Stories
- `GET /stories` - Get all stories
- `GET /stories/{id}` - Get story by ID
- `POST /stories` - Create new story
- `PUT /stories/{id}` - Update story
- `DELETE /stories/{id}` - Delete story

### Users
- `GET /users` - Get all users
- `GET /users/{id}` - Get user by ID
- `POST /users` - Create new user
- `PUT /users/{id}` - Update user
- `DELETE /users/{id}` - Delete user

### Media (Audio/Video)
- `GET /audio` - Get all audio files
- `GET /videos` - Get all videos
- `POST /audio` - Create audio entry
- `POST /videos` - Create video entry

### Generation
- `POST /generate` - Generate video from text (with Redis caching)

### Waitlist
- `POST /waitlist` - Join waitlist

## 🔧 Development

### Backend Development
```bash
cd wizetale-api
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend Development
```bash
cd wizetale-app
npm install
npm run dev
```

## 🎯 Features

### ✅ Implemented
- [x] FastAPI backend with CRUD operations
- [x] Supabase database integration
- [x] Redis caching for video generation
- [x] Waitlist functionality with email collection
- [x] Responsive landing page
- [x] Docker containerization
- [x] JWT authentication (basic)

### 🚧 In Progress
- [ ] AI video generation (Runway/Sora integration)
- [ ] Audio narration (ElevenLabs integration)
- [ ] Story generation (GPT-4 integration)
- [ ] File upload/download
- [ ] User authentication flow

### 📋 Planned
- [ ] Advanced caching strategies
- [ ] Analytics dashboard
- [ ] Admin panel
- [ ] Mobile app
- [ ] Multi-language support

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues:
1. Check the [Issues](https://github.com/your-repo/issues) page
2. Create a new issue with detailed description
3. Contact the development team

---

**Made with ❤️ for better education** # Trigger redeploy
