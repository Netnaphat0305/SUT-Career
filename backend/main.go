package main

import (
	"net/http"

	"github.com/KBook22/System-Analysis-and-Design/config"
	"github.com/KBook22/System-Analysis-and-Design/controller"
	"github.com/KBook22/System-Analysis-and-Design/middleware"
	"github.com/KBook22/System-Analysis-and-Design/seed"
	"github.com/gin-gonic/gin"

	"log"
	"os"
)

func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "http://localhost:5173")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	}
}

const PORT = "8080"

func main() {
	// เชื่อมต่อฐานข้อมูล + seed data
	config.ConnectionDB()
	config.SetupDatabase()
	config.SeedDatabase()

	// สร้าง router หลัก
	r := gin.Default()

	r.Use(CORSMiddleware())

	if err := os.MkdirAll("./static/payment_evidence", 0o755); err != nil {
		log.Fatal(err)
	}
	r.Static("/static", "./static")

	// Seed ข้อมูลนักศึกษา 30 คน
	db := config.DB()
	seed.SeedStudents(db)

	// --------------------  Public Routes --------------------
	api := r.Group("/api")
	{
		// --- JobPosts (ดูได้ทุกคน) ---
		api.GET("/jobposts", controller.ListJobPosts)
		api.GET("/jobposts/:id", controller.GetJobPostByID)

		// --- Job Categories ---
		api.GET("/jobcategories", controller.ListJobCategories)
		api.GET("/jobcategories/:id", controller.GetJobCategoryByID)
		api.GET("/reviews/scores", controller.ListRatingScores)
		api.GET("/payments/statuses", controller.ListPaymentStatuses)
		api.GET("/payments/methods", controller.ListPaymentMethods)

		// api.GET("/banks", controller.ListBanks)
		// api.GET("/genders", controller.ListGenders)

		//=====================================
		//get report status
		api.GET("/reportstatus", controller.GetReportstatus)

		api.GET("/reports", controller.GetAllReports)
		api.GET("/reports/:id", controller.GetReportByID)
		api.GET("/reports/user/:user_id", controller.GetReportByUserID)
		api.POST("/reports", controller.CreateReport)

		api.DELETE("/reports/:id", controller.DeleteReport)
		api.PUT("/reports/:id", controller.UpdateReport)

		// worklog
		api.POST("/worklogs", controller.CreateWorklog)
		api.GET("/worklogs/student/:id", controller.GetWorklogStudent)
		api.PUT("/worklogs/:id", controller.UpdateWorklogByID)
		api.DELETE("/worklogs/:id", controller.DeleteWorklogID)
		// // Extra
		// api.GET("/jobposts/:id/students", controller.GetStudentInJobpost)
		// api.GET("/users/:id", controller.GetUserByEmployerID)

		//=====================================

		protected := api.Group("")
		// protected.Use(middleware.Authorizes())
		// {
		// JobPost (actions)

		jobpost := protected.Group("/myjobposts")
		{
			jobpost.GET("", controller.ListJobPosts)
			jobpost.GET("/:id", controller.GetJobPostByID)
			jobpost.GET("/employer/:id", controller.ListJobPostsByEmployerID)
		}

		// --- Salary Type ---
		api.GET("/salarytype", controller.ListSalaryType)
		api.GET("/salarytype/:id", controller.GetSalaryTypeByID)

		// --- Employment Types ---
		api.GET("/employmenttypes", controller.ListEmploymentTypes)
		api.GET("/employmenttypes/:id", controller.GetEmploymentTypeByID)

		// --- Auth & Register ---
		api.POST("/register/student", controller.RegisterStudent)
		api.POST("/register/employer", controller.RegisterEmployer)
		api.POST("/register/admin", controller.RegisterAdmin)
		api.POST("/login", controller.Login)

		// --- FAQs & Student Profile (Public) ---
		api.GET("/faqs", controller.GetFAQs)
		api.GET("/student-profile-posts", controller.GetStudentProfilePosts)

	}

	// -------------------- 🔐 Protected Routes (ต้องล็อกอิน) --------------------
	auth := api.Group("/")
	auth.Use(middleware.AuthMiddleware()) // ต้องมี JWT Token
	{
		// --- JobPosts (สร้าง/แก้ไข/ลบ) ---
		auth.POST("/jobposts", controller.CreateJobPost)
		auth.PUT("/jobposts/:id", controller.UpdateJobPost)
		auth.DELETE("/jobposts/:id", controller.DeleteJobPost)
		auth.POST("/jobposts/upload-portfolio/:id", controller.UploadPortfolio)

		// --- Employer: My Posts ---
		auth.GET("/employer/myposts", controller.GetEmployerPosts)

		// --- Student Profile ---
		auth.POST("/student-profile-posts", controller.CreateStudentProfilePost)
		auth.GET("/profile", controller.GetMyProfile)

		// --- Job Applications ---
		auth.GET("/jobapplications/init/:id", controller.InitJobApplication)
		auth.POST("/jobapplications", controller.CreateJobApplication)
		auth.GET("/jobapplications/me", controller.GetMyApplications)
		auth.GET("/jobapplications/job/:jobpost_id", controller.GetApplicantsByJobPost)

		// --- Tickets ---
		auth.POST("/tickets", controller.CreateRequestTicket)
		auth.GET("/tickets", controller.GetMyRequestTickets)
		auth.GET("/tickets/:id", controller.GetRequestTicketByID)
		auth.POST("/tickets/:id/replies", controller.CreateTicketReply)

		// --- Reviews ---
		auth.POST("/reviews/new-rating", controller.CreateReview)
		auth.GET("/reviews", controller.FindRatingsByJobPostID)

		// --- Payments ---
		auth.POST("/payments", controller.CreatePayment)
		auth.GET("/payments", controller.ListPayments)
		auth.GET("/payments/:id", controller.GetPaymentByID)
		auth.GET("/payment_reports", controller.ListPaymentReports)
		auth.GET("/orders", controller.ListOrders)
		auth.GET("/discounts", controller.ListDiscounts)
		auth.GET("/billable_items", controller.ListBillableItems)

		// ===== Chat API =====
		chat := auth.Group("/chat")
		{
			chat.GET("/rooms", controller.ListMyChatRooms)
			chat.POST("/rooms", controller.CreateOrGetRoom)
			chat.GET("/rooms/:roomId/messages", controller.ListRoomMessages)
			chat.POST("/rooms/:roomId/messages", controller.SendMessage)
		}
		// ===== Chat API =====
	}

	// -------------------- 🛡️ Admin Routes --------------------
	admin := api.Group("/admin")
	admin.Use(middleware.AdminMiddleware()) // ✅ ต้องเป็นแอดมินเท่านั้น
	{
		admin.GET("/tickets", controller.GetRequestTickets)
		admin.PUT("/tickets/:id/status", controller.UpdateTicketStatus)
		admin.POST("/faqs", controller.CreateFAQ)
		admin.PUT("/faqs/:id", controller.UpdateFAQ)
		admin.DELETE("/faqs/:id", controller.DeleteFAQ)
	}

	// -------------------- 📂 Static & Files --------------------
	// ตรวจสอบว่า Backend ทำงาน
	r.GET("/", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"message": "Backend server is running!"})
	})

	// API สำหรับดาวน์โหลดไฟล์
	r.GET("/download/:filename", func(c *gin.Context) {
		filename := c.Param("filename")
		filepath := "./uploads/" + filename
		c.FileAttachment(filepath, filename) // ✅ บังคับดาวน์โหลดไฟล์
	})

	// ให้เข้าถึงโฟลเดอร์ uploads โดยตรง
	r.Static("/uploads", "./uploads")

	// Run server
	r.Run(":8080")
}
