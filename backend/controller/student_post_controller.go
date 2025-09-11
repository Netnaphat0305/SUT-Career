// package controller

// import (
// 	"log"
// 	"net/http"
// 	"strings"

// 	"github.com/KBook22/System-Analysis-and-Design/config"
// 	"github.com/KBook22/System-Analysis-and-Design/entity"
// 	"github.com/gin-gonic/gin"
// )

// // CreateStudentPost handles the creation of a new student post.
// func CreateStudentPost(c *gin.Context) {
// 	var payload struct {
// 		Title                string                           `json:"title" binding:"required"`
// 		EmploymentTypeID     uint                             `json:"employment_type_id" binding:"required"`
// 		Availability         string                           `json:"availability" binding:"required"`
// 		PreferredLocation    string                           `json:"preferred_location" binding:"required"`
// 		ExpectedCompensation string                           `json:"expected_compensation"`
// 		Introduction         string                           `json:"introduction"`
// 		PortfolioURL         string                           `json:"portfolio_url"`
// 		SkillIDs             []uint                           `json:"skill_ids"`
// 		NewSkills            []string                         `json:"new_skills"`
// 		Attachments          []entity.StudentPostAttachment   `json:"attachments"`
// 	}

// 	if err := c.ShouldBindJSON(&payload); err != nil {
// 		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid payload: " + err.Error()})
// 		return
// 	}

// 	userID, _ := c.Get("userID")
// 	var student entity.Student
// 	if err := config.DB().Where("user_id = ?", userID).First(&student).Error; err != nil {
// 		c.JSON(http.StatusNotFound, gin.H{"error": "Student profile not found"})
// 		return
// 	}

// 	tx := config.DB().Begin()
// 	if tx.Error != nil {
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to start transaction"})
// 		return
// 	}

// 	if len(payload.NewSkills) > 0 {
// 		for _, skillName := range payload.NewSkills {
// 			trimmedName := strings.TrimSpace(skillName)
// 			if trimmedName == "" {
// 				continue
// 			}
// 			var newSkill entity.Skill
// 			if err := tx.FirstOrCreate(&newSkill, entity.Skill{SkillName: trimmedName}).Error; err != nil {
// 				tx.Rollback()
// 				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to handle new skills"})
// 				return
// 			}
// 			payload.SkillIDs = append(payload.SkillIDs, newSkill.ID)
// 		}
// 	}

// 	post := entity.StudentPost{
// 		StudentID:            &student.ID,
// 		Title:                payload.Title,
// 		EmploymentTypeID:     &payload.EmploymentTypeID,
// 		Availability:         payload.Availability,
// 		PreferredLocation:    payload.PreferredLocation,
// 		ExpectedCompensation: payload.ExpectedCompensation,
// 		Introduction:         payload.Introduction,
// 		PortfolioURL:         payload.PortfolioURL,
// 		Status:               "active",
// 	}

// 	if len(payload.SkillIDs) > 0 {
// 		var skills []*entity.Skill
// 		if err := tx.Where("id IN ?", payload.SkillIDs).Find(&skills).Error; err != nil {
// 			tx.Rollback()
// 			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to find skills for association"})
// 			return
// 		}
// 		post.Skills = skills
// 	}

// 	if err := tx.Create(&post).Error; err != nil {
// 		tx.Rollback()
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create post"})
// 		return
// 	}

// 	if len(payload.Attachments) > 0 {
// 		for _, att := range payload.Attachments {
// 			attachment := entity.StudentPostAttachment{
// 				StudentPostID: post.ID,
// 				URL:           att.URL,
// 				Name:          att.Name,
// 				Type:          att.Type,
// 			}
// 			if err := tx.Create(&attachment).Error; err != nil {
// 				tx.Rollback()
// 				log.Printf("ERROR: Could not save attachment %s. Reason: %v\n", att.Name, err)
// 				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save one or more attachments"})
// 				return
// 			}
// 		}
// 	}

// 	if err := tx.Commit().Error; err != nil {
// 		tx.Rollback()
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": "Transaction commit failed"})
// 		return
// 	}

// 	config.DB().Preload("Student").Preload("Skills").Preload("Attachments").Preload("EmploymentType").First(&post, post.ID)
// 	c.JSON(http.StatusCreated, post)
// }

// // GetStudentPosts retrieves a list of all student posts.
// func GetStudentPosts(c *gin.Context) {
// 	var posts []entity.StudentPost
// 	if err := config.DB().Preload("Student.User").Preload("Skills").Preload("Attachments").Preload("EmploymentType").Order("created_at desc").Find(&posts).Error; err != nil {
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve student posts"})
// 		return
// 	}
// 	c.JSON(http.StatusOK, gin.H{"data": posts})
// }

