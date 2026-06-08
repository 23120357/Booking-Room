# Database Setup Guide

## 1. Cài dependencies

```
cd backend
npm install knex pg dotenv
```

## 2. Cấu hình kết nối

Tạo file `.env`

Các biến được `knexfile.js` đọc: `DATABASE_URL`


## 3. Chạy migration

```
npx knex migrate:latest      # tạo toàn bộ 19 bảng
```

# 3-Bonus. Kiểm tra bước 3 (Không chạy cũng được)

```
npx knex migrate:rollback    # lùi lại 1 batch
npx knex migrate:status      # xem trạng thái
```

## 4. Nạp dữ liệu mẫu (seed)

```
npx knex seed:run            # chạy toàn bộ file trong db/seeds
```