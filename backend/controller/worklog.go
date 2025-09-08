package controller


import (
	"net/http"
	"github.com/KBook22/System-Analysis-and-Design/config" 
	"github.com/KBook22/System-Analysis-and-Design/entity"
	"github.com/gin-gonic/gin"
	


)

func CreateWorklog(c *gin.Context) {
var worklog entity.Worklog
	if err := c.ShouldBindJSON(&worklog); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := config.DB().Create(&worklog).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "cannot create worklog"})
		return
	}
	c.JSON(http.StatusCreated, worklog)
}

// Get Student in Jobpost
func GetStudentInJobpost(c *gin.Context) {
	jobpostID := c.Param("id")

	var students []entity.Student
	if err := config.DB().
		Joins("JOIN worklogs ON worklogs.student_id = students.id").
		Where("worklogs.jobpost_id = ?", jobpostID).
		Find(&students).Error; err != nil {

		c.JSON(http.StatusInternalServerError, gin.H{"error": "cannot find students"})
		return
	}
	c.JSON(http.StatusOK, students)
}

//Get User by emplyerID
func GetUserByEmployerID(c *gin.Context) {
	employerid := c.Param("id")

	var user entity.User
	if err := config.DB().First(&user, employerid).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
		return
	}
	c.JSON(http.StatusOK, user)
}

//Get Worklog of Student
func GetWorklogStudent(c *gin.Context) {
	studentID := c.Param("id")

	var worklogs []entity.Worklog
	if err := config.DB().
		Where("student_id = ?", studentID).
		Preload("Jobpost").
		
		Find(&worklogs).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "cannot find worklogs"})
		return
	}
	c.JSON(http.StatusOK, worklogs)
}


// Update Worklog by ID
func UpdateWorklogByID(c *gin.Context) {
	id := c.Param("id")
	var worklog entity.Worklog

	if err := config.DB().First(&worklog, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "worklog not found"})
		return
	}

	if err := c.ShouldBindJSON(&worklog); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := config.DB().Save(&worklog).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "cannot update worklog"})
		return
	}

	c.JSON(http.StatusOK, worklog)
}

// Delete Worklog by ID
func DeleteWorklogID(c *gin.Context) {
	id := c.Param("id")

	if err := config.DB().Delete(&entity.Worklog{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "cannot delete worklog"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "deleted successfully"})
}