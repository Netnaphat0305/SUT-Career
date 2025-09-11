// backend/entity/skill.go
package entity

import "gorm.io/gorm"

type Skill struct {
    gorm.Model
    SkillName string `gorm:"uniqueIndex;not null" json:"skill_name"`
}