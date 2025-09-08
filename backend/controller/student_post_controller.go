package controller

import (
	"log"
	"net/http"
	"strings"

	"github.com/KBook22/System-Analysis-and-Design/config"
	"github.com/KBook22/System-Analysis-and-Design/entity"
	"github.com/gin-gonic/gin"
)

// CreateStudentPost handles the creation of a new student post.
// It now uses a database transaction to ensure all operations (creating post, skills, attachments)
// are completed successfully or none are.
func CreateStudentPost(c *gin.Context) {
	var payload struct {
		Title                string                           `json:"title" binding:"required"`
		EmploymentTypeID     uint                             `json:"employment_type_id" binding:"required"`
		Availability         string                           `json:"availability" binding:"required"`
		PreferredLocation    string                           `json:"preferred_location" binding:"required"`
		ExpectedCompensation string                           `json:"expected_compensation"`
		Introduction         string                           `json:"introduction"`
		PortfolioURL         string                           `json:"portfolio_url"`
		SkillIDs             []uint                           `json:"skill_ids"`
		NewSkills            []string                         `json:"new_skills"`
		Attachments          []entity.StudentPostAttachment   `json:"attachments"`
	}

	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid payload: " + err.Error()})
		return
	}

	userID, _ := c.Get("userID")
	var student entity.Student
	if err := config.DB().Where("user_id = ?", userID).First(&student).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Student profile not found"})
		return
	}

	// Start a new database transaction
	tx := config.DB().Begin()
	if tx.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to start transaction"})
		return
	}

	// Handle new skills within the transaction
	if len(payload.NewSkills) > 0 {
		for _, skillName := range payload.NewSkills {
			trimmedName := strings.TrimSpace(skillName)
			if trimmedName == "" {
				continue
			}
			var newSkill entity.Skill
			// Use the transaction 'tx' for this operation
			if err := tx.FirstOrCreate(&newSkill, entity.Skill{SkillName: trimmedName}).Error; err != nil {
				tx.Rollback() // Rollback if skill creation fails
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to handle new skills"})
				return
			}
			payload.SkillIDs = append(payload.SkillIDs, newSkill.ID)
		}
	}

	post := entity.StudentPost{
		StudentID:            &student.ID,
		Title:                payload.Title,
		EmploymentTypeID:     &payload.EmploymentTypeID,
		Availability:         payload.Availability,
		PreferredLocation:    payload.PreferredLocation,
		ExpectedCompensation: payload.ExpectedCompensation,
		Introduction:         payload.Introduction,
		PortfolioURL:         payload.PortfolioURL,
		Status:               "active",
	}

	// Associate skills with the post within the transaction
	if len(payload.SkillIDs) > 0 {
		var skills []*entity.Skill
		if err := tx.Where("id IN ?", payload.SkillIDs).Find(&skills).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to find skills for association"})
			return
		}
		post.Skills = skills
	}

	// Create the post within the transaction
	if err := tx.Create(&post).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create post"})
		return
	}

	// Create attachments within the transaction
	if len(payload.Attachments) > 0 {
		for _, att := range payload.Attachments {
			attachment := entity.StudentPostAttachment{
				StudentPostID: post.ID,
				URL:           att.URL,
				Name:          att.Name,
				Type:          att.Type,
			}
			if err := tx.Create(&attachment).Error; err != nil {
				tx.Rollback()
				log.Printf("ERROR: Could not save attachment %s. Reason: %v\n", att.Name, err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save one or more attachments"})
				return
			}
		}
	}

	// If all operations were successful, commit the transaction
	if err := tx.Commit().Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Transaction commit failed"})
		return
	}

	// Reload the post with all associations to return the complete object
	config.DB().Preload("Student").Preload("Skills").Preload("Attachments").Preload("EmploymentType").First(&post, post.ID)
	c.JSON(http.StatusCreated, post)
}

// GetStudentPosts retrieves a list of all student posts.
func GetStudentPosts(c *gin.Context) {
	var posts []entity.StudentPost
	if err := config.DB().Preload("Student").Preload("Skills").Preload("Attachments").Preload("EmploymentType").Order("created_at desc").Find(&posts).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve student posts"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": posts})
}

// GetStudentPostByID retrieves a single student post by its ID.
func GetStudentPostByID(c *gin.Context) {
	id := c.Param("id")
	var post entity.StudentPost
	if err := config.DB().Preload("Student").Preload("Skills").Preload("Attachments").Preload("EmploymentType").First(&post, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Post not found"})
		return
	}
	c.JSON(http.StatusOK, post)
}

