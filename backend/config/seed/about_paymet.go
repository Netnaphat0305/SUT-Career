package seed

import (
    
	"time"
    "github.com/KBook22/System-Analysis-and-Design/entity"
    "gorm.io/gorm"
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
	paymentMethod := entity.PaymentMethods{
		Model:      gorm.Model{ID: 1},
		Methodname: "คิวอาร์โค้ด พร้อมเพย์",
	}
	db.FirstOrCreate(&paymentMethod, paymentMethod.ID)

	// Statuses
	paymentStatuses := []entity.Statuses{
		{Model: gorm.Model{ID: 1}, StatusName: "ค้างชำระ"},
		{Model: gorm.Model{ID: 2}, StatusName: "รอตรวจสอบ"},
		{Model: gorm.Model{ID: 3}, StatusName: "สำเร็จ"},
		{Model: gorm.Model{ID: 4}, StatusName: "ล้มเหลว"},
	}
	for _, ps := range paymentStatuses {
		db.FirstOrCreate(&ps, ps.ID)
	}
    
	// Discounts
	discounts := []entity.Discounts{
		{
			Model:         gorm.Model{ID: 1},
			DiscountName:  "ส่วนลด 10%",
			DiscountValue: 10,
			Discounttype:  "percentage",
			ValidFrom:     time.Date(2024, 8, 1, 0, 0, 0, 0, time.UTC),
			ValidUntil:    time.Date(2024, 8, 31, 0, 0, 0, 0, time.UTC),
		},
		{
			Model:         gorm.Model{ID: 2},
			DiscountName:  "ส่วนลด 15%",
			DiscountValue: 10,
			Discounttype:  "percentage",
			ValidFrom:     time.Date(2024, 9, 1, 0, 0, 0, 0, time.UTC),
			ValidUntil:    time.Date(2024, 9, 30, 0, 0, 0, 0, time.UTC),
		},
	}
	for _, d := range discounts {
		db.FirstOrCreate(&d, d.ID)
	}

		// Billable Items
	billableItems := []entity.BillableItems{
		{Model: gorm.Model{ID: 1}, Description: "ค่าจ้างพาร์ทไทม์ร้านชาบู", Amount: 250},
		{Model: gorm.Model{ID: 2}, Description: "ค่าบริการแพลตฟอร์ม", Amount: 50},
	}
	for _, bi := range billableItems {
		db.FirstOrCreate(&bi, bi.ID)
	}

	// Payment
	payment1 := entity.Payments{
		Model:            gorm.Model{ID: 1},
		Proof_of_Payment: "proof_01.jpg",
		Amount:           billableItems[0].Amount,
		Datetime:         time.Now().Add(-24 * time.Hour),
		BillableItemID:   billableItems[0].ID,
		PaymentMethodID:  paymentMethod.ID,
		StatusID:         paymentStatuses[1].ID,
	}
	db.FirstOrCreate(&payment1, payment1.ID)

}