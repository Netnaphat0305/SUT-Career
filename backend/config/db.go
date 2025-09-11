// backend/config/db.go
package config

import (
	"github.com/KBook22/System-Analysis-and-Design/entity"
	"github.com/KBook22/System-Analysis-and-Design/config/seed"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var db *gorm.DB

func DB() *gorm.DB {
	return db
}
func ConnectionDB() {
	database, err := gorm.Open(sqlite.Open("sa-project.db"), &gorm.Config{})
	if err != nil {
		panic("failed to connect database")
	}
	db = database
}

func SetupDatabase() {
	// Migrate the schema
	db.AutoMigrate(
		&entity.User{},
		&entity.Genders{},
		&entity.Employer{},
		&entity.Student{},
		&entity.Jobpost{},
		//add by Netnaphat
		&entity.EmploymentType{},
		&entity.SalaryType{},
		&entity.JobCategory{},
		&entity.JobApplication{},
		//
		&entity.Reviews{},
		&entity.Ratingscores{},
		&entity.Payments{},
		&entity.PaymentMethods{},
		&entity.BillableItems{},
		&entity.PaymentReports{},
		&entity.Statuses{},
		&entity.Banks{},
		&entity.Discounts{},
		&entity.Orders{},
		&entity.AddonServices{},
		//=========================
		
		&entity.ReportStatus{},//by supanut
		&entity.Report{},
		&entity.Admin{},
		&entity.Worklog{},

		//=========================
		&entity.Interview{}, //ขอเพิ่มหน่อยนะบุ๊คชั้นต้องใช้ถือว่ายังไงแกก็ต้องใช้
		&entity.InterviewScheduling{},


		//========================= Kittisak ====================
		&entity.ChatHistory{},
		&entity.ChatRoom{},
		//========================= Kittisak ====================
	)
}

func SeedDatabase() {
	seed.SeedMasterData(db)
	seed.SeedUsersAndProfiles(db)
	seed.SeedJobData(db)
	seed.SeedUsersAndProfiles(db)
	seed.SeedPaymentData(db)
	seed.SeedReportData(db)
	seed.Seedchat(db)
}