// UpdateStudentPost handles updating an existing student post.
// It uses a database transaction to ensure data integrity.
func UpdateStudentPost(c *gin.Context) {
	id := c.Param("id")
	var post entity.StudentPost
	if err := config.DB().First(&post, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Post not found"})
		return
	}

	var payload struct {
		Title                string                           `json:"title" binding:"required"`
		EmploymentTypeID     uint                             `json:"employment_type_id" binding:"required"`
		Availability         string                           `json:"availability" binding:"required"`
		PreferredLocation    string                           `json:"preferred_location" binding:"required"`
		ExpectedCompensation string                           `json:"expected_compensation"`
		Introduction         string                           `json:"introduction"`
		PortfolioURL         string                           `json:"portfolio_url"`
		SkillIDs             []uint                           `json:"skill_ids"`
		NewSkills            []string                         `json:"new_skills"`
		Attachments          []entity.StudentPostAttachment   `json:"attachments"`
	}

	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid payload: " + err.Error()})
		return
	}

	// Start a new database transaction
	tx := config.DB().Begin()
	if tx.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to start transaction"})
		return
	}

	// Handle new skills within the transaction
	if len(payload.NewSkills) > 0 {
		for _, skillName := range payload.NewSkills {
			trimmedName := strings.TrimSpace(skillName)
			if trimmedName == "" {
				continue
			}
			var newSkill entity.Skill
			if err := tx.FirstOrCreate(&newSkill, entity.Skill{SkillName: trimmedName}).Error; err != nil {
				tx.Rollback()
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to handle new skills"})
				return
			}
			payload.SkillIDs = append(payload.SkillIDs, newSkill.ID)
		}
	}

	// Update post fields
	post.Title = payload.Title
	post.EmploymentTypeID = &payload.EmploymentTypeID
	post.Availability = payload.Availability
	post.PreferredLocation = payload.PreferredLocation
	post.ExpectedCompensation = payload.ExpectedCompensation
	post.Introduction = payload.Introduction
	post.PortfolioURL = payload.PortfolioURL

	// Replace skill associations within the transaction
	var skills []*entity.Skill
	if len(payload.SkillIDs) > 0 {
		if err := tx.Where("id IN ?", payload.SkillIDs).Find(&skills).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to find skills for update"})
			return
		}
	}
	if err := tx.Model(&post).Association("Skills").Replace(skills); err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update post skills"})
		return
	}

	// Replace attachments within the transaction
	if err := tx.Where("student_post_id = ?", post.ID).Delete(&entity.StudentPostAttachment{}).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to remove old attachments"})
		return
	}
	if len(payload.Attachments) > 0 {
		for _, att := range payload.Attachments {
			attachment := entity.StudentPostAttachment{
				StudentPostID: post.ID,
				URL:           att.URL,
				Name:          att.Name,
				Type:          att.Type,
			}
			if err := tx.Create(&attachment).Error; err != nil {
				tx.Rollback()
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save new attachments"})
				return
			}
		}
	}

	// Save the updated post object itself
	if err := tx.Save(&post).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update post"})
		return
	}

	// If everything is successful, commit the transaction
	if err := tx.Commit().Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Transaction commit failed"})
		return
	}

	config.DB().Preload("Student").Preload("Skills").Preload("Attachments").Preload("EmploymentType").First(&post, post.ID)
	c.JSON(http.StatusOK, post)
}

// DeleteStudentPost handles the deletion of a student post and its associations.
func DeleteStudentPost(c *gin.Context) {
	id := c.Param("id")

	// Use a transaction to ensure all related data is deleted
	tx := config.DB().Begin()
	if tx.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to start transaction"})
		return
	}

	// Manually delete associations in the join table
	if err := tx.Exec("DELETE FROM student_post_skills WHERE student_post_id = ?", id).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete skill associations"})
		return
	}

	// Delete attachments
	if err := tx.Where("student_post_id = ?", id).Delete(&entity.StudentPostAttachment{}).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete attachments"})
		return
	}

	// Delete the post itself
	if err := tx.Delete(&entity.StudentPost{}, id).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete the post"})
		return
	}

	// Check if the post was actually found and deleted
	if tx.RowsAffected == 0 {
		tx.Rollback()
		c.JSON(http.StatusNotFound, gin.H{"error": "Post not found"})
		return
	}

	// Commit the transaction
	if err := tx.Commit().Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Transaction commit failed"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Post deleted successfully"})
}
