# Stage 1: Build the Go application
FROM golang:1.23-alpine AS builder

WORKDIR /app

# คัดลอกและดาวน์โหลด dependencies
COPY go.mod go.sum ./
RUN go mod download

# คัดลอกซอร์สโค้ดทั้งหมดของ backend
COPY . .

# Build โค้ดให้กลายเป็นไฟล์สำหรับเอาไปรัน (Binary) ชื่อว่า "main"
RUN CGO_ENABLED=0 GOOS=linux go build -o main .

# Stage 2: Run the binary using a minimal base image
FROM alpine:latest

WORKDIR /root/

# ดึงไฟล์ที่ build เสร็จแล้วมาจาก Stage 1
COPY --from=builder /app/main .

# ⚠️ สำคัญมาก: คัดลอกโฟลเดอร์ static หรือโฟลเดอร์เก็บไฟล์ต่าง ๆ ตามที่ระบบในภาพแรกของคุณต้องการใช้
COPY --from=builder /app/static ./static

# ประกาศพอร์ตที่แอปของคุณใช้ (ปกติ Go ชอบใช้ 8080)
EXPOSE 8080

# สั่งให้ระบบรันไฟล์หลังบ้านทันทีเมื่อขึ้นคลาวด์
CMD ["./main"]