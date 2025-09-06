package entity

import (
	"gorm.io/gorm"
)

// StudentPost เก็บข้อมูลโพสต์สำหรับประกาศหางานของนักศึกษา
type StudentPost struct {
	gorm.Model

	// --- ข้อมูลเฉพาะของโพสต์ ---
	Title                string `json:"title" gorm:"type:varchar(255);not null"`
	JobType              string `json:"job_type" gorm:"type:varchar(100);not null"`
	Availability         string `json:"availability" gorm:"type:varchar(255);not null"`
	PreferredLocation    string `json:"preferred_location" gorm:"type:varchar(255);not null"`
	ExpectedCompensation string `json:"expected_compensation" gorm:"type:text"`
	Introduction         string `json:"introduction" gorm:"type:text"`
	PortfolioURL         string `json:"portfolio_url" gorm:"type:varchar(500)"`
	Status               string `json:"status" gorm:"type:varchar(50);default:'active'"`

	// --- Foreign Key & Relations ---

	// 1. ความสัมพันธ์กับ Student (เจ้าของโพสต์)
	StudentID *uint   `json:"student_id" gorm:"not null"`
	Student   Student `json:"student" gorm:"foreignKey:StudentID;references:ID"`

	// 2. ความสัมพันธ์กับไฟล์แนบ
	Attachments []StudentPostAttachment `json:"attachments" gorm:"foreignKey:StudentPostID"`

	// ✅ 3. [เพิ่มใหม่] ความสัมพันธ์กับหมวดหมู่งาน
	JobCategoryID *uint       `json:"job_category_id"`
	JobCategory   JobCategory `json:"job_category" gorm:"foreignKey:JobCategoryID;references:ID"`
}

// กำหนดชื่อตารางให้ชัดเจน
func (StudentPost) TableName() string {
	return "student_posts"
}