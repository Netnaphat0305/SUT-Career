package entity

import "gorm.io/gorm"

type ChatRoom struct{
	gorm.Model
	Lastmessage string `json:"Last_Message"`
	
	StatusRoom string `gorm:"not null" json:"Status_Room"`
	WhoBlock string `json:"Who_Block"`

	StudentID uint
	Student *Student `gorm:"foreignKey: StudentID" json:"Student_ID"`

	EmployerID uint
	Employer *Employer `gorm:"foreignKey: EmployerID" json:"Employer_ID"`

	ChatHistory []ChatHistory `gorm:"foreignKey:ChatRoomID"`
}