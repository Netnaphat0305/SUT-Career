package entity

import(
	"gorm.io/gorm"
	"time"
)
type Employer struct{
	gorm.Model

	Firstname 		string		`json:"first_name"`
	Lastname 		string		`json:"last_name"`
	Email			string  	`json:"email"`
	CompanyName   	string   	`gorm:"type:varchar(100);not null" json:"company_name"`
	ContactPerson 	string    	`gorm:"type:varchar(100);not null" json:"contact_person"`
	Birthday  		time.Time  	`json:"birthday"`
	Phone         	string   	`gorm:"type:varchar(20);not null" json:"phone"`
	Address       	string    	`gorm:"type:text;not null" json:"address"`
	
   AvatarURL   		string 	`gorm:"type:varchar(255)" json:"avatar_url"` // เพิ่มฟิลด์รูป


	// FK
	UserID 	      	uint 		`gorm:"not null" json:"user_id"`
	User          	User 		`gorm:"foreignKey:UserID;references:ID" json:"user"`

	GenderID  	uint      	`json:"gender_id"`
   	Gender    	*Genders  	`gorm:"foreignKey: gender_id" json:"gender"`
}