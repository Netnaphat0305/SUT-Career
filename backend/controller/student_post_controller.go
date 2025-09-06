package controller

import (
	"net/http"

	"github.com/KBook22/System-Analysis-and-Design/config"
	"github.com/KBook22/System-Analysis-and-Design/entity"
	"github.com/gin-gonic/gin"
)

// POST /student-posts
// สร้างโพสต์หางานโดยนักศึกษา
func CreateStudentPost(c *gin.Context) {
	var post entity.StudentProfilePost
	if err := c.ShouldBindJSON(&post); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// 1. ดึง userID จาก Context ที่ Middleware ตั้งค่าไว้
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not identified"})
		return
	}

	// 2. ค้นหา Student ID จาก User ID
	var student entity.Student
	if err := config.DB().Where("user_id = ?", userID).First(&student).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Student profile not found for the logged-in user"})
		return
	}

	// 3. กำหนด StudentID ให้กับโพสต์และบันทึกลงฐานข้อมูล
	post.StudentID = student.ID
	if err := config.DB().Create(&post).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create student profile post"})
		return
	}

	// 4. ดึงข้อมูลโพสต์ที่เพิ่งสร้างพร้อมข้อมูลนักศึกษาเพื่อส่งกลับ
	if err := config.DB().Preload("Student").First(&post, post.ID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not retrieve the created post"})
		return
	}

	c.JSON(http.StatusCreated, post)
}

// GET /student-posts
// ดูโพสต์หางานทั้งหมดของนักศึกษา
func GetStudentPosts(c *gin.Context) {
	var posts []entity.StudentProfilePost
	if err := config.DB().Preload("Student").Order("created_at desc").Find(&posts).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve student posts"})
		return
	}
	c.JSON(http.StatusOK, posts)
}

// GET /student-posts/:id
// ดูโพสต์หางานตาม ID
func GetStudentPostByID(c *gin.Context) {
	id := c.Param("id")
	var post entity.StudentProfilePost
	if err := config.DB().Preload("Student").First(&post, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Post not found"})
		return
	}
	c.JSON(http.StatusOK, post)
}

// PUT /student-posts/:id
// อัปเดตโพสต์หางาน
func UpdateStudentPost(c *gin.Context) {
	id := c.Param("id")
	var post entity.StudentProfilePost
	if err := config.DB().First(&post, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Post not found"})
		return
	}

	if err := c.ShouldBindJSON(&post); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := config.DB().Save(&post).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update post"})
		return
	}

	c.JSON(http.StatusOK, post)
}

// DELETE /student-posts/:id
// ลบโพสต์หางาน
func DeleteStudentPost(c *gin.Context) {
	id := c.Param("id")
	if tx := config.DB().Exec("DELETE FROM student_profile_posts WHERE id = ?", id); tx.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Post not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Post deleted successfully"})
}