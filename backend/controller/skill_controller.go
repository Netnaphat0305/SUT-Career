package controller

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/KBook22/System-Analysis-and-Design/config"
	"github.com/KBook22/System-Analysis-and-Design/entity"
)

// GET /skills
// List all skills
func ListSkills(c *gin.Context) {
	var skills []entity.Skill
	if err := config.DB().Find(&skills).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve skills"})
		return
	}
	c.JSON(http.StatusOK, skills)
}