// // GetStudentPostByID retrieves a single student post by its ID.
// func GetStudentPostByID(c *gin.Context) {
// 	id := c.Param("id")
// 	var post entity.StudentPost
// 	if err := config.DB().Preload("Student").Preload("Skills").Preload("Attachments").Preload("EmploymentType").First(&post, id).Error; err != nil {
// 		c.JSON(http.StatusNotFound, gin.H{"error": "Post not found"})
// 		return
// 	}
// 	c.JSON(http.StatusOK, post)
// }

// // GET /student-posts/student/:student_id
// // Get all posts for a specific student
// func GetStudentPostsByStudentID(c *gin.Context) {
// 	studentID := c.Param("student_id")
// 	var posts []entity.StudentPost

// 	// Find posts where student_id matches the parameter
// 	if err := config.DB().
// 		Preload("Student.User").
// 		Preload("Skills").
// 		Preload("Attachments").
// 		Preload("EmploymentType").
// 		Where("student_id = ?", studentID).
// 		Order("created_at desc").
// 		Find(&posts).Error; err != nil {
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve posts for student"})
// 		return
// 	}

// 	c.JSON(http.StatusOK, gin.H{"data": posts})
// }


// // UpdateStudentPost handles updating an existing student post.
// func UpdateStudentPost(c *gin.Context) {
// 	id := c.Param("id")
// 	var post entity.StudentPost
// 	if err := config.DB().First(&post, id).Error; err != nil {
// 		c.JSON(http.StatusNotFound, gin.H{"error": "Post not found"})
// 		return
// 	}

// 	var payload struct {
// 		Title                string                           `json:"title" binding:"required"`
// 		EmploymentTypeID     uint                             `json:"employment_type_id" binding:"required"`
// 		Availability         string                           `json:"availability" binding:"required"`
// 		PreferredLocation    string                           `json:"preferred_location" binding:"required"`
// 		ExpectedCompensation string                           `json:"expected_compensation"`
// 		Introduction         string                           `json:"introduction"`
// 		PortfolioURL         string                           `json:"portfolio_url"`
// 		SkillIDs             []uint                           `json:"skill_ids"`
// 		NewSkills            []string                         `json:"new_skills"`
// 		Attachments          []entity.StudentPostAttachment   `json:"attachments"`
// 	}

// 	if err := c.ShouldBindJSON(&payload); err != nil {
// 		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid payload: " + err.Error()})
// 		return
// 	}

// 	tx := config.DB().Begin()
// 	if tx.Error != nil {
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to start transaction"})
// 		return
// 	}

// 	if len(payload.NewSkills) > 0 {
// 		for _, skillName := range payload.NewSkills {
// 			trimmedName := strings.TrimSpace(skillName)
// 			if trimmedName == "" {
// 				continue
// 			}
// 			var newSkill entity.Skill
// 			if err := tx.FirstOrCreate(&newSkill, entity.Skill{SkillName: trimmedName}).Error; err != nil {
// 				tx.Rollback()
// 				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to handle new skills"})
// 				return
// 			}
// 			payload.SkillIDs = append(payload.SkillIDs, newSkill.ID)
// 		}
// 	}

// 	post.Title = payload.Title
// 	post.EmploymentTypeID = &payload.EmploymentTypeID
// 	post.Availability = payload.Availability
// 	post.PreferredLocation = payload.PreferredLocation
// 	post.ExpectedCompensation = payload.ExpectedCompensation
// 	post.Introduction = payload.Introduction
// 	post.PortfolioURL = payload.PortfolioURL

// 	var skills []*entity.Skill
// 	if len(payload.SkillIDs) > 0 {
// 		if err := tx.Where("id IN ?", payload.SkillIDs).Find(&skills).Error; err != nil {
// 			tx.Rollback()
// 			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to find skills for update"})
// 			return
// 		}
// 	}
// 	if err := tx.Model(&post).Association("Skills").Replace(skills); err != nil {
// 		tx.Rollback()
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update post skills"})
// 		return
// 	}

// 	if err := tx.Where("student_post_id = ?", post.ID).Delete(&entity.StudentPostAttachment{}).Error; err != nil {
// 		tx.Rollback()
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to remove old attachments"})
// 		return
// 	}
// 	if len(payload.Attachments) > 0 {
// 		for _, att := range payload.Attachments {
// 			attachment := entity.StudentPostAttachment{
// 				StudentPostID: post.ID,
// 				URL:           att.URL,
// 				Name:          att.Name,
// 				Type:          att.Type,
// 			}
// 			if err := tx.Create(&attachment).Error; err != nil {
// 				tx.Rollback()
// 				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save new attachments"})
// 				return
// 			}
// 		}
// 	}

// 	if err := tx.Save(&post).Error; err != nil {
// 		tx.Rollback()
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update post"})
// 		return
// 	}

// 	if err := tx.Commit().Error; err != nil {
// 		tx.Rollback()
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": "Transaction commit failed"})
// 		return
// 	}

// 	config.DB().Preload("Student").Preload("Skills").Preload("Attachments").Preload("EmploymentType").First(&post, post.ID)
// 	c.JSON(http.StatusOK, post)
// }

