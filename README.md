# 🤖 AI-Powered MCQ System with Hugging Face

An intelligent Multiple Choice Question system that uses **Hugging Face AI models** to automatically generate questions and evaluate answers.

## 🚀 Features

### 🤖 **AI-Powered Question Generation**
- **Automatic MCQ Creation** using Hugging Face models
- **Topic-based Generation** (Math, Science, History, etc.)
- **Difficulty Levels** (Easy, Medium, Hard)
- **Smart Question Suggestions**

### 📚 **Lecturer Dashboard**
- Create papers manually or with AI assistance
- Generate questions from 8+ subject areas
- Real-time AI health monitoring
- Export results and analytics

### 🎓 **Student Interface**
- Take AI-generated MCQ tests
- Timed examinations with auto-submit
- Instant AI-powered feedback
- Performance tracking

### 🛠️ **Admin Panel**
- System-wide statistics
- User management
- AI service monitoring
- Database analytics

## 🏗️ **System Architecture**

### **4-Layer Architecture:**

1. **🗄️ Data Layer** - MongoDB with Mongoose ODM
2. **🔌 API Layer** - Express.js REST API with AI integration
3. **🧠 Business Logic** - AI services and auto-grading
4. **🎨 Presentation** - React with Tailwind CSS

## 🤖 **AI Integration**

### **Hugging Face Models Used:**
- **Question Generation**: `google/flan-t5-large`
- **Answer Evaluation**: `microsoft/deberta-v3-large`
- **Text Processing**: Various specialized models

### **AI Capabilities:**
- Generate contextual MCQ questions
- Evaluate open-ended answers
- Provide intelligent feedback
- Support multiple difficulty levels

## 🛠️ **Setup Instructions**

### **1. Prerequisites**
```bash
- Node.js 16+
- MongoDB
- Hugging Face API Key
```

### **2. Environment Setup**
```bash
# Clone and install
npm install

# Set up environment variables
cp .env.example .env
```

### **3. Configure .env**
```env
# Database
MONGODB_URI=mongodb://localhost:27017/mcq_system
JWT_SECRET=your_jwt_secret_key

# Hugging Face AI
HUGGINGFACE_API_KEY=your_huggingface_api_key
AI_QUESTION_MODEL=google/flan-t5-large
AI_GRADING_MODEL=microsoft/deberta-v3-large
```

### **4. Get Hugging Face API Key**
1. Go to [huggingface.co](https://huggingface.co)
2. Create account and get API key
3. Add to `.env` file

### **5. Start the System**
```bash
# Start both frontend and backend
npm run dev:full

# Or separately:
npm run server  # Backend only
npm run dev     # Frontend only
```

## 🎯 **Available AI Topics**

- **Mathematics** - Algebra, Geometry, Calculus
- **Science** - Physics, Chemistry, Biology  
- **History** - World History, Rwanda History
- **Geography** - Physical and Human Geography
- **English** - Grammar, Literature, Writing
- **Kinyarwanda** - Rwandan Language and Culture
- **Computer Science** - Programming, Algorithms
- **Economics** - Micro and Macro Economics

## 🔥 **Key AI Features**

### **Smart Question Generation**
```javascript
// Generate 5 medium-difficulty math questions
const questions = await aiService.generateMCQQuestions(
  'mathematics', 
  'medium', 
  5
);
```

### **Intelligent Answer Evaluation**
```javascript
// AI evaluates student answers
const evaluation = await aiService.evaluateAnswer(
  question, 
  correctAnswer, 
  studentAnswer
);
```

### **Real-time AI Health Monitoring**
- Monitor AI service status
- Fallback to manual questions if AI fails
- Performance metrics and usage tracking

## 📊 **System Benefits**

### **For Lecturers:**
- ⚡ **Save 90% time** on question creation
- 🎯 **Higher quality** AI-generated questions
- 📈 **Better analytics** and insights
- 🔄 **Consistent difficulty** levels

### **For Students:**
- 🤖 **Personalized** question difficulty
- 💬 **Intelligent feedback** on answers
- 📚 **Diverse question** types and topics
- ⏱️ **Immediate results** and scoring

### **For Administrators:**
- 📊 **Comprehensive analytics** dashboard
- 🔧 **System health** monitoring
- 👥 **User management** tools
- 🚀 **Scalable AI** infrastructure

## 🌍 **Perfect for Rwanda Schools**

- **Kinyarwanda language** support
- **Local curriculum** alignment
- **Offline-capable** design
- **Low-bandwidth** optimized
- **Cost-effective** AI solution

## 🚀 **Getting Started**

1. **Sign up** as Lecturer or Student
2. **Create your first paper** with AI assistance
3. **Generate questions** using AI
4. **Students take tests** and get instant feedback
5. **View analytics** and export results

## 🔧 **API Endpoints**

### **AI Endpoints:**
- `POST /api/ai/generate-questions` - Generate AI questions
- `GET /api/ai/topics` - Get available topics
- `POST /api/ai/evaluate-answer` - AI answer evaluation
- `GET /api/ai/health` - Check AI service status

### **Core Endpoints:**
- `POST /api/auth/login` - User authentication
- `GET /api/papers` - Get papers
- `POST /api/submissions` - Submit answers
- `GET /api/admin/stats` - System statistics

## 🎉 **Ready to Use!**

Your AI-powered MCQ system is now ready! The system combines the power of **Hugging Face AI** with a clean, user-friendly interface to create the perfect educational tool for Rwanda schools.

**Start generating intelligent questions and revolutionize your teaching! 🚀🤖**