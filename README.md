# Quiz Microservices Application

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

## 🎯 Tổng Quan

Hệ thống Quiz dựa trên kiến trúc microservices với NestJS, PostgreSQL và JWT Authentication.

### 🏗️ Kiến Trúc Microservices

```
quiz-gateway (Port 3000)          → API Gateway chính
├── auth-service (Port 3001)      → Xác thực & JWT
├── student (Port 3002)           → Quản lý user profile & lịch sử
├── quiz (Port 3003)              → CRUD quiz & câu hỏi
├── answer (Port 3004)            → Submit câu trả lời & chấm điểm
└── statistic (Port 3005)         → Thống kê & báo cáo
```

### 🎨 Chức Năng

#### Auth Service
- ✅ Đăng ký user
- ✅ Đăng nhập (JWT)
- ✅ Lấy thông tin profile
- ✅ Xác thực token

#### Student Service
- ✅ Xem profile
- ✅ Cập nhật profile
- ✅ Xem lịch sử làm quiz

#### Quiz Service
- ✅ Tạo quiz mới
- ✅ Xem danh sách quiz
- ✅ Xem chi tiết quiz
- ✅ Thêm câu hỏi vào quiz

#### Answer Service
- ✅ Bắt đầu làm quiz
- ✅ Submit câu trả lời
- ✅ Tính điểm tự động

#### Statistic Service
- ✅ Thống kê điểm số
- ✅ Lịch sử làm bài
- ✅ Ranking

### 📊 Database Schema

```
User
├── id (uuid)
├── email (unique)
├── password (hashed)
├── fullName
└── avatar

Quiz
├── id (uuid)
├── title
├── description
├── duration (minutes)
└── totalPoints

Question
├── id (uuid)
├── quizId (foreign key)
├── questionText
├── options (array)
├── correctAnswer
└── points

QuizAttempt
├── id (uuid)
├── userId (foreign key)
├── quizId (foreign key)
├── status (in_progress/completed/abandoned)
├── score
├── startedAt
└── completedAt

Answer
├── id (uuid)
├── attemptId (foreign key)
├── questionId (foreign key)
├── selectedAnswer
├── isCorrect
└── pointsEarned
```

## 🚀 Cài Đặt & Chạy

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- Docker & Docker Compose (optional)

### 1. Clone & Install

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

```bash
# Clone repository
git clone <your-repo>
cd quiz-microservices

# Install dependencies
npm install

# Copy environment file
cp .env.example .env.development
```

### 2. Cấu Hình Database

Cập nhật file `.env.development`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=quiz_db
JWT_SECRET=your-secret-key
```

### 3. Chạy với Docker Compose (Khuyến nghị)

```bash
# Build và start tất cả services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### 4. Chạy Local (Development)

```bash
# Start PostgreSQL trước
# Sau đó chạy từng service:

# Auth Service
npm run start:dev auth-service

# Student Service  
npm run start:dev student

# Quiz Service
npm run start:dev quiz

# Answer Service
npm run start:dev answer

# Statistic Service
npm run start:dev statistic

# API Gateway
npm run start:dev quiz-gateway
```

## 📡 API Endpoints

### Auth Service (Port 3001)

```bash
# Đăng ký
POST /auth/register
Body: { "email": "user@example.com", "password": "123456", "fullName": "John Doe" }

# Đăng nhập
POST /auth/login
Body: { "email": "user@example.com", "password": "123456" }

# Get Profile
GET /auth/profile
Header: Authorization: Bearer <token>
```

### Student Service (Port 3002)

```bash
# Get Profile
GET /students/profile
Header: Authorization: Bearer <token>

# Update Profile
PUT /students/profile
Header: Authorization: Bearer <token>
Body: { "fullName": "New Name", "avatar": "url" }

# Get Quiz History
GET /students/quiz-history
Header: Authorization: Bearer <token>
```

### Quiz Service (Port 3003)

```bash
# Get All Quizzes
GET /quizzes

# Get Quiz Detail
GET /quizzes/:id

# Create Quiz (Cần auth)
POST /quizzes
Header: Authorization: Bearer <token>
Body: {
  "title": "JavaScript Basics",
  "description": "Test your JS knowledge",
  "duration": 30,
  "totalPoints": 100
}

# Add Question (Cần auth)
POST /quizzes/:id/questions
Header: Authorization: Bearer <token>
Body: {
  "questionText": "What is closure?",
  "options": ["A", "B", "C", "D"],
  "correctAnswer": "A",
  "points": 10
}
```

## 🔧 Scripts Hữu Ích

```bash
# Build tất cả services
npm run build

# Run tests
npm run test

# Lint code
npm run lint

# Format code
npm run format
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