// // DeleteStudentPost handles the deletion of a student post.
// func DeleteStudentPost(c *gin.Context) {
// 	id := c.Param("id")

// 	tx := config.DB().Begin()
// 	if tx.Error != nil {
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to start transaction"})
// 		return
// 	}

// 	if err := tx.Exec("DELETE FROM student_post_skills WHERE student_post_id = ?", id).Error; err != nil {
// 		tx.Rollback()
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete skill associations"})
// 		return
// 	}

// 	if err := tx.Where("student_post_id = ?", id).Delete(&entity.StudentPostAttachment{}).Error; err != nil {
// 		tx.Rollback()
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete attachments"})
// 		return
// 	}

// 	if err := tx.Delete(&entity.StudentPost{}, id).Error; err != nil {
// 		tx.Rollback()
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete the post"})
// 		return
// 	}

// 	if tx.RowsAffected == 0 {
// 		tx.Rollback()
// 		c.JSON(http.StatusNotFound, gin.H{"error": "Post not found"})
// 		return
// 	}

// 	if err := tx.Commit().Error; err != nil {
// 		tx.Rollback()
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": "Transaction commit failed"})
// 		return
// 	}

// 	c.JSON(http.StatusOK, gin.H{"message": "Post deleted successfully"})
// }

package controller

import (
	"log"
	"net/http"
	"strings"

	"github.com/KBook22/System-Analysis-and-Design/config"
	"github.com/KBook22/System-Analysis-and-Design/entity"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// CreateStudentPost handles the creation of a new student post.
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

	tx := config.DB().Begin()
	if tx.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to start transaction"})
		return
	}

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

	if len(payload.SkillIDs) > 0 {
		var skills []*entity.Skill
		if err := tx.Where("id IN ?", payload.SkillIDs).Find(&skills).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to find skills for association"})
			return
		}
		post.Skills = skills
	}

	if err := tx.Create(&post).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create post"})
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
				log.Printf("ERROR: Could not save attachment %s. Reason: %v\n", att.Name, err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save one or more attachments"})
				return
			}
		}
	}

	if err := tx.Commit().Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Transaction commit failed"})
		return
	}

	config.DB().Preload("Student").Preload("Skills").Preload("Attachments").Preload("EmploymentType").First(&post, post.ID)
	c.JSON(http.StatusCreated, post)
}

// GetStudentPosts retrieves a list of all student posts.
func GetStudentPosts(c *gin.Context) {
	var posts []entity.StudentPost
	if err := config.DB().Preload("Student.User").Preload("Skills").Preload("Attachments").Preload("EmploymentType").Order("created_at desc").Find(&posts).Error; err != nil {
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

// GET /student-posts/student/:student_id
// Get all posts for a specific student
func GetStudentPostsByStudentID(c *gin.Context) {
	studentID := c.Param("student_id")
	var posts []entity.StudentPost

	// Find posts where student_id matches the parameter
	if err := config.DB().
		Preload("Student.User").
		Preload("Skills").
		Preload("Attachments").
		Preload("EmploymentType").
		Where("student_id = ?", studentID).
		Order("created_at desc").
		Find(&posts).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve posts for student"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": posts})
}


// UpdateStudentPost handles updating an existing student post.
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

	tx := config.DB().Begin()
	if tx.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to start transaction"})
		return
	}

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

	post.Title = payload.Title
	post.EmploymentTypeID = &payload.EmploymentTypeID
	post.Availability = payload.Availability
	post.PreferredLocation = payload.PreferredLocation
	post.ExpectedCompensation = payload.ExpectedCompensation
	post.Introduction = payload.Introduction
	post.PortfolioURL = payload.PortfolioURL

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

	if err := tx.Save(&post).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update post"})
		return
	}

	if err := tx.Commit().Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Transaction commit failed"})
		return
	}

	config.DB().Preload("Student").Preload("Skills").Preload("Attachments").Preload("EmploymentType").First(&post, post.ID)
	c.JSON(http.StatusOK, post)
}

// DeleteStudentPost handles the deletion of a student post.
func DeleteStudentPost(c *gin.Context) {
	id := c.Param("id")
	var post entity.StudentPost

	// Start a transaction for atomicity
	tx := config.DB().Begin()
	if tx.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to start transaction"})
		return
	}

	// 1. Check if the post exists.
	if err := tx.First(&post, id).Error; err != nil {
		tx.Rollback()
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Post not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to find the post"})
		return
	}

	// 2. Delete associations from the join table (student_post_skills).
	if err := tx.Model(&post).Association("Skills").Clear(); err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete skill associations"})
		return
	}

	// 3. Delete related one-to-many attachments directly.
	if err := tx.Where("student_post_id = ?", id).Delete(&entity.StudentPostAttachment{}).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete attachments"})
		return
	}

	// 4. Finally, delete the post itself.
	if err := tx.Delete(&entity.StudentPost{}, id).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete the post"})
		return
	}

	// Commit the transaction
	if err := tx.Commit().Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Transaction commit failed"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Post deleted successfully"})
}

