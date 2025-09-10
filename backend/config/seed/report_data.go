package seed

import (
	"github.com/KBook22/System-Analysis-and-Design/entity"
	"gorm.io/gorm"
	"time"
)



func SeedReportData(db *gorm.DB) {


	//reprot status
	reprot_status := []entity.ReportStatus{
		{Model: gorm.Model{ID: 1}, Statusname: "submitted"},
		{Model: gorm.Model{ID: 2}, Statusname: "in_progress"},
		{Model: gorm.Model{ID: 3}, Statusname: "resolved"},
		
		
	}
	for _, b := range reprot_status {
		db.FirstOrCreate(&b, b.ID)
	}

	// เพิ่มตัวอย่างข้อมูล Report
    report1 := entity.Report{
    Model:          	gorm.Model{ID: 1},
    Title:          	"รายงานวันแรก",
    Datetime:           time.Date(2024, 8, 15, 10, 0, 0, 0, time.UTC),
    Place:          	"บริษัท A",
    Discription:    	"รายงานการทำงานวันแรก",
    UserID:         	1,
    ReportStatusID: 	1,
    AdminID:        	1,
	}
	report2 := entity.Report{
		Model:         	 	gorm.Model{ID: 2},
		Title:          	"รายงานวันที่สอง",
		Datetime:       	time.Date(2024, 8, 16, 10, 0, 0, 0, time.UTC),
		Place:          	"บริษัท B",
		Discription:    	"รายงานการทำงานวันที่สอง",
		UserID:         	2,
		ReportStatusID: 	2,
		AdminID:        	1,
	}
	db.FirstOrCreate(&report1, report1.ID)
	db.FirstOrCreate(&report2, report2.ID)
}


