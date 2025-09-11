// backend/controllers/student_controller.go

package controller

import (
	"net/http"
	"strconv"
	"time"

	"github.com/KBook22/System-Analysis-and-Design/config"
	"github.com/KBook22/System-Analysis-and-Design/entity"
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
		Birthday:  time.Now(), // Default value
		Age:       0,          // Default value
		GPA:       0.0,        // Default value
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

// GET /students/:id
// ดึงข้อมูลนักศึกษาตาม ID
func GetStudentByID(c *gin.Context) {
	id := c.Param("id")
	var student entity.Student

	// Preload associations to get related data like User, Gender, Bank
	if err := config.DB().Preload("User").Preload("Gender").Preload("Bank").First(&student, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Student not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve student data"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": student})
}

type ProfileResponse struct {
	Student entity.Student       `json:"student"`
	Posts   []entity.StudentPost `json:"posts"`
}

// GET /api/students
func GetAllStudents(c *gin.Context) {
	var students []entity.Student
	if err := config.DB().Find(&students).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Cannot retrieve students"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": students})
}

// GET /api/students/user/:userId
func GetStudentByUserID(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("userId"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	var student entity.Student
	if err := config.DB().Where("user_id = ?", id).First(&student).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Student not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": student})
}

// GET /profile
func GetMyProfile(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not identified"})
		return
	}

	var studentProfile entity.Student
	if err := config.DB().Preload("User").Where("user_id = ?", userID).First(&studentProfile).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Student profile not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not retrieve profile"})
		return
	}

	var studentPosts []entity.StudentPost
	if err := config.DB().
		Preload("Skills").
		Preload("Attachments").
		Preload("EmploymentType").
		Where("student_id = ?", studentProfile.ID).
		Order("created_at desc").
		Find(&studentPosts).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not retrieve student posts"})
		return
	}

	response := ProfileResponse{
		Student: studentProfile,
		Posts:   studentPosts,
	}


	c.JSON(http.StatusOK, response)

	c.JSON(http.StatusOK, gin.H{"data": response})
}

// 🔧 ⭐ เพิ่มใหม่: GET /profile/:studentId 
// ดูโปรไฟล์ของนักศึกษาคนอื่นโดยใช้ student.ID
func GetProfileByStudentID(c *gin.Context) {
	studentID := c.Param("studentId")

	// Convert string to int
	id, err := strconv.Atoi(studentID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid student ID format"})
		return
	}

	var studentProfile entity.Student
	if err := config.DB().Preload("User").First(&studentProfile, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Student profile not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not retrieve profile"})
		return
	}

	var studentPosts []entity.StudentPost
	if err := config.DB().
		Preload("Skills").
		Preload("Attachments").
		Preload("EmploymentType").
		Where("student_id = ?", studentProfile.ID).
		Order("created_at desc").
		Find(&studentPosts).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not retrieve student posts"})
		return
	}

	response := ProfileResponse{
		Student: studentProfile,
		Posts:   studentPosts,
	}

	c.JSON(http.StatusOK, gin.H{"data": response})
}

// PUT /api/student/:id
func UpdateapplyStudent(c *gin.Context) {
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

// PUT /students/:id
// Update a student's profile
func UpdateStudent(c *gin.Context) {
	// Get student ID from URL
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid student ID"})
		return
	}

	// Get user ID from middleware context
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not identified"})
		return
	}

	// Find the student record to update
	var student entity.Student
	if err := config.DB().First(&student, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Student not found"})
		return
	}

	// Authorization check: Ensure the logged-in user owns this profile
	if student.UserID != userID.(uint) {
		c.JSON(http.StatusForbidden, gin.H{"error": "You are not authorized to edit this profile"})
		return
	}

	// Bind the incoming JSON to a temporary struct
	var payload entity.Student
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Update the student record with the new data from the payload
	student.FirstName = payload.FirstName
	student.LastName = payload.LastName
	student.Email = payload.Email
	student.Phone = payload.Phone
	student.Faculty = payload.Faculty
	student.Year = payload.Year
	student.Skills = payload.Skills
	student.ProfileImageUrl = payload.ProfileImageUrl // This allows updating the profile picture URL

	// Save the updated record to the database
	if err := config.DB().Save(&student).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update student profile"})
		return
	}

	// Return the updated student data
	c.JSON(http.StatusOK, gin.H{"data": student})

}
