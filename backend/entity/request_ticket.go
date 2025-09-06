package entity

import (
    "gorm.io/gorm"
)

// RequestTicket represents the initial request submitted by a user.
type RequestTicket struct {
	gorm.Model
	Subject        string `gorm:"type:varchar(255);not null" json:"subject"`
	InitialMessage string `gorm:"type:text;not null" json:"initial_message"`
	Status         string `gorm:"type:varchar(50);default:'Open'" json:"status"`
	UserID         uint   `gorm:"not null" json:"user_id"`
	User           User   `gorm:"foreignKey:UserID" json:"user"`
	Replies        []TicketReply `gorm:"foreignKey:TicketID" json:"replies"`
	
	// ✅ เพิ่มบรรทัดนี้เข้ามา
	Attachments    []TicketAttachment `gorm:"foreignKey:RequestTicketID" json:"attachments"`
}