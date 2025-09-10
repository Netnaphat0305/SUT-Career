package entity

import (
	"gorm.io/gorm"
)

type Location struct {
	gorm.Model
	LocationName  string `gorm:"type:varchar(255);not null" json:"location_name"`
	Address       string `gorm:"type:text;not null" json:"address"`
	City          string `gorm:"type:varchar(100);not null" json:"city"`
	Province      string `gorm:"type:varchar(100);not null" json:"province"`
	ProvinceCode  int    `gorm:"not null" json:"province_code"`
}
//อาจจะไม่ได้ใช้ตารางนี้มองว่ามันไม่ละเอียดแล้วก็ดูไม่จำเป็น อาจจะลบออก