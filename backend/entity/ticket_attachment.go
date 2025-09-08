package entity

import "gorm.io/gorm"

type TicketAttachment struct {
	gorm.Model
	URL  string `json:"url"`
	Name string `json:"name"`
	Type string `json:"type"`

	// ✨ [แก้ไข] เปลี่ยนเป็น Pointer (*uint) เพื่อให้รับค่า nil ได้
	RequestTicketID *uint `json:"request_ticket_id,omitempty"`
	TicketReplyID   *uint `json:"ticket_reply_id,omitempty"`
}

func (TicketAttachment) TableName() string {
	return "ticket_attachments"
}

