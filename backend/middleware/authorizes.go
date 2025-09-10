// middleware/authorize.go
package middleware

import (
	"net/http"
	"strings"

	"github.com/KBook22/System-Analysis-and-Design/services"
	"github.com/gin-gonic/gin"
)

func Authorizes() gin.HandlerFunc {
	return func(c *gin.Context) {
		auth := c.GetHeader("Authorization")
		var token string

		// 1) ลองจาก Authorization header
		if strings.HasPrefix(strings.ToLower(auth), "bearer ") {
			token = strings.TrimSpace(auth[7:])
		}
		// 2) ถ้ายังว่าง ลองจากคุกกี้
		if token == "" {
			if ck, err := c.Cookie("auth_token"); err == nil {
				token = ck
			}
		}
		if token == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "missing token"})
			return
		}

		jwtw := services.JwtWrapper{
			SecretKey: "your_secret_key", // ต้องตรงกับตอน Generate
			Issuer:    "AuthService",
		}
		claims, err := jwtw.ValidateToken(token)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid token"})
			return
		}

		// set ให้ controller ใช้
		c.Set("userID", claims.UserID)
		c.Set("role", strings.ToLower(claims.Role))
		c.Set("username", claims.Username)

		c.Next()
	}
}