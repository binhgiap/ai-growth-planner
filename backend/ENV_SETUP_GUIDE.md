# Environment Configuration Guide

## Quick Start

### 1. Copy `.env.example` to `.env`
```bash
cd backend
cp .env.example .env
```

### 2. Edit `.env` với cấu hình của bạn
```bash
# Chọn một trong ba option dưới
# Option 1: OpenAI (Mặc định)
# Option 2: OpenRouter (Khuyên dùng - chi phí thấp)
# Option 3: Ollama (Miễn phí - chạy local)
```

---

## Cấu Hình Chi Tiết

### 🔴 Option 1: OpenAI (Mặc Định)

**Setup:**
```properties
# .env
AI_PROVIDER=openai
OPENAI_API_KEY=sk-proj-YOUR_KEY_HERE
OPENAI_MODEL=gpt-4-turbo
```

**Lấy API Key:**
1. Truy cập: https://platform.openai.com/api-keys
2. Click "Create new secret key"
3. Copy key vào `OPENAI_API_KEY`

**Available Models:**
- `gpt-4-turbo` - Tốt nhất, chi phí cao
- `gpt-4` - Tốt, chi phí cao
- `gpt-3.5-turbo` - Nhanh, chi phí thấp

**Chi phí:**
- GPT-4 Turbo: ~$0.01-0.03 per 1K tokens
- GPT-3.5: ~$0.0005-0.0015 per 1K tokens

---

### 🟢 Option 2: OpenRouter (Khuyên Dùng)

**Setup:**
```properties
# .env
AI_PROVIDER=openrouter
OPENROUTER_API_KEY=sk-or-v1-YOUR_KEY_HERE
OPENROUTER_MODEL=openai/gpt-3.5-turbo
OPENROUTER_REFERER=http://localhost:3000
```

**Lấy API Key:**
1. Truy cập: https://openrouter.ai/keys
2. Click "Create API Key"
3. Copy key vào `OPENROUTER_API_KEY`

**Available Models:**
```properties
# Cheap & Fast
OPENROUTER_MODEL=openai/gpt-3.5-turbo
OPENROUTER_MODEL=mistralai/mistral-7b-instruct

# Balanced
OPENROUTER_MODEL=anthropic/claude-3-sonnet
OPENROUTER_MODEL=openai/gpt-4

# Best Quality
OPENROUTER_MODEL=anthropic/claude-3-opus
OPENROUTER_MODEL=openai/gpt-4-turbo
```

**Chi phí:**
- Rẻ hơn OpenAI 30-50%
- Có mô hình free (limited)
- Hỗ trợ 100+ mô hình

**Ưu điểm:**
- ✅ Rẻ hơn
- ✅ Nhiều mô hình lựa chọn
- ✅ Hỗ trợ fallback nếu API bị lỗi

---

### 🔵 Option 3: Ollama (Miễn Phí - Local)

**Installation:**
```bash
# macOS
brew install ollama

# Hoặc download: https://ollama.ai/download
```

**Start Ollama:**
```bash
ollama serve
# Ollama sẽ chạy tại http://localhost:11434
```

**Pull a Model:**
```bash
ollama pull llama2
# Hoặc
ollama pull mistral
ollama pull neural-chat
```

**Setup:**
```properties
# .env
AI_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama2
```

**Available Models:**
```bash
ollama list  # Liệt kê các mô hình đã cài
```

Popular Models:
- `llama2` - Meta's Llama2 (Tốt, chậm)
- `mistral` - Mistral AI (Nhanh, tốt)
- `neural-chat` - Intel Neural Chat (Cân bằng)
- `phi` - Microsoft Phi (Nhỏ, nhanh)

**Chi phí:**
- ✅ Hoàn toàn miễn phí
- ✅ Chạy local (không cần internet)
- ✅ Không giới hạn requests

**Yêu cầu:**
- ❌ Cần máy tính tốt (8GB+ RAM)
- ❌ Chậm hơn cloud API
- ❌ Chất lượng kém hơn GPT-4

---

## Bảng So Sánh

| Tiêu Chí | OpenAI | OpenRouter | Ollama |
|----------|--------|-----------|--------|
| **Chi phí** | Cao | Thấp (30-50% rẻ hơn) | Miễn phí |
| **Chất lượng** | Tốt nhất | Tốt (tuỳ mô hình) | Trung bình |
| **Tốc độ** | Nhanh | Nhanh | Chậm |
| **Setup** | Dễ | Dễ | Trung bình |
| **Yêu cầu** | API key | API key | Máy tốt |
| **Internet** | Cần | Cần | Không cần* |
| **Models** | 3-4 | 100+ | 10+ |
| **Khuyên dùng** | Production | Development | Testing |

---

## Các Bước Setup Cụ Thể

### Setup OpenAI
```bash
# 1. Copy template
cp .env.example .env

# 2. Edit .env
nano .env
# Sửa:
# AI_PROVIDER=openai
# OPENAI_API_KEY=sk-proj-YOUR_KEY_HERE
# OPENAI_MODEL=gpt-4-turbo

# 3. Start server
npm run start:dev
```

### Setup OpenRouter
```bash
# 1. Copy template
cp .env.example .env

# 2. Edit .env
nano .env
# Sửa:
# AI_PROVIDER=openrouter
# OPENROUTER_API_KEY=sk-or-v1-YOUR_KEY_HERE
# OPENROUTER_MODEL=openai/gpt-3.5-turbo
# OPENROUTER_REFERER=http://localhost:3000

# 3. Start server
npm run start:dev
```

