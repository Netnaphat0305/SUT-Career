package entity

import "gorm.io/gorm"

// FAQ stores frequently asked questions and answers managed by admins.
type FAQ struct {
	gorm.Model
	Title           string        `gorm:"type:varchar(255);not null" json:"title"`
	Content         string        `gorm:"type:text;not null" json:"content"`
	AdminID         uint          `gorm:"not null" json:"admin_id"`
	ImageURL        *string       `gorm:"type:varchar(255)" json:"image_url,omitempty"`
	CommentsEnabled bool          `gorm:"default:false" json:"comments_enabled"`       // New field
	Comments        []*FAQComment `gorm:"foreignKey:FAQID" json:"comments,omitempty"` // New relation
}

// FAQComment stores comments for a specific FAQ.
type FAQComment struct {
	gorm.Model
	Content  string `gorm:"type:text;not null" json:"content"`
	AuthorID uint   `gorm:"not null" json:"author_id"`
	Author   User   `gorm:"foreignKey:AuthorID" json:"author"`
	FAQID    uint   `gorm:"not null" json:"faq_id"`
}
