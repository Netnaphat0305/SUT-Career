package seed

import (
	"github.com/KBook22/System-Analysis-and-Design/entity"
	"gorm.io/gorm"
	"time"
	"log"
)

// SeedInterviewScheduling และ Interview
func SeedInterviewScheduling(db *gorm.DB) {
	var count int64
	db.Model(&entity.InterviewScheduling{}).Count(&count)
	if count > 0 {
		log.Println("Seed skipped: InterviewScheduling already exists")
		return
	}

	// 🟢 สร้างตารางนัดสัมภาษณ์ของ Employer ID = 1
	schedules := []entity.InterviewScheduling{
		{
			Model:          gorm.Model{ID: 1},
			DateAndTimeStart: time.Now().Add(24 * time.Hour),         // พรุ่งนี้ 09:00
			DateAndTimeEnd:   time.Now().Add(24 * time.Hour).Add(time.Hour), // พรุ่งนี้ 10:00
			Status:         "available",
			Detail:         "สัมภาษณ์ออนไลน์ผ่าน Zoom",
			EmployerID:     1,
		},
		{
			Model:          gorm.Model{ID: 2},
			DateAndTimeStart: time.Now().Add(48 * time.Hour),         // มะรืน 13:00
			DateAndTimeEnd:   time.Now().Add(48 * time.Hour).Add(time.Hour), // มะรืน 14:00
			Status:         "booked",
			Detail:         "สัมภาษณ์ที่ออฟฟิศ",
			EmployerID:     1,
		},
	}

	for _, sched := range schedules {
		db.FirstOrCreate(&sched, entity.InterviewScheduling{Model: gorm.Model{ID: sched.ID}})
	}

	// 🟢 ผูก Interview ตัวอย่างกับ schedule ID 2 (ที่มี status = booked)
	interviews := []entity.Interview{
		{
			Model:                 gorm.Model{ID: 1},
			InterviewSchedulingID: 2,  // เชื่อมกับ schedule ID = 2
			StudentID:             8,  // นักศึกษาสมมุติ
			Status:                "Interviewed",
		},
	}

	for _, iv := range interviews {
		db.FirstOrCreate(&iv, entity.Interview{Model: gorm.Model{ID: iv.ID}})
	}

	log.Println("✅ Seeded InterviewScheduling & Interview successfully")
}
