package entity

import (
	"time"
	"gorm.io/gorm"
)

type ChatHistory struct {
	gorm.Model
	MessageType string `json:"Message_Type"`
	Message string `json:"Message"`
	ImageURL string `json:"Image_URL"`
	TimeStampSend time.Time `json:"Time_Stamp_Send"`
	
	//sender
	UserID uint `gorm:"not null" json:"user_id"`
	User   User `gorm:"foreignKey:UserID" json:"user"`

	ChatRoomID uint `gorm:"not null"`
	ChatRoom *ChatRoom `gorm:"foreignKey:ChatRoomID" json:"Chat_Room_ID"`
}
