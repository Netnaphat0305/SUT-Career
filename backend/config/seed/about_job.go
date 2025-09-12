
package seed

import (
	"github.com/KBook22/System-Analysis-and-Design/entity"
	"gorm.io/gorm"
	"time"
    "fmt"
)

func SeedJobData(db *gorm.DB) {

	// --- JobPosts ---
    jobposts := []entity.Jobpost{
        {
            Model: gorm.Model{ID: 1}, Title: "พาร์ทไทม์ร้านบ้านชาบู", Description: "ทำงานช่วงเย็น 17.00 - 20.00 น.",
            Status: "Open", Salary: 250, EmployerID: 1, EmploymentTypeID: 2, SalaryTypeID: 3, JobCategoryID: 4,
        },
        {
            Model: gorm.Model{ID: 2}, Title: "ผู้ช่วยช่างภาพ", Description: "ถ่ายภาพสินค้าสำหรับลงเพจ",
            Status: "Open", Salary: 600, EmployerID: 1, EmploymentTypeID: 3, SalaryTypeID: 4, JobCategoryID: 10,
        },
        {
            Model: gorm.Model{ID: 3}, Title: "พนักงานครัว KFC", Description: "รับสมัครพนักงานครัว กะดึก",
            Deadline: time.Now().AddDate(0, 1, 0), Status: entity.Open, Salary: 12000, LocationJob: "เดอะมอลล์ โคราช",
            EmployerID: 2, JobCategoryID: 4, EmploymentTypeID: 2, SalaryTypeID: 1,
        },
        {
            Model: gorm.Model{ID: 4}, Title: "พนักงานขายตั๋วหนัง Major", Description: "พนักงานบริการลูกค้าหน้าเคาน์เตอร์",
            Deadline: time.Now().AddDate(0, 1, 0), Status: entity.Open, Salary: 11000, LocationJob: "เซ็นทรัล โคราช",
            EmployerID: 3, JobCategoryID: 7, EmploymentTypeID: 2, SalaryTypeID: 1,
        },
        {
            Model: gorm.Model{ID: 5}, Title: "ผู้ช่วยบรรณารักษ์", Description: "ช่วยจัดเรียงหนังสือและบริการนักศึกษา",
            Deadline: time.Now().AddDate(0, 0, 15), Status: entity.Open, Salary: 400, LocationJob: "มทส.",
            EmployerID: 4, JobCategoryID: 14, EmploymentTypeID: 3, SalaryTypeID: 3,
        },
        {
			Model:             gorm.Model{ID: 6},
			Title:             "หาคนทำวิทยานิพนธ์ ป.เอก ให้น้องชาย",
			Description:       "หาคนทำวิทยานิพนธ์ ป.เอก เกี่ยวกับด้านแบตเตอรี่รถ ev",
			Deadline:          time.Date(2025, 9, 15, 0, 0, 0, 0, time.UTC),
			Status:            entity.Open,
			ImageURL:          nil,
			PortfolioRequired: nil,
			Salary:            2,
			LocationJob:       "-",
			EmployerID:        5,
			JobCategoryID:     11,
			EmploymentTypeID:  2,
			SalaryTypeID:      2,
		},
    }
    for _, jp := range jobposts {
        key := entity.Jobpost{}
		key.ID = jp.ID
		if err := db.FirstOrCreate(&jp, key).Error; err != nil {
			fmt.Printf("[SEED ERR] %+v\n", err)
		}
    }

    // Create JobApplications (2 for each new post)
    jobApplications := []entity.JobApplication{
        // Applications for JobPost ID 3
        {
            Model:             gorm.Model{ID: 1},
            ApplicationStatus: entity.StatusPending, LastUpdate: time.Now(),
            ApplicationReason: "สนใจงานบริการและสามารถทำงานกะดึกได้ครับ",
            StudentID:         2, JobPostID: 3,
        },
        {
            Model:             gorm.Model{ID: 2},
            ApplicationStatus: entity.StatusPending, LastUpdate: time.Now(),
            ApplicationReason: "อยากหารายได้เสริมค่ะ มีประสบการณ์ร้านอาหาร",
            StudentID:         3, JobPostID: 3,
        },
        // Applications for JobPost ID 4
        {
            Model:             gorm.Model{ID: 3},
            ApplicationStatus: entity.StatusInterviewPending, LastUpdate: time.Now(),
            ApplicationReason: "ชอบดูหนังและมีใจรักบริการครับ",
            StudentID:         4, JobPostID: 4,
        },
        {
            Model:             gorm.Model{ID: 4},
            ApplicationStatus: entity.StatusPending, LastUpdate: time.Now(),
            ApplicationReason: "ต้องการประสบการณ์ทำงานบริการลูกค้าค่ะ",
            StudentID:         5, JobPostID: 4,
        },
        // Applications for JobPost ID 5
        {
            Model:             gorm.Model{ID: 5},
            ApplicationStatus: entity.StatusAccepted, LastUpdate: time.Now(),
            ApplicationReason: "สนใจงานในมหาวิทยาลัยและรักการอ่านค่ะ",
            StudentID:         6, JobPostID: 5,
        },
        {
            Model:             gorm.Model{ID: 6},
            ApplicationStatus: entity.StatusRejected, LastUpdate: time.Now(),
            ApplicationReason: "อยากทำงานพาร์ทไทม์ใน ม. ครับ",
            StudentID:         7, JobPostID: 5,
        },
    }
    for _, jobApp := range jobApplications {
        if err := db.FirstOrCreate(&jobApp, entity.JobApplication{
            Model: gorm.Model{ID: jobApp.ID},
		}).Error; err != nil {
			fmt.Println("Seed error:", err)
		}
    }
}
	





	


