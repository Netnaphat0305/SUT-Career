package entity

import (
	"time"
	"gorm.io/gorm"
)

type ChatRoom struct{
	gorm.Model
	Lastmessage string `json:"Last_Message"`

	LastMessageAt time.Time `json:"last_message_at"`

	StudentID uint
	Student *Student `gorm:"foreignKey: StudentID" json:"Student"`

	EmployerID uint
	Employer *Employer `gorm:"foreignKey: EmployerID" json:"Employer"`

	Message []ChatHistory `gorm:"foreignKey:ChatRoomID"`
}