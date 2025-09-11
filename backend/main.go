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

		// --- Job Categories ---
		api.GET("/jobcategories", controller.ListJobCategories)
		api.GET("/jobcategories/:id", controller.GetJobCategoryByID)
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

		// --- Employer Profile (me) ---
		auth.GET("/employer/me", controller.GetEmployerProfile)
		auth.PUT("/employer/me/avatar", controller.UpdateMyEmployerAvatar)

		// --- JobPosts (สร้าง/แก้ไข/ลบ) ---
		auth.POST("/jobposts", controller.CreateJobPost)
		auth.PUT("/jobposts/:id", controller.UpdateJobPost)
		auth.DELETE("/jobposts/:id", controller.DeleteJobPost)
		auth.POST("/jobposts/upload-portfolio/:id", controller.UploadPortfolio)

		// --- Employer: My Posts ---
		// auth.GET("/employer/myposts", controller.GetEmployerPosts)

		// --- Student Profile ---
		auth.POST("/student-profile-posts", controller.CreateStudentProfilePost)
		auth.GET("/profile", controller.GetMyProfile)
		auth.PUT("/student/:id", controller.UpdateStudent)

		// --- Job Applications ---
		auth.GET("/jobapplications/init/:id", controller.InitJobApplication)
		auth.POST("/jobapplications", controller.CreateJobApplication)
		auth.GET("/jobapplications/me", controller.GetMyApplications)
		auth.GET("/jobapplications/job/:jobpost_id", controller.GetApplicantsByJobPost)
		auth.PUT("/jobapplications/:id/status", controller.UpdateApplicationStatus)
		auth.GET("/jobapplications/check/:jobpost_id/:student_id", controller.CheckJobApplication)
		auth.PUT("/jobapplications/:id/interview", controller.UpdateInterviewSchedule) //นักศึกษาเลือก วันสัมภาษณ์ โดยตรง จากตารางเวลาที่นายจ้างสร้างไว้
		auth.POST("/jobapplications/:id/upload-resume", controller.UploadResume)




		// Interviews
		// ชั้นขออุญาติเพิ่มนะแกชั้นต้องใช้ TT 😭😭😭
		// --- Interview Schedules ---
		auth.POST("/interview-schedules", controller.CreateInterviewSchedule)                    // สร้างช่วงเวลา
		auth.GET("/interview-schedules/employer/:employerId", controller.GetSchedulesByEmployer) // ดูทั้งหมด
		auth.DELETE("/interview-schedules/:id", controller.DeleteInterviewSchedule)              // ลบช่วงเวลา

		// Interviews
		auth.POST("/interviews/book", controller.BookInterview) //สร้างเรคคอร์ด Interview จริง ๆ หลังจากนักศึกษาจองวันสัมภาษณ์ ก็คือผูกกับตารางนั่นแหละ
		auth.GET("/interviews/student/:studentId", controller.GetInterviewsByStudent)
		auth.GET("/interviews/employer/:employerId", controller.GetInterviewsByEmployer)

		// --- Tickets ---
		auth.POST("/tickets", controller.CreateRequestTicket)
		auth.GET("/tickets", controller.GetMyRequestTickets)
		auth.GET("/tickets/:id", controller.GetRequestTicketByID)
		auth.POST("/tickets/:id/replies", controller.CreateTicketReply)

		// --- myjob ---
        auth.GET("/my-jobs/accepted", controller.GetEmployerPostsWithAcceptedApplications)
		auth.GET("/my-jobs/:id", controller.GetMyJobpostByID)

		// --- Reviews ---
		auth.GET("/reviews/job/:jobId", controller.FindRatingsByJobPostID)
		auth.POST("/reviews", controller.CreateReview)
		auth.GET("/reviews/view/:id", controller.GetReviewByID)

		// --- Payments ---
		auth.POST("/payments", controller.CreatePayment)
		auth.GET("/payments", controller.ListPayments)
		auth.GET("/orders", controller.ListOrders)
		auth.GET("/discounts", controller.ListDiscounts)
		auth.POST("/billable_items", controller.CreateOrUpdateBillableItem)
		auth.GET("/paymentmethods", controller.ListPaymentMethods)
		auth.GET("/payments/:id", controller.GetPaymentByID)
		auth.GET("/payments/job/:jobId", controller.GetPaymentByJobId)
		auth.GET("/billable_items/:id", controller.GetBillableItemByID)
		auth.GET("/payments/billable/:billableId", controller.GetLatestPaymentByBillable)
		auth.POST("/payments/:id/evidence", controller.UploadEvidence)

		// --- Payment Reports ---
		auth.GET("/payment-reports/me", controller.ListMyPaymentReports)
		auth.GET("/payment-reports/employer/:id", controller.ListPaymentReportsByEmployerID)
		auth.POST("/payment-reports/upload", controller.UploadPaymentReport)

		// --- Student Finance ---
		auth.GET("/my/finance", controller.GetMyFinance)
		auth.GET("/my/finance/summary", controller.GetMyFinanceSummary)
		auth.GET("/student/:id/finance", controller.GetStudentFinance)
		auth.GET("/student/:id/finance/summary", controller.GetStudentFinanceSummary)
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
		admin.GET("/finance/summary", controller.FinanceSummary)	
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
