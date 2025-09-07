package seed

import (
	"log"

	"gorm.io/gorm"
	"github.com/KBook22/System-Analysis-and-Design/entity"
)

// SeedSkills populates the database with skills phrased for student self-presentation.
func SeedSkills(db *gorm.DB) {

	skills := []entity.Skill{
		// --- กลุ่ม 1: Soft Skills (คุณสมบัติและนิสัย) ---
		{SkillName: "มีความรับผิดชอบสูง"},
		{SkillName: "เรียนรู้เร็ว / พร้อมเรียนรู้งาน"},
		{SkillName: "ทำงานเป็นทีมได้ดี"},
		{SkillName: "มีความคิดสร้างสรรค์"},
		{SkillName: "แก้ปัญหาเฉพาะหน้าได้"},
		{SkillName: "มนุษยสัมพันธ์ดี / เข้ากับคนง่าย"},
		{SkillName: "ตรงต่อเวลา"},
		{SkillName: "มีความกระตือรือร้น"},
		{SkillName: "มีความอดทน / ทำงานภายใต้แรงกดดันได้"},
		{SkillName: "สื่อสารและนำเสนอได้ดี (Presentation Skill)"},

		// --- กลุ่ม 2: Hard Skills (ความสามารถเชิงปฏิบัติ) ---
		{SkillName: "ใช้โปรแกรม Microsoft Office (Word, Excel, PowerPoint) ได้คล่อง"},
		{SkillName: "ใช้ Google Workspace (Docs, Sheets, Slides) ได้"},
		{SkillName: "ออกแบบกราฟิกเบื้องต้น (Canva, Photoshop)"},
		{SkillName: "ตัดต่อวิดีโอพื้นฐาน (CapCut, Premiere Pro)"},
		{SkillName: "บริหารจัดการ Social Media"},
		{SkillName: "ถ่ายภาพและวิดีโอ"},
		{SkillName: "วิเคราะห์ข้อมูลเบื้องต้น"},
		{SkillName: "แปลเอกสาร (อังกฤษ-ไทย)"},

		// --- กลุ่ม 3: ทักษะจากประสบการณ์และกิจกรรม ---
		{SkillName: "มีประสบการณ์ทำงานพาร์ทไทม์"},
		{SkillName: "เคยเป็นผู้นำกิจกรรม / ประธานชมรม"},
		{SkillName: "เคยเข้าร่วมค่ายอาสา"},
		{SkillName: "มีทักษะการขาย / แนะนำสินค้า"},
		{SkillName: "มีทักษะการสอน / ติวหนังสือ"},
		{SkillName: "จัดการงานอีเว้นท์"},
	}

	// ใช้ FirstOrCreate เพื่อป้องกันข้อมูลซ้ำ
	for _, s := range skills {
		db.FirstOrCreate(&s, entity.Skill{SkillName: s.SkillName})
	}

	log.Println("Self-presentation style skills have been seeded successfully!")
}