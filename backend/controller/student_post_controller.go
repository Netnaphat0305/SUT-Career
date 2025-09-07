package controller

import (
	"log"
	"net/http"
	"strings" // เพิ่ม import "strings"

	"github.com/KBook22/System-Analysis-and-Design/config"
	"github.com/KBook22/System-Analysis-and-Design/entity"
	"github.com/gin-gonic/gin"
)

// ... (ฟังก์ชัน CreateStudentPost, GetStudentPosts, GetStudentPostByID ไม่ต้องแก้ไข) ...
func CreateStudentPost(c *gin.Context) {
	var payload struct {
		Title                string                           `json:"title" binding:"required"`
		JobType              string                           `json:"job_type" binding:"required"`
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
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID, _ := c.Get("userID")
	var student entity.Student
	if err := config.DB().Where("user_id = ?", userID).First(&student).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Student profile not found"})
		return
	}

	if len(payload.NewSkills) > 0 {
		for _, skillName := range payload.NewSkills {
			trimmedName := strings.TrimSpace(skillName)
			if trimmedName == "" {
				continue
			}
			var newSkill entity.Skill
			config.DB().FirstOrCreate(&newSkill, entity.Skill{SkillName: trimmedName})
			payload.SkillIDs = append(payload.SkillIDs, newSkill.ID)
		}
	}

	post := entity.StudentPost{
		StudentID:            &student.ID,
		Title:                payload.Title,
		JobType:              payload.JobType,
		Availability:         payload.Availability,
		PreferredLocation:    payload.PreferredLocation,
		ExpectedCompensation: payload.ExpectedCompensation,
		Introduction:         payload.Introduction,
		PortfolioURL:         payload.PortfolioURL,
		Status:               "active",
	}

	if len(payload.SkillIDs) > 0 {
		var skills []*entity.Skill
		config.DB().Where("id IN ?", payload.SkillIDs).Find(&skills)
		post.Skills = skills
	}

	if err := config.DB().Create(&post).Error; err != nil {
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
			if err := config.DB().Create(&attachment).Error; err != nil {
				log.Printf("ERROR: Could not save attachment %s. Reason: %v\n", att.Name, err)
				c.Error(err)
			} else {
				log.Printf("SUCCESS: Attachment '%s' saved successfully for Post ID %d.", att.Name, post.ID)
			}
		}
	}

	config.DB().Preload("Student").Preload("Skills").Preload("Attachments").First(&post, post.ID)
	c.JSON(http.StatusCreated, post)
}

func GetStudentPosts(c *gin.Context) {
	var posts []entity.StudentPost
	if err := config.DB().Preload("Student").Preload("Skills").Preload("Attachments").Order("created_at desc").Find(&posts).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve student posts"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": posts})
}

func GetStudentPostByID(c *gin.Context) {
	id := c.Param("id")
	var post entity.StudentPost
	if err := config.DB().Preload("Student").Preload("Skills").Preload("Attachments").First(&post, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Post not found"})
		return
	}
	c.JSON(http.StatusOK, post)
}


// PUT /student-posts/:id
// อัปเดตโพสต์หางาน
func UpdateStudentPost(c *gin.Context) {
	id := c.Param("id")
	var post entity.StudentPost
	if err := config.DB().First(&post, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Post not found"})
		return
	}

	var payload struct {
		Title                string                           `json:"title"`
		JobType              string                           `json:"job_type"`
		Availability         string                           `json:"availability"`
		PreferredLocation    string                           `json:"preferred_location"`
		ExpectedCompensation string                           `json:"expected_compensation"`
		Introduction         string                           `json:"introduction"`
		PortfolioURL         string                           `json:"portfolio_url"`
		SkillIDs             []uint                           `json:"skill_ids"`
		NewSkills            []string                         `json:"new_skills"` // ✅ [เพิ่ม] รับ Skill ใหม่
		Attachments          []entity.StudentPostAttachment   `json:"attachments"`
	}

	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// ✅ [เพิ่ม] Logic จัดการ Skill ใหม่ (เหมือนกับตอน Create)
	if len(payload.NewSkills) > 0 {
		for _, skillName := range payload.NewSkills {
			trimmedName := strings.TrimSpace(skillName)
			if trimmedName == "" {
				continue
			}
			var newSkill entity.Skill
			config.DB().FirstOrCreate(&newSkill, entity.Skill{SkillName: trimmedName})
			// เพิ่ม ID เข้าไปใน list ก่อนนำไปอัปเดต
			payload.SkillIDs = append(payload.SkillIDs, newSkill.ID)
		}
	}

	// อัปเดต fields
	post.Title = payload.Title
	post.JobType = payload.JobType
	post.Availability = payload.Availability
	post.PreferredLocation = payload.PreferredLocation
	post.ExpectedCompensation = payload.ExpectedCompensation
	post.Introduction = payload.Introduction
	post.PortfolioURL = payload.PortfolioURL

	// อัปเดต skills
	var skills []*entity.Skill
	if len(payload.SkillIDs) > 0 {
		config.DB().Where("id IN ?", payload.SkillIDs).Find(&skills)
	}
	if err := config.DB().Model(&post).Association("Skills").Replace(skills); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update post skills"})
		return
	}

	// อัปเดต Attachments (ลบของเก่าทิ้งทั้งหมดแล้วสร้างใหม่)
	config.DB().Where("student_post_id = ?", post.ID).Delete(&entity.StudentPostAttachment{})
	if len(payload.Attachments) > 0 {
		for _, att := range payload.Attachments {
			attachment := entity.StudentPostAttachment{
				StudentPostID: post.ID,
				URL:           att.URL,
				Name:          att.Name,
				Type:          att.Type,
			}
			config.DB().Create(&attachment)
		}
	}

	if err := config.DB().Save(&post).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update post"})
		return
	}

	config.DB().Preload("Student").Preload("Skills").Preload("Attachments").First(&post, post.ID)
	c.JSON(http.StatusOK, post)
}

// ... (ฟังก์ชัน DeleteStudentPost คงเดิม) ...
func DeleteStudentPost(c *gin.Context) {
	id := c.Param("id")
	
	config.DB().Exec("DELETE FROM student_post_skills WHERE student_post_id = ?", id)
	config.DB().Where("student_post_id = ?", id).Delete(&entity.StudentPostAttachment{})

	if tx := config.DB().Delete(&entity.StudentPost{}, id); tx.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Post not found"})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{"message": "Post deleted successfully"})
}