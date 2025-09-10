package seed

import (
    

    "github.com/KBook22/System-Analysis-and-Design/entity"
    "gorm.io/gorm"
)

func SeedMasterData(db *gorm.DB) {
    // EmploymentType
    employmentTypes := []entity.EmploymentType{
        {Model: gorm.Model{ID: 1}, EmploymentTypeName: entity.FullTime},
        {Model: gorm.Model{ID: 2}, EmploymentTypeName: entity.PartTime},
        {Model: gorm.Model{ID: 3}, EmploymentTypeName: entity.Freelance},
        {Model: gorm.Model{ID: 4}, EmploymentTypeName: entity.Contract},
    }
    for _, et := range employmentTypes {
        db.FirstOrCreate(&et, et.ID)
    }

    // SalaryTypes
    salaryTypes := []entity.SalaryType{
        {Model: gorm.Model{ID: 1}, SalaryTypeName: entity.Monthly},
        {Model: gorm.Model{ID: 2}, SalaryTypeName: entity.Hourly},
        {Model: gorm.Model{ID: 3}, SalaryTypeName: entity.Daily},
        {Model: gorm.Model{ID: 4}, SalaryTypeName: entity.ProjectBased},
    }
    for _, st := range salaryTypes {
        db.FirstOrCreate(&st, st.ID)
    }

    // JobCategories
    jobCategories := []entity.JobCategory{
        {Model: gorm.Model{ID: 1}, CategoryName: "ไอที / โปรแกรมมิ่ง / พัฒนาเว็บไซต์"},
        {Model: gorm.Model{ID: 2}, CategoryName: "ออกแบบ / กราฟิก / สื่อสร้างสรรค์"},
        {Model: gorm.Model{ID: 3}, CategoryName: "การตลาด / ขาย / โปรโมชัน"},
        {Model: gorm.Model{ID: 4}, CategoryName: "งานบริการ / พนักงานร้านอาหาร / คาเฟ่"},
        {Model: gorm.Model{ID: 5}, CategoryName: "ติวเตอร์ / สอนพิเศษ"},
        {Model: gorm.Model{ID: 6}, CategoryName: "อีเวนท์ / Staff / MC / แจกใบปลิว"},
        {Model: gorm.Model{ID: 7}, CategoryName: "พนักงานพาร์ทไทม์ห้างสรรพสินค้า"},
        {Model: gorm.Model{ID: 8}, CategoryName: "แปลภาษา / ล่าม / พิมพ์งาน"},
        {Model: gorm.Model{ID: 9}, CategoryName: "คอนเทนต์ครีเอเตอร์ / Social Media"},
        {Model: gorm.Model{ID: 10}, CategoryName: "งานช่างภาพ / ตัดต่อวิดีโอ"},
        {Model: gorm.Model{ID: 11}, CategoryName: "ธุรการ / เอกสาร / งานออฟฟิศ"},
        {Model: gorm.Model{ID: 12}, CategoryName: "ขนส่ง / จัดส่งสินค้า / แกร็บ"},
        {Model: gorm.Model{ID: 13}, CategoryName: "งานวิจัย / ร่วมทำโปรเจกต์"},
        {Model: gorm.Model{ID: 14}, CategoryName: "ช่วยงานวิชาการ / ผู้ช่วยอาจารย์"},
        {Model: gorm.Model{ID: 15}, CategoryName: "งานด้านสุขภาพ / พยาบาล / ผู้ช่วยแพทย์"},
        {Model: gorm.Model{ID: 16}, CategoryName: "เกษตร / ฟาร์ม / งานกลางแจ้ง"},
    }
    for _, jc := range jobCategories {
        db.FirstOrCreate(&jc, jc.ID)
    }

    // Genders
    genders := []entity.Genders{
        {Model: gorm.Model{ID: 1}, Gender: "ชาย"},
        {Model: gorm.Model{ID: 2}, Gender: "หญิง"},
        {Model: gorm.Model{ID: 3}, Gender: "ไม่ระบุ"},
    }
    for _, g := range genders {
        db.FirstOrCreate(&g, g.ID)
    }


	// Rating Scores
	ratingScores := []entity.Ratingscores{
		{Model: gorm.Model{ID: 1}, Ratingscorename: "แย่มาก"},
		{Model: gorm.Model{ID: 2}, Ratingscorename: "แย่"},
		{Model: gorm.Model{ID: 3}, Ratingscorename: "พอใช้"},
		{Model: gorm.Model{ID: 4}, Ratingscorename: "ดี"},
		{Model: gorm.Model{ID: 5}, Ratingscorename: "ยอดเยี่ยม"},
	}
	for _, rs := range ratingScores {
		db.FirstOrCreate(&rs, rs.ID)
	}

	
    // ... (สามารถเพิ่ม Master Data อื่นๆ ที่นี่ เช่น Ratingscores, Statuses) ...
}