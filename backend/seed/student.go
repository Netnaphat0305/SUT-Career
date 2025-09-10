package seed

import (
	"fmt"
	"log"
	"math/rand"
	"time"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
	"github.com/KBook22/System-Analysis-and-Design/entity"
)

func SeedStudents(db *gorm.DB) {
	rand.Seed(time.Now().UnixNano())

	// นับว่านักศึกษามีกี่คนใน DB
	var count int64
	db.Model(&entity.Student{}).Count(&count)

	//  ถ้าครบ 30 แล้ว ไม่ต้อง seed เพิ่ม
	if count >= 30 {
		log.Println("ข้ามการ seed นักศึกษา: มีครบ 30 คนแล้ว")
		return
	}

	log.Printf("กำลัง seed นักศึกษาเพิ่ม... (มีอยู่แล้ว %d คน)\n", count)

	// ดึงข้อมูล Gender และ Bank จาก DB
	genders := []entity.Genders{}
	db.Find(&genders)

	banks := []entity.Banks{}
	db.Find(&banks)

	// คณะจริงใน มทส.
	faculties := []string{
		"วิศวกรรมศาสตร์",
		"เทคโนโลยีสารสนเทศ",
		"วิทยาศาสตร์",
		"เทคโนโลยีการเกษตร",
		"เทคโนโลยีการจัดการ",
		"แพทยศาสตร์",
		"พยาบาลศาสตร์",
		"สาธารณสุขศาสตร์",
		"ทันตแพทยศาสตร์",
		"สัตวแพทยศาสตร์",
	}

	// Skills 
	skills := []string{
		"พัฒนาเว็บด้วย Go + React",
		"ทำ Machine Learning",
		"วิเคราะห์ข้อมูล (Data Science)",
		"เขียนโปรแกรม Embedded IoT",
		"ดูแลระบบเครือข่ายและ Cyber Security",
		"ออกแบบ UX/UI",
		"พัฒนา Mobile App",
		"การตลาดดิจิทัล",
		"จัดการธุรกิจและบัญชี",
		"วิจัยด้านชีววิทยาประยุกต์",
		"ทำวิจัยทางวิศวกรรมวัสดุ",
		"ดูแลระบบฐานข้อมูล",
	}

	firstNames := []string{
		"เนตรนภัทร", "พนิดา", "ปาณิศา", "กิตติพงษ์", "วริศรา",
		"ชุติมา", "จิรพัฒน์", "ฐิติพร", "ศิริกาญจน์", "นพรัตน์",
		"อารยา", "ณัฐวุฒิ", "ปิยพร", "ธีรภัทร", "กชพร",
		"ศุภวิชญ์", "ธนพร", "พัชราภรณ์", "จิราพร", "ปวีณา",
		"ทศพล", "ศิริวรรณ", "ปรเมศวร์", "ธันวา", "ภาณุเดช",
		"สุทธิดา", "กันตินันท์", "ฐาปกรณ์", "พิมพ์ชนก", "กฤติเดช",
	}

	lastNames := []string{
		"ชำนินอก", "โต๊ะเหลือ", "เกียรติสุทธิ์", "ปัญญาวุฒิ", "บุญญานันท์",
		"ศรีสุวรรณ", "อัครวิชัย", "จันทร์ทอง", "ศรีสวัสดิ์", "สมานทอง",
		"จงรักษ์", "สุวรรณโชติ", "กาญจนพงศ์", "สุขเจริญ", "แสงประเสริฐ",
		"สุนทรวิภาต", "กุศลมโนมัย", "วรรณนิกูล", "วิชัยวัฒน์", "ธนานนท์",
		"ศักดิ์สวัสดิ์", "ทองมาก", "วงศ์สุวรรณ", "ศรีสุข", "พงษ์สวัสดิ์",
		"กิตติวัฒน์", "วัฒนศิริ", "พงศ์ประเสริฐ", "บุญสวัสดิ์", "ศรีปัญญา",
	}

	// เริ่ม seed ตั้งแต่ count+1 จนครบ 30 คน
	for i := int(count) + 1; i <= 30; i++ {
		username := fmt.Sprintf("B66%04d", i) //ex B660002
		email := fmt.Sprintf("%s@gmail.com", username)
		idCard := fmt.Sprintf("%04d", i) //ex 0002
		password, _ := bcrypt.GenerateFromPassword([]byte(idCard), 14)

		// สร้าง User ก่อน
		user := entity.User{
			Username: username,
			Password: string(password),
			Role:     "student",
		}
		db.FirstOrCreate(&user, entity.User{Username: username})

		// ใช้ user.ID จริง
		faculty := faculties[rand.Intn(len(faculties))]
		birthday := time.Date(2001+rand.Intn(5), time.Month(rand.Intn(12)+1), rand.Intn(28)+1, 0, 0, 0, 0, time.UTC)

		var genderID uint
		if len(genders) > 0 {
			genderID = genders[rand.Intn(len(genders))].ID
		}

		var bankID uint
		if len(banks) > 0 {
			bankID = banks[rand.Intn(len(banks))].ID
		}

		student := entity.Student{
			Email:       email,
			FirstName:   firstNames[i-1],
			LastName:    lastNames[i-1],
			Birthday:    birthday,
			Age:         time.Now().Year() - birthday.Year(),
			GPA:         2.5 + float32(rand.Intn(15))/10,
			Year:        1 + rand.Intn(4),
			Faculty:     faculty,
			Phone:       fmt.Sprintf("08%08d", rand.Intn(99999999)),
			Skills:      skills[rand.Intn(len(skills))],
			UserID:      user.ID,
			GenderID:    genderID,
			BankAccount: fmt.Sprintf("86302118%02d", i),
			BankID:      bankID,
		}
		db.FirstOrCreate(&student, entity.Student{Email: email})
	}

	log.Println(" Seeded SUT students successfully (รวมครบ 30 คน)")
}
