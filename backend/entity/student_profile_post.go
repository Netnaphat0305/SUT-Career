package entity

import (
	"gorm.io/gorm"
)

// StudentProfilePost dùng để lưu thông tin bài đăng tìm việc của sinh viên
type StudentProfilePost struct {
	gorm.Model

	
	// --- Foreign Key: สำหรับเชื่อมโยงไปยังโปรไฟล์นักศึกษา ---
	StudentID uint    `gorm:"not null" json:"student_id"`
	Student   Student `gorm:"foreignKey:StudentID" json:"student"`
}