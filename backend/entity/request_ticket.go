package entity

import (
	"gorm.io/gorm"
)

type RequestTicket struct {
	gorm.Model
	Subject        string `json:"subject"`
	InitialMessage string `json:"initial_message"`
	Status         string `json:"status"`

	UserID uint `json:"user_id"`
	User   User `json:"user" gorm:"foreignKey:UserID"`

	// ✨ [แก้ไข] เพิ่ม gorm tag เพื่อระบุ Foreign Key
	Replies     []TicketReply     `json:"replies" gorm:"foreignKey:RequestTicketID"`
	Attachments []TicketAttachment `json:"attachments,omitempty" gorm:"foreignKey:RequestTicketID"`
}

func (RequestTicket) TableName() string {
	return "request_tickets"
}

