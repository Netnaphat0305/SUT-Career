# Stage 1: Build โค้ด Go ให้กลายเป็นไฟล์ระบบที่ทำงานได้ (Binary)
# แก้ไขตรงนี้: เปลี่ยนจาก 1.23-alpine เป็น 1.26-alpine (หรือ 1.25-alpine) เพื่อให้ครอบคลุมตามที่ go.mod ต้องการ
FROM golang:1.26-alpine AS builder

WORKDIR /app

# คัดลอกไฟล์จัดการโมดูล
COPY go.mod go.su[m] ./
RUN go mod download

# คัดลอกซอร์สโค้ดหลังบ้านทั้งหมดเข้ามา
COPY . .

# สั่ง Build โค้ด Go ให้เป็นไฟล์ชื่อ main
RUN CGO_ENABLED=0 GOOS=linux go build -o main .


# Stage 2: ดึงเอาเฉพาะไฟล์ระบบมาเซ็ตตัวรัน
FROM alpine:latest

WORKDIR /root/

# ดึงไฟล์ที่ build เสร็จแล้วมาจาก Stage 1
COPY --from=builder /app/main .

# คัดลอกโฟลเดอร์ static และ uploads สำหรับเก็บรูป/ไฟล์
COPY --from=builder /app/static ./static
COPY --from=builder /app/uploads ./uploads

# ประกาศพอร์ตที่ API ของคุณเปิดใช้งาน
EXPOSE 8080

# สั่งให้ระบบรันหลังบ้านทันทีเมื่อตู้ Container เริ่มทำงาน
CMD ["./main"]