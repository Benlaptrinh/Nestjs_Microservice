# Kiến Trúc & Hướng Dẫn Mở Rộng

## 📐 Kiến Trúc Tổng Quan

### Microservices Communication

```
Client/Browser
     ↓
API Gateway (quiz-gateway:3000)
     ↓
┌────┴────┬─────────┬──────────┬───────────┬───────────┐
↓         ↓         ↓          ↓           ↓           ↓
Auth   Student    Quiz     Answer    Statistic    ...More
:3001   :3002    :3003     :3004      :3005
  ↓       ↓         ↓          ↓           ↓
  └───────┴─────────┴──────────┴───────────┘
                    ↓
              PostgreSQL
```

### Shared Libraries

- **@app/database**: TypeORM entities & database module
- **@app/auth**: JWT authentication, guards, decorators
- **@app/util**: Common utilities

## 🔄 Luồng Hoạt Động

### 1. Authentication Flow

```
User → Gateway → Auth Service
                      ↓
                 Check credentials
                      ↓
                Generate JWT
                      ↓
            Return token to client
```

### 2. Quiz Flow

```
1. User đăng nhập → Nhận JWT token
2. User xem danh sách quiz → Quiz Service
3. User chọn quiz → Tạo QuizAttempt (Answer Service)
4. User trả lời câu hỏi → Submit answers (Answer Service)
5. Hệ thống chấm điểm → Tính toán điểm (Answer Service)
6. Lưu kết quả → QuizAttempt.status = completed
7. User xem lịch sử → Student Service
```

## 🚀 Hướng Dẫn Mở Rộng

### Thêm Microservice Mới

1. **Tạo service mới**:
```bash
nest generate app new-service
```

2. **Cấu hình trong nest-cli.json**:
```json
{
  "new-service": {
    "type": "application",
    "root": "apps/new-service",
    "entryFile": "main",
    "sourceRoot": "apps/new-service/src"
  }
}
```

3. **Setup microservice transport**:
```typescript
// apps/new-service/src/main.ts
app.connectMicroservice<MicroserviceOptions>({
  transport: Transport.TCP,
  options: {
    host: '0.0.0.0',
    port: 3006, // Port mới
  },
});
```

4. **Thêm vào docker-compose.yml**

### Thêm Entity Mới

1. **Tạo entity trong libs/database/src/entities/**:
```typescript
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('new_table')
export class NewEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;
}
```

2. **Export trong entities/index.ts**

3. **Sync database**: `DB_SYNC=true` sẽ tự động tạo table

### Thêm API Endpoint

1. **Tạo DTO**:
```typescript
// dto/create-something.dto.ts
export class CreateSomethingDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
```

2. **Thêm method trong service**:
```typescript
async createSomething(dto: CreateSomethingDto) {
  const entity = this.repository.create(dto);
  return this.repository.save(entity);
}
```

3. **Thêm controller endpoint**:
```typescript
@Post()
@UseGuards(JwtAuthGuard)
async create(@Body() dto: CreateSomethingDto) {
  return this.service.createSomething(dto);
}
```

## 🛡️ Security Best Practices

### 1. Environment Variables
- ✅ Không commit `.env.development` vào git
- ✅ Dùng `.env.example` làm template
- ✅ Dùng strong JWT secret trong production

### 2. Password Hashing
- ✅ Dùng bcrypt với salt rounds >= 10
- ✅ Không bao giờ log passwords

### 3. JWT Token
- ✅ Set expiration time hợp lý (24h)
- ✅ Implement refresh token cho production
- ✅ Validate token ở mọi protected route

### 4. Input Validation
- ✅ Dùng class-validator cho tất cả DTOs
- ✅ Enable whitelist để loại bỏ extra properties
- ✅ Transform input data

## 📈 Performance Optimization

### 1. Database
- Thêm indexes cho các columns thường query:
```typescript
@Index(['email'])
@Column({ unique: true })
email: string;
```

- Dùng eager/lazy loading hợp lý
- Implement pagination cho list APIs

### 2. Caching
- Thêm Redis cho caching (tương lai):
```typescript
@Injectable()
export class CacheService {
  async get(key: string) { }
  async set(key: string, value: any) { }
}
```

### 3. Load Balancing
- Deploy multiple instances của mỗi service
- Dùng Nginx/HAProxy cho load balancing
- Implement health check endpoints

## 🧪 Testing Strategy

### Unit Tests
```bash
npm run test
```

### E2E Tests
```bash
npm run test:e2e
```

### Load Testing
```bash
# Dùng Artillery hoặc k6
artillery quick --count 100 --num 1000 http://localhost:3000/quizzes
```

## 📊 Monitoring & Logging

### Thêm Logging
```typescript
import { Logger } from '@nestjs/common';

private readonly logger = new Logger(ServiceName.name);

this.logger.log('Something happened');
this.logger.error('Error occurred', trace);
```

### Health Checks
```typescript
@Get('health')
async health() {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
  };
}
```

## 🔮 Roadmap Tương Lai

### Phase 1 - Core Features ✅
- [x] Authentication & Authorization
- [x] Quiz CRUD
- [x] Answer submission & grading
- [x] User profile & history

### Phase 2 - Enhancement
- [ ] Real-time quiz với WebSocket
- [ ] File upload cho avatars
- [ ] Email notifications
- [ ] Quiz categories & tags
- [ ] Search & filter quizzes

### Phase 3 - Advanced
- [ ] Admin dashboard
- [ ] Analytics & reporting
- [ ] Quiz timer với automatic submit
- [ ] Leaderboard & ranking
- [ ] Quiz difficulty levels
- [ ] Question bank management

### Phase 4 - Scale
- [ ] Redis caching
- [ ] Message queue (RabbitMQ/Kafka)
- [ ] Elasticsearch for search
- [ ] CDN for static files
- [ ] Multi-language support

## 📚 Resources

- [NestJS Documentation](https://docs.nestjs.com)
- [TypeORM Documentation](https://typeorm.io)
- [PostgreSQL Best Practices](https://wiki.postgresql.org/wiki/Don't_Do_This)
- [Microservices Patterns](https://microservices.io/patterns/)

## 🤝 Contributing

1. Fork repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📝 License

MIT License - feel free to use for learning and commercial projects.
