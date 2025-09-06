package entity

import "gorm.io/gorm"

// TicketReply stores all subsequent replies for a RequestTicket.
type TicketReply struct {
	gorm.Model
	Message      string `gorm:"type:text;not null" json:"message"`
	IsStaffReply bool   `gorm:"default:false" json:"is_staff_reply"`
	TicketID     uint   `gorm:"not null" json:"ticket_id"`
	AuthorID     uint   `gorm:"not null" json:"author_id"`
	Author       User   `gorm:"foreignKey:AuthorID" json:"author"`

	// ✅ เพิ่มบรรทัดนี้เข้ามา
	Attachments  []TicketAttachment `gorm:"foreignKey:TicketReplyID" json:"attachments"`
}