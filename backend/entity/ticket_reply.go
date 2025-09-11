package entity

import "gorm.io/gorm"

type TicketReply struct {
	gorm.Model
	Message string `json:"message"`

	RequestTicketID uint `json:"request_ticket_id"`

	AuthorID uint `json:"author_id"`
	Author   User `json:"author" gorm:"foreignKey:AuthorID"`

	IsStaffReply bool `json:"is_staff_reply" gorm:"default:false"`

	// ✨ เพิ่มความสัมพันธ์: Reply หนึ่งอันมีได้หลาย Attachments
	Attachments []TicketAttachment `json:"attachments,omitempty" gorm:"foreignKey:TicketReplyID"`
}

// TableName overrides the table name used by TicketReply to `ticket_replies`
func (TicketReply) TableName() string {
	return "ticket_replies"
}

