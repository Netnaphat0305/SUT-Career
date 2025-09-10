package controller

import (
	"net/http"

	"github.com/KBook22/System-Analysis-and-Design/config"
	"github.com/KBook22/System-Analysis-and-Design/entity"
	"github.com/gin-gonic/gin"
)

// GET /SalaryType
func ListSalaryType(c *gin.Context) {
	var salaryTypes []entity.SalaryType
	if err := config.DB().Find(&salaryTypes).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": salaryTypes})
}


// (optional) GET /SalaryType/:id
func GetSalaryTypeByID(c *gin.Context) {
	var salaryType entity.SalaryType
	id := c.Param("id")
	if err := config.DB().First(&salaryType, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "SalaryType not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": salaryType})
}

