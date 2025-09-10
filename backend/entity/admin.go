package entity

import(
	"gorm.io/gorm"
)
type Admin struct{
	gorm.Model
	Firstname 	string	`json:"first_name"`
	Lastname 	string	`json:"last_name"`
	Email		string  `json:"email"`
	Phone		string	`json:"phone"`
	Password    string  `json:"-"`

	Report 	[]Report    `gorm:"foreignKey:AdminID" json:"admin_id"`

}