package controller

import (
	"net/http"

	"github.com/KBook22/System-Analysis-and-Design/config"
	"github.com/KBook22/System-Analysis-and-Design/entity"
	"github.com/gin-gonic/gin"
)

// GET /employmenttypes
func ListEmploymentTypes(c *gin.Context) {
	var types []entity.EmploymentType
	if err := config.DB().Find(&types).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": types})
}


// GET /employmenttypes/:id
func GetEmploymentTypeByID(c *gin.Context) {
	var employmentType entity.EmploymentType  
	id := c.Param("id")
	if err := config.DB().First(&employmentType, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Type not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": employmentType})
}


