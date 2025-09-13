package seed

import (
	"github.com/KBook22/System-Analysis-and-Design/entity"
	"gorm.io/gorm"
	"time"
)

func SeedPaymentData(db *gorm.DB) {

	// Banks
	banks := []entity.Banks{
		{Model: gorm.Model{ID: 1}, Bankname: "ธนาคารกรุงเทพ"},
		{Model: gorm.Model{ID: 2}, Bankname: "ธนาคารออมสิน"},
		{Model: gorm.Model{ID: 3}, Bankname: "ธนาคารกสิกรไทย"},
		{Model: gorm.Model{ID: 4}, Bankname: "ธนาคารกรุงไทย"},
		{Model: gorm.Model{ID: 5}, Bankname: "ธนาคารทหารไทยธนชาต"},
		{Model: gorm.Model{ID: 6}, Bankname: "ธนาคารไทยพาณิชย์"},
	}
	for _, b := range banks {
		db.FirstOrCreate(&b, b.ID)
	}

	// Payment Method
	paymentMethods := []entity.PaymentMethods{
		{Model: gorm.Model{ID: 1}, Methodname: "คิวอาร์โค้ด พร้อมเพย์"},
		{Model: gorm.Model{ID: 2}, Methodname: "โอนผ่านบัญชีธนาคาร"},
	}

	for _, pm := range paymentMethods {
		db.FirstOrCreate(&pm, pm.ID)
	}

	// Statuses
	paymentStatuses := []entity.Statuses{
		{Model: gorm.Model{ID: 1}, StatusName: "รอการชำระ"},
		{Model: gorm.Model{ID: 2}, StatusName: "รอตรวจสอบ"},
		{Model: gorm.Model{ID: 3}, StatusName: "ชำระแล้ว"},
		{Model: gorm.Model{ID: 4}, StatusName: "ล้มเหลว"},
	}
	for _, ps := range paymentStatuses {
		db.FirstOrCreate(&ps, ps.ID)
	}

	// Discounts
	discounts := []entity.Discounts{
		{
			Model:         gorm.Model{ID: 1},
			DiscountName:  "ส่วนลด 1%",
			DiscountValue: 1,
			Discounttype:  "percentage",
			ValidFrom:     time.Date(2025, 9, 1, 0, 0, 0, 0, time.UTC),
			ValidUntil:    time.Date(2025, 9, 15, 0, 0, 0, 0, time.UTC),
		},
		{
			Model:         gorm.Model{ID: 2},
			DiscountName:  "ส่วนลด 2%",
			DiscountValue: 2,
			Discounttype:  "percentage",
			ValidFrom:     time.Date(2025, 9, 1, 0, 0, 0, 0, time.UTC),
			ValidUntil:    time.Date(2025, 9, 30, 0, 0, 0, 0, time.UTC),
		},
		{
			Model:         gorm.Model{ID: 3},
			DiscountName:  "ส่วนลดเดือนกันยายน",
			DiscountValue: 5,
			Discounttype:  "percentage",
			ValidFrom:     time.Date(2025, 9, 1, 0, 0, 0, 0, time.UTC),
			ValidUntil:    time.Date(2025, 9, 30, 0, 0, 0, 0, time.UTC),
		},
		{
			Model:         gorm.Model{ID: 4},
			DiscountName:  "ส่วนลดวันเกิด",
			DiscountValue: 3,
			Discounttype:  "percentage",
			ValidFrom:     time.Date(2025, 9, 30, 0, 0, 0, 0, time.UTC),
			ValidUntil:    time.Date(2025, 9, 30, 0, 0, 0, 0, time.UTC),
		},
	}
	for _, d := range discounts {
		db.FirstOrCreate(&d, d.ID)
	}

	addonservices := []entity.AddonServices {
		{
			Model:             gorm.Model{ID: 1},
			AddonServicesName: "โปรโมทโพสต์งาน 7 วัน",
			Description:       "ทำให้โพสต์ของคุณแสดงผลเป็นอันดับแรกๆ ในหน้าค้นหางานเป็นเวลา 7 วัน",
			Price:             299.00,
			ValidFrom:         time.Date(2025, 9, 1, 0, 0, 0, 0, time.UTC),
			ValidUntil:        time.Date(2025, 9, 20, 0, 0, 0, 0, time.UTC),
		},
		{
			Model:             gorm.Model{ID: 2},
			AddonServicesName: "ติดป้ายประกาศ 'งานด่วน'",
			Description:       "เพิ่มป้าย 'ด่วน' สีแดงเด่นชัดบนประกาศงานของคุณเพื่อดึงดูดผู้สมัคร",
			Price:             99.00,
			ValidFrom:         time.Date(2025, 9, 2, 0, 0, 0, 0, time.UTC),
			ValidUntil:        time.Date(2025, 9, 2, 0, 0, 0, 0, time.UTC),
		},
		{
			Model:             gorm.Model{ID: 3},
			AddonServicesName: "ขึ้นเป็นบริษัทแนะนำประจำสัปดาห์",
			Description:       "โปรไฟล์บริษัทของคุณจะถูกแสดงในส่วน 'บริษัทแนะนำ' ที่หน้าแรกของเว็บไซต์เป็นเวลา 7 วัน",
			Price:             750.00,
			ValidFrom:         time.Date(2025, 10, 1, 0, 0, 0, 0, time.UTC),
			ValidUntil:        time.Date(2026, 10, 1, 0, 0, 0, 0, time.UTC),
		},
		{
			Model:             gorm.Model{ID: 4},
			AddonServicesName: "แพ็กเกจค้นหาผู้สมัคร (30 วัน)",
			Description:       "สิทธิ์ในการเข้าถึงและค้นหาโปรไฟล์ผู้สมัครในระบบได้โดยตรงเป็นเวลา 30 วัน",
			Price:             1250.00,
			ValidFrom:         time.Date(2025, 9, 1, 0, 0, 0, 0, time.UTC),
			ValidUntil:        time.Date(2027, 9, 1, 0, 0, 0, 0, time.UTC),
		},
	}
	for _, a := range addonservices {
		db.FirstOrCreate(&a, a.ID)
	}
};
