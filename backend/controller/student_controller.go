// backend/controllers/student_controller.go
package controller

import (
	"net/http"
	"time"

	"github.com/KBook22/System-Analysis-and-Design/config"
	"github.com/KBook22/System-Analysis-and-Design/entity"
	"github.com/KBook22/System-Analysis-and-Design/services"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type StudentRegistrationPayload struct {
	// User fields
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`

	// Student fields
	FirstName string `json:"first_name" binding:"required"`
	LastName  string `json:"last_name" binding:"required"`
	Email     string `json:"email" binding:"required,email"`
	Phone     string `json:"phone" binding:"required"`
	Faculty   string `json:"faculty" binding:"required"`
	Year      int    `json:"year" binding:"required"`
}

// POST /register/student
func RegisterStudent(c *gin.Context) {
	var payload StudentRegistrationPayload
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	tx := config.DB().Begin()

	hashedPassword, err := config.HashPassword(payload.Password)
	if err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}

	user := entity.User{
		Username: payload.Username,
		Password: hashedPassword,
		Role:     entity.Stu,
	}

	if err := tx.Create(&user).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Username may already exist"})
		return
	}

	student := entity.Student{
		UserID:    user.ID,
		FirstName: payload.FirstName,
		LastName:  payload.LastName,
		Email:     payload.Email,
		Phone:     payload.Phone,
		Faculty:   payload.Faculty,
		Year:      payload.Year,
		Birthday:  time.Now(),
		Age:       0,
		GPA:       0.0,
	}

	if err := tx.Create(&student).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create student profile"})
		return
	}

	if err := tx.Commit().Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to commit transaction"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Student registration successful"})
}

// ✨ 1. แก้ไข Struct สำหรับ Response ที่นี่
type ProfileResponse struct {
	Student entity.Student            `json:"student"` // เปลี่ยนจาก StudentInfo -> Student และ json:"student_info" -> json:"student"
	Posts   []entity.StudentProfilePost `json:"posts"`
}

// GET /profile
func GetMyProfile(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not identified"})
		return
	}

	studentProfile, err := services.GetStudentProfileByUserID(userID.(uint))
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Student profile not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not retrieve profile"})
		return
	}

	studentPosts, err := services.GetStudentProfilePostsByStudentID(studentProfile.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not retrieve student posts"})
		return
	}
    
	// ✨ 2. แก้ไขการสร้าง Response ให้ตรงกับ Struct ใหม่
	response := ProfileResponse{
		Student: *studentProfile,
		Posts:   studentPosts,
	}

	c.JSON(http.StatusOK, response)
}

// PUT /api/student/:id
func UpdateStudent(c *gin.Context) {
    var student entity.Student
    id := c.Param("id")

    // ดึงข้อมูล student จาก DB
    if err := config.DB().First(&student, id).Error; err != nil {
        if err == gorm.ErrRecordNotFound {
            c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบนักศึกษา"})
            return
        }
        c.JSON(http.StatusInternalServerError, gin.H{"error": "เกิดข้อผิดพลาดในการค้นหาข้อมูล"})
        return
    }

    // Bind JSON จาก request body
    var input struct {
        FirstName string `json:"first_name"`
        LastName  string `json:"last_name"`
        Phone     string `json:"phone"`
        Birthday  string `json:"birthday"` // 👈 เปลี่ยนเป็น string
        Age       int    `json:"age"`
        Email     string `json:"email"`
        Faculty   string `json:"faculty"`
        Year      int    `json:"year"`
        GPA       float64 `json:"gpa"`
    }

    if err := c.ShouldBindJSON(&input); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    // ✅ แปลง string → time.Time อย่างถูกต้อง
    parsedBirthday, err := time.Parse("2006-01-02", input.Birthday)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "รูปแบบวันเกิดไม่ถูกต้อง"})
        return
    }

    // อัปเดตข้อมูลใน student struct
    student.FirstName = input.FirstName
    student.LastName = input.LastName
    student.Phone = input.Phone
    student.Birthday = parsedBirthday // ✅ ใช้ตัวแปร parsedBirthday ที่เพิ่งประกาศ
    student.Age = input.Age
    student.Email = input.Email
    student.Faculty = input.Faculty
    student.Year = input.Year
    student.GPA = float32(input.GPA)

    // บันทึกการเปลี่ยนแปลงลง DB
    if err := config.DB().Save(&student).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "เกิดข้อผิดพลาดในการอัปเดตข้อมูล"})
        return
    }

    c.JSON(http.StatusOK, gin.H{
        "message": "อัปเดตข้อมูลสำเร็จ",
        "data":    student,
    })
}
