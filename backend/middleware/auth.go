// backend/middleware/auth.go
package middleware

import (
	"net/http"
	"strings"
	"log"

	"github.com/KBook22/System-Analysis-and-Design/config"
	"github.com/KBook22/System-Analysis-and-Design/entity"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

var JwtKey = []byte("your_very_secret_and_long_key_that_no_one_knows")

// Claims คือข้อมูลที่เราจะฝังไว้ใน Token
type Claims struct {
	Username string          `json:"username"`
	UserID   uint            `json:"user_id"`
	Role     entity.RoleEnum `json:"role"` // เพิ่ม Role เข้าไปใน Claims
	jwt.RegisteredClaims
}

// AuthMiddleware คือฟังก์ชันด่านตรวจของเรา
func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization header is required"})
			c.Abort()
			return
		}

		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		claims := &Claims{}

		token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
			return JwtKey, nil
		})

		if err != nil || !token.Valid {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
			c.Abort()
			return
		}

		//  ดึง userID และ role จาก token
		userID := claims.UserID
		role := claims.Role

		//  เก็บลง context
		c.Set("userID", userID)
		c.Set("username", claims.Username)
		c.Set("role", role)

		//  ถ้าเป็น employer → preload employerID ลง context
		if role == entity.Emp {
			var employer entity.Employer
			err := config.DB().Where("user_id = ?", userID).First(&employer).Error
			if err != nil {
				// log error เพื่อเช็ค ถ้าไม่เจอ employer record
				log.Printf("Employer not found for user_id %d: %v", userID, err)
			} else {
				// set employerID ใน context
				c.Set("employerID", employer.ID)
				log.Printf("Set employerID %d for user_id %d", employer.ID, userID)
			}
		}
		//  ถ้าเป็น student → preload studentID ลง context
		if role == entity.Stu {
			var student entity.Student
			if err := config.DB().
				Where("user_id = ?", userID).
				First(&student).Error; err == nil {
				c.Set("studentID", student.ID)
			}
		}

		c.Next()
	}
}

// AdminMiddleware ตรวจสอบทั้ง Token และ Role ของ Admin
func AdminMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// ตรวจสอบ Token ก่อน
		AuthMiddleware()(c)
		if c.IsAborted() {
			return
		}

		// ตรวจสอบ Role
		role, exists := c.Get("role")
		if !exists || role.(entity.RoleEnum) != entity.RoleAdmin { // <-- 🔄 แก้ไขชื่อตรงนี้
			c.JSON(http.StatusForbidden, gin.H{"error": "Admin access required"})
			c.Abort()
			return
		}

		c.Next()
	}
}
