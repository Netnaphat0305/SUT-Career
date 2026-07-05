// backend/config/db.go
package config

import (
	"github.com/KBook22/System-Analysis-and-Design/config/seed"
	"github.com/KBook22/System-Analysis-and-Design/entity"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var db *gorm.DB

func DB() *gorm.DB {
	return db
}

func ConnectionDB() {

	dsn := "postgresql://postgres.ildfvonvkrbtwullbsro:SutCareer2026@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
	// 🟢 ปรับตรงนี้: ใส่ SkipDefaultTransaction และ PrepareStmt: false เพื่อแก้ปัญหา Prepared Statement ตีกันบน Supabase
	database, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		SkipDefaultTransaction: true,
		PrepareStmt:            false,
	})
	if err != nil {
		panic("failed to connect database")
	}
	db = database
}

func SetupDatabase() {
	// 🟢 จัดลำดับการสร้างตาราง (Migrate) ใหม่ทั้งหมด: เอาตารางที่เป็นแม่ ไม่มี FK ขึ้นก่อนให้ครบถ้วน
	db.AutoMigrate(
		// Layer 1: ตารางพื้นฐานมากๆ (Master Data) ไม่มี FK ไปหาใครเลย
		&entity.Genders{},
		&entity.Banks{},
		&entity.Statuses{},
		&entity.ReportStatus{},
		&entity.EmploymentType{},
		&entity.SalaryType{},
		&entity.JobCategory{},
		&entity.PaymentMethods{},
		&entity.BillableItems{},
		&entity.Ratingscores{},
		&entity.Discounts{},
		&entity.AddonServices{},
		&entity.User{},
		&entity.Admin{},

		// Layer 2: ตารางที่เรียกใช้ไอดีจาก Layer 1
		&entity.Employer{}, // ผูกกับ User และ Gender
		&entity.Student{},  // ผูกกับ User, Gender และ Bank

		// Layer 3: ตารางระบบงานและฟีเจอร์อื่นๆ ที่ต้องอ้างอิง Student หรือ Employer
		&entity.Jobpost{},  // ผูกกับ Employer, JobCategory, EmploymentType, SalaryType
		&entity.JobApplication{},
		&entity.Reviews{},
		&entity.Payments{},
		&entity.PaymentReports{},
		&entity.Orders{},
		&entity.Report{},
		&entity.Worklog{},
		&entity.StudentPost{},
		&entity.Skill{},
		&entity.StudentPostAttachment{},
		&entity.FAQ{},
		&entity.FAQComment{},
		&entity.RequestTicket{},
		&entity.TicketReply{},
		&entity.TicketAttachment{},
		&entity.Notification{},
		&entity.Interview{},
		&entity.InterviewScheduling{},
		&entity.ChatHistory{},
		&entity.ChatRoom{},
	)
}

func SeedDatabase() {
	seed.SeedMasterData(db)
	seed.SeedUsersAndProfiles(db)
	seed.SeedJobData(db)
	seed.SeedPaymentData(db)
	seed.SeedReportData(db)
	seed.SeedInterviewScheduling(db)
}