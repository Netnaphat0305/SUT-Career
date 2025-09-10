package controller

import (
	"net/http"

	"github.com/KBook22/System-Analysis-and-Design/config"
	"github.com/KBook22/System-Analysis-and-Design/entity"
	"github.com/gin-gonic/gin"
)

// GET /jobcategories
func ListJobCategories(c *gin.Context) {
	var categories []entity.JobCategory
	if err := config.DB().Find(&categories).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": categories})
}


// (optional) GET /jobcategories/:id
func GetJobCategoryByID(c *gin.Context) {
	var category entity.JobCategory
	id := c.Param("id")
	if err := config.DB().First(&category, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Category not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": category})
}