### Setup Ollama
```bash
# 1. Install Ollama
brew install ollama

# 2. Start Ollama (in a separate terminal)
ollama serve

# 3. Pull model (in another terminal)
ollama pull mistral

# 4. Copy template
cp .env.example .env

# 5. Edit .env
nano .env
# Sửa:
# AI_PROVIDER=ollama
# OLLAMA_BASE_URL=http://localhost:11434
# OLLAMA_MODEL=mistral

# 6. Start server
npm run start:dev
```

---

## Tìm Hiểu Các Biến Environment

### Database
```properties
DATABASE_HOST=localhost          # Server PostgreSQL
DATABASE_PORT=5432              # Cổng PostgreSQL
DATABASE_USERNAME=postgres       # User PostgreSQL
DATABASE_PASSWORD=postgres       # Mật khẩu PostgreSQL
DATABASE_NAME=ai_growth_planner  # Database name
```

### Server
```properties
PORT=3000           # Cổng backend server
NODE_ENV=development # Environment (development/production)
```

### AI Provider
```properties
AI_PROVIDER=openai  # Chọn: openai, openrouter, ollama
```

### OpenAI
```properties
OPENAI_API_KEY=...      # API key từ platform.openai.com
OPENAI_MODEL=gpt-4-turbo # Model name
```

### OpenRouter
```properties
OPENROUTER_API_KEY=...         # API key từ openrouter.ai
OPENROUTER_MODEL=...            # Model ID (e.g., openai/gpt-3.5-turbo)
OPENROUTER_REFERER=...          # Your app domain
```

### Ollama
```properties
OLLAMA_BASE_URL=http://localhost:11434  # Ollama server URL
OLLAMA_MODEL=llama2                     # Model name
```

### JWT (tùy chọn)
```properties
JWT_SECRET=your_secret           # Secret key cho JWT tokens
JWT_EXPIRATION=7d                # Thời gian hết hạn (7d = 7 ngày)
```

### Application
```properties
APP_NAME=AI Growth Planner  # Tên ứng dụng
APP_VERSION=1.0.0           # Version
APP_URL=http://localhost:3000 # URL ứng dụng
```

---

## Lỗi Thường Gặp

### Error: OPENAI_API_KEY is required
**Lỗi:** Bạn set `AI_PROVIDER=openai` nhưng không có `OPENAI_API_KEY`
**Sửa:** Thêm API key từ https://platform.openai.com/api-keys

### Error: No endpoints found matching your data policy
**Lỗi:** OpenRouter model không available vì privacy settings
**Sửa:** Đổi sang model khác hoặc cấu hình privacy: https://openrouter.ai/settings/privacy

### Error: Cannot connect to Ollama
**Lỗi:** Ollama không chạy
**Sửa:** Chạy `ollama serve` trong terminal khác

### Error: Model not found
**Lỗi:** Model không tồn tại
**Sửa:** 
- Nếu OpenAI: Kiểm tra tên model có đúng không
- Nếu OpenRouter: Dùng `openai/gpt-3.5-turbo` hoặc liệt kê models
- Nếu Ollama: Chạy `ollama pull mistral`

---

## Best Practices

### Cho Development
```properties
AI_PROVIDER=ollama
# Hoặc
AI_PROVIDER=openrouter
OPENROUTER_MODEL=openai/gpt-3.5-turbo
```

### Cho Production
```properties
AI_PROVIDER=openai
OPENAI_MODEL=gpt-4-turbo
```

### Cho Testing
```properties
AI_PROVIDER=ollama
OLLAMA_MODEL=mistral  # Nhanh, nhẹ
```

---

## Testing Configuration

### Verify OpenAI
```bash
curl -s -X GET "https://api.openai.com/v1/models" \
  -H "Authorization: Bearer $OPENAI_API_KEY" | jq '.data | length'
```

### Verify OpenRouter
```bash
curl -s -X GET "https://openrouter.ai/api/v1/models" \
  -H "Authorization: Bearer $OPENROUTER_API_KEY" | jq '.data | length'
```

### Verify Ollama
```bash
curl -s http://localhost:11434/api/tags | jq '.models | length'
```

### Test Backend
```bash
curl http://localhost:3000/api/
# Kết quả: {"success":true,"data":"Hello World!","timestamp":"...","path":"/api/"}
```

---

## Tóm Tắt

1. **Copy `.env.example` to `.env`**
   ```bash
   cp .env.example .env
   ```

2. **Chọn AI Provider và cấu hình**
   - OpenAI: Thêm API key
   - OpenRouter: Thêm API key + model
   - Ollama: Cài đặt + start service

3. **Start Server**
   ```bash
   npm run start:dev
   ```

4. **Test**
   ```bash
   curl http://localhost:3000/api/
   ```

5. **Xem logs nếu có lỗi**
   ```bash
   npm run start:dev 2>&1 | grep ERROR
   ```

---

## Resources

- **OpenAI**: https://platform.openai.com
- **OpenRouter**: https://openrouter.ai
- **Ollama**: https://ollama.ai
- **Project Docs**: See `AI_PROVIDER_SETUP.md`
- **Troubleshooting**: See `OPENROUTER_TROUBLESHOOTING.md`
