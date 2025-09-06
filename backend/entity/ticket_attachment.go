package entity

import "gorm.io/gorm"

// TicketAttachment stores files related to a ticket or a reply.
type TicketAttachment struct {
	gorm.Model
	URL      string `gorm:"type:varchar(500);not null" json:"url"`
	Name     string `gorm:"type:varchar(255);not null" json:"name"`
	Type     string `gorm:"type:varchar(100);not null" json:"type"` // e.g., 'image/png', 'application/pdf'

	// --- Foreign Keys ---
	// เก็บ ID ของตั๋วหลักเสมอ
	RequestTicketID uint `gorm:"not null" json:"request_ticket_id"` 

	// เก็บ ID ของการตอบกลับ (ถ้าไฟล์นี้แนบมากับ reply)
	// ใช้ pointer (*uint) เพื่อให้เป็นค่าว่าง (NULL) ได้
	TicketReplyID *uint `json:"ticket_reply_id"`
}