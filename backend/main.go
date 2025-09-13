// package main

// import (
// 	"net/http"

// 	"github.com/KBook22/System-Analysis-and-Design/config"
// 	"github.com/KBook22/System-Analysis-and-Design/controller"

// 	"github.com/KBook22/System-Analysis-and-Design/middleware"
// 	"github.com/KBook22/System-Analysis-and-Design/seed"
// 	"github.com/gin-gonic/gin"
// )

// func CORSMiddleware() gin.HandlerFunc {
// 	return func(c *gin.Context) {
// 		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
// 		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
// 		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
// 		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")
// 		if c.Request.Method == "OPTIONS" {
// 			c.AbortWithStatus(204)
// 			return
// 		}
// 		c.Next()
// 	}
// }

// const PORT = "8080"

// func main() {
// 	// เชื่อมต่อฐานข้อมูล + seed data
// 	config.ConnectionDB()
// 	config.SetupDatabase()
// 	config.SeedDatabase()

// 	// สร้าง router หลัก
// 	r := gin.Default()
// 	r.Use(CORSMiddleware())

// 	// Seed ข้อมูลนักศึกษา 30 คน
// 	db := config.DB()
// 	seed.SeedStudents(db)
// 	//////////เพิ่มโดยพรศิริ///////////////
// 	seed.SeedSkills(db)

// 	// --------------------  Public Routes --------------------
// 	api := r.Group("/api")
// 	{
// 		// --- JobPosts (ดูได้ทุกคน) ---
// 		api.GET("/jobposts", controller.ListJobPosts)
// 		api.GET("/jobposts/:id", controller.GetJobPostByID)

// 		// --- Job Categories ---
// 		api.GET("/jobcategories", controller.ListJobCategories)
// 		api.GET("/jobcategories/:id", controller.GetJobCategoryByID)
// 		api.GET("/reviews/scores", controller.ListRatingScores)
// 		api.GET("/payments/statuses", controller.ListPaymentStatuses)
// 		api.GET("/payments/methods", controller.ListPaymentMethods)

// 		// api.GET("/banks", controller.ListBanks)
// 		// api.GET("/genders", controller.ListGenders)

// 		//=====================================
// 		//get report status
// 		api.GET("/reportstatus", controller.GetReportstatus)

// 		api.GET("/reports", controller.GetAllReports)
// 		api.GET("/reports/:id", controller.GetReportByID)
// 		api.GET("/reports/user/:user_id", controller.GetReportByUserID)
// 		api.POST("/reports", controller.CreateReport)

// 		api.DELETE("/reports/:id", controller.DeleteReport)
// 		api.PUT("/reports/:id", controller.UpdateReport)

// 		// worklog
// 		api.POST("/worklogs", controller.CreateWorklog)
// 		api.GET("/worklogs/student/:id", controller.GetWorklogStudent)
// 		api.PUT("/worklogs/:id", controller.UpdateWorklogByID)
// 		api.DELETE("/worklogs/:id", controller.DeleteWorklogID)
// 		// // Extra
// 		// api.GET("/jobposts/:id/students", controller.GetStudentInJobpost)
// 		// api.GET("/users/:id", controller.GetUserByEmployerID)

// 		//=====================================

// 		protected := api.Group("")
// 		// protected.Use(middleware.Authorizes())
// 		// {
// 		// JobPost (actions)

// 		jobpostRoutes := protected.Group("/myjobposts")
// 		{
// 			jobpostRoutes.POST("", controller.CreateJobPost)
// 			jobpostRoutes.PUT("/:id", controller.UpdateJobPost)
// 			jobpostRoutes.DELETE("/:id", controller.DeleteJobPost)
// 		}

// 		// --- Salary Type ---
// 		api.GET("/salarytype", controller.ListSalaryType)
// 		api.GET("/salarytype/:id", controller.GetSalaryTypeByID)

// 		// --- Employment Types ---
// 		api.GET("/employmenttypes", controller.ListEmploymentTypes)
// 		api.GET("/employmenttypes/:id", controller.GetEmploymentTypeByID)

// 		// --- Auth & Register ---
// 		api.POST("/register/student", controller.RegisterStudent)
// 		api.POST("/register/employer", controller.RegisterEmployer)
// 		api.POST("/register/admin", controller.RegisterAdmin)
// 		api.POST("/login", controller.Login)

// 		// --- FAQs & Student Profile (Public) ---
// 		api.GET("/faqs", controller.GetFAQs)
// 		////////////////////////////////////เเก้ไขโดยพรศิริ ////////////////////////////
// 		api.GET("/student-posts", controller.GetStudentPosts)
// 		api.GET("/student-posts/:id", controller.GetStudentPostByID)

// 		////////////สิ้นสุดการเพิ่มของพรศิริ//////////////////////////////
// 	}

// 	// -------------------- 🔐 Protected Routes (ต้องล็อกอิน) --------------------
// 	auth := api.Group("/")
// 	auth.Use(middleware.AuthMiddleware()) // ต้องมี JWT Token
// 	{
// 		// --- JobPosts (สร้าง/แก้ไข/ลบ) ---
// 		auth.POST("/jobposts", controller.CreateJobPost)
// 		auth.PUT("/jobposts/:id", controller.UpdateJobPost)
// 		auth.DELETE("/jobposts/:id", controller.DeleteJobPost)
// 		auth.POST("/jobposts/upload-portfolio/:id", controller.UploadPortfolio)

// 		// --- Employer: My Posts ---
// 		auth.GET("/employer/myposts", controller.GetEmployerPosts)
// 		//////////////////////////เเก้ไขโดยพรศิริ///////////////////////////////////
// 		// --- Student Post ---
// 		auth.POST("/student-posts", controller.CreateStudentPost)
// 		auth.PUT("/student-posts/:id", controller.UpdateStudentPost)
// 		auth.DELETE("/student-posts/:id", controller.DeleteStudentPost)
// 		auth.GET("/skills", controller.ListSkills)

// 		auth.POST("/upload", controller.UploadToSupabase) // uploadfile
// 		////////////////สิ้นสุดการเเก้ไขของพรศิริ///////////////////////

// 		// --- Job Applications ---
// 		auth.GET("/jobapplications/init/:id", controller.InitJobApplication)
// 		auth.POST("/jobapplications", controller.CreateJobApplication)
// 		auth.GET("/jobapplications/me", controller.GetMyApplications)

// 		// --- Tickets ---
// 		auth.POST("/tickets", controller.CreateRequestTicket)
// 		auth.GET("/tickets", controller.GetMyRequestTickets)
// 		auth.GET("/tickets/:id", controller.GetRequestTicketByID)
// 		auth.POST("/tickets/:id/replies", controller.CreateTicketReply)

// 		// --- Reviews ---
// 		auth.POST("/reviews/new-rating", controller.CreateRating)
// 		auth.GET("/reviews", controller.FindRatingsByJobPostID)

// 		// --- Payments ---
// 		auth.POST("/payments", controller.CreatePayment)
// 		auth.GET("/payments", controller.ListPayments)
// 		auth.GET("/payments/:id", controller.GetPaymentByID)
// 		auth.GET("/payment_reports", controller.ListPaymentReports)
// 		auth.GET("/orders", controller.ListOrders)
// 		auth.GET("/discounts", controller.ListDiscounts)
// 		auth.GET("/billable_items", controller.ListBillableItems)
// 	}

// 	// -------------------- 🛡️ Admin Routes --------------------
// 	admin := api.Group("/admin")
// 	admin.Use(middleware.AdminMiddleware()) // ✅ ต้องเป็นแอดมินเท่านั้น
// 	{
// 		admin.GET("/tickets", controller.GetRequestTickets)
// 		admin.PUT("/tickets/:id/status", controller.UpdateTicketStatus)
// 		admin.POST("/faqs", controller.CreateFAQ)
// 		admin.PUT("/faqs/:id", controller.UpdateFAQ)
// 		admin.DELETE("/faqs/:id", controller.DeleteFAQ)
// 	}

// 	// -------------------- 📂 Static & Files --------------------
// 	// ตรวจสอบว่า Backend ทำงาน
// 	r.GET("/", func(c *gin.Context) {
// 		c.JSON(http.StatusOK, gin.H{"message": "Backend server is running!"})
// 	})

// 	// API สำหรับดาวน์โหลดไฟล์
// 	r.GET("/download/:filename", func(c *gin.Context) {
// 		filename := c.Param("filename")
// 		filepath := "./uploads/" + filename
// 		c.FileAttachment(filepath, filename) // ✅ บังคับดาวน์โหลดไฟล์
// 	})

// 	// ให้เข้าถึงโฟลเดอร์ uploads โดยตรง
// 	r.Static("/uploads", "./uploads")

// 	// Run server
// 	r.Run(":8080")
// }
// package main

// import (
// 	"net/http"

// 	"github.com/KBook22/System-Analysis-and-Design/config"
// 	"github.com/KBook22/System-Analysis-and-Design/controller"

// 	"github.com/KBook22/System-Analysis-and-Design/middleware"
// 	"github.com/KBook22/System-Analysis-and-Design/seed"
// 	"github.com/gin-gonic/gin"
// )

// func CORSMiddleware() gin.HandlerFunc {
// 	return func(c *gin.Context) {
// 		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
// 		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
// 		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
// 		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")
// 		if c.Request.Method == "OPTIONS" {
// 			c.AbortWithStatus(204)
// 			return
// 		}
// 		c.Next()
// 	}
// }

// const PORT = "8080"

// func main() {
// 	// เชื่อมต่อฐานข้อมูล + seed data
// 	config.ConnectionDB()
// 	config.SetupDatabase()
// 	config.SeedDatabase()

// 	// สร้าง router หลัก
// 	r := gin.Default()
// 	r.Use(CORSMiddleware())

// 	// Seed ข้อมูลนักศึกษา 30 คน
// 	db := config.DB()
// 	seed.SeedStudents(db)
// 	//////////เพิ่มโดยพรศิริ///////////////
// 	seed.SeedSkills(db)

// 	// --------------------  Public Routes --------------------
// 	api := r.Group("/api")
// 	{
// 		// --- JobPosts (ดูได้ทุกคน) ---
// 		api.GET("/jobposts", controller.ListJobPosts)
// 		api.GET("/jobposts/:id", controller.GetJobPostByID)

// 		// --- Student Profile (Public) ---
// 		api.GET("/students/:id", controller.GetStudentByID)

// 		// --- Job Categories ---
// 		api.GET("/jobcategories", controller.ListJobCategories)
// 		api.GET("/jobcategories/:id", controller.GetJobCategoryByID)
// 		api.GET("/reviews/scores", controller.ListRatingScores)
// 		api.GET("/payments/statuses", controller.ListPaymentStatuses)
// 		api.GET("/payments/methods", controller.ListPaymentMethods)

// 		// api.GET("/banks", controller.ListBanks)
// 		// api.GET("/genders", controller.ListGenders)

// 		//=====================================
// 		//get report status
// 		api.GET("/reportstatus", controller.GetReportstatus)

// 		api.GET("/reports", controller.GetAllReports)
// 		api.GET("/reports/:id", controller.GetReportByID)
// 		api.GET("/reports/user/:user_id", controller.GetReportByUserID)
// 		api.POST("/reports", controller.CreateReport)

// 		api.DELETE("/reports/:id", controller.DeleteReport)
// 		api.PUT("/reports/:id", controller.UpdateReport)

// 		// worklog
// 		api.POST("/worklogs", controller.CreateWorklog)
// 		api.GET("/worklogs/student/:id", controller.GetWorklogStudent)
// 		api.PUT("/worklogs/:id", controller.UpdateWorklogByID)
// 		api.DELETE("/worklogs/:id", controller.DeleteWorklogID)
// 		// // Extra
// 		// api.GET("/jobposts/:id/students", controller.GetStudentInJobpost)
// 		// api.GET("/users/:id", controller.GetUserByEmployerID)

// 		//=====================================

// 		protected := api.Group("")
// 		// protected.Use(middleware.Authorizes())
// 		// {
// 		// JobPost (actions)

// 		jobpostRoutes := protected.Group("/myjobposts")
// 		{
// 			jobpostRoutes.POST("", controller.CreateJobPost)
// 			jobpostRoutes.PUT("/:id", controller.UpdateJobPost)
// 			jobpostRoutes.DELETE("/:id", controller.DeleteJobPost)
// 		}

// 		// --- Salary Type ---
// 		api.GET("/salarytype", controller.ListSalaryType)
// 		api.GET("/salarytype/:id", controller.GetSalaryTypeByID)

// 		// --- Employment Types ---
// 		api.GET("/employmenttypes", controller.ListEmploymentTypes)
// 		api.GET("/employmenttypes/:id", controller.GetEmploymentTypeByID)

// 		// --- Auth & Register ---
// 		api.POST("/register/student", controller.RegisterStudent)
// 		api.POST("/register/employer", controller.RegisterEmployer)
// 		api.POST("/register/admin", controller.RegisterAdmin)
// 		api.POST("/login", controller.Login)

// 		// --- FAQs & Student Profile (Public) ---
// 		api.GET("/faqs", controller.GetFAQs)
// 		api.GET("/faqs/:id", controller.GetFAQByID)
// 		api.GET("/faqs/:id/comments", controller.GetFAQComments)
// 		////////////////////////////////////เเก้ไขโดยพรศิริ ////////////////////////////
// 		api.GET("/student-posts", controller.GetStudentPosts)

// 		api.GET("/student-posts/:id", controller.GetStudentPostByID)

// 		////////////สิ้นสุดการเพิ่มของพรศิริ//////////////////////////////
// 	}

// 	// -------------------- 🔐 Protected Routes (ต้องล็อกอิน) --------------------
// 	auth := api.Group("/")
// 	auth.Use(middleware.AuthMiddleware()) // ต้องมี JWT Token
// 	{
// 		// --- Notifications ---
// 		auth.GET("/notifications", controller.GetNotifications)
// 		auth.PUT("/notifications/:id/read", controller.MarkNotificationAsRead)
// 		auth.PUT("/notifications/read-all", controller.MarkAllNotificationsAsRead)

// 		// --- JobPosts (สร้าง/แก้ไข/ลบ) ---
// 		auth.POST("/jobposts", controller.CreateJobPost)
// 		auth.PUT("/jobposts/:id", controller.UpdateJobPost)
// 		auth.DELETE("/jobposts/:id", controller.DeleteJobPost)
// 		auth.POST("/jobposts/upload-portfolio/:id", controller.UploadPortfolio)

// 		// --- Employer: My Posts ---
// 		auth.GET("/employer/myposts", controller.GetEmployerPosts)
// 		//////////////////////////เเก้ไขโดยพรศิริ///////////////////////////////////
// 		// --- Student Post ---
// 		auth.POST("/student-posts", controller.CreateStudentPost)
// 		auth.PUT("/student-posts/:id", controller.UpdateStudentPost)
// 		auth.DELETE("/student-posts/:id", controller.DeleteStudentPost)
// 		auth.GET("/skills", controller.ListSkills)

// 		auth.POST("/upload", controller.UploadToSupabase) // uploadfile
// 		////////////////สิ้นสุดการเเก้ไขของพรศิริ///////////////////////

// 		// --- Job Applications ---
// 		auth.GET("/jobapplications/init/:id", controller.InitJobApplication)
// 		auth.POST("/jobapplications", controller.CreateJobApplication)
// 		auth.GET("/jobapplications/me", controller.GetMyApplications)

// 		// --- Tickets ---
// 		auth.POST("/tickets", controller.CreateRequestTicket)
// 		auth.GET("/tickets", controller.GetMyRequestTickets)
// 		auth.GET("/tickets/:id", controller.GetRequestTicketByID)
// 		auth.POST("/tickets/:id/replies", controller.CreateTicketReply)
// 		auth.POST("/faqs/:id/comments", controller.CreateFAQComment)

// 		// --- Reviews ---
// 		auth.POST("/reviews/new-rating", controller.CreateRating)
// 		auth.GET("/reviews", controller.FindRatingsByJobPostID)

// 		// --- Payments ---
// 		auth.POST("/payments", controller.CreatePayment)
// 		auth.GET("/payments", controller.ListPayments)
// 		auth.GET("/payments/:id", controller.GetPaymentByID)
// 		auth.GET("/payment_reports", controller.ListPaymentReports)
// 		auth.GET("/orders", controller.ListOrders)
// 		auth.GET("/discounts", controller.ListDiscounts)
// 		auth.GET("/billable_items", controller.ListBillableItems)
// 	}

// 	// -------------------- 🛡️ Admin Routes --------------------
// 	admin := api.Group("/admin")
// 	admin.Use(middleware.AdminMiddleware()) // ✅ ต้องเป็นแอดมินเท่านั้น
// 	{
// 		admin.GET("/tickets", controller.GetAllRequestTickets)
// 		admin.PUT("/tickets/:id/status", controller.UpdateTicketStatus)
// 		admin.POST("/faqs", controller.CreateFAQ)
// 		admin.PUT("/faqs/:id", controller.UpdateFAQ)
// 		admin.DELETE("/faqs/:id", controller.DeleteFAQ)
// 	}

// 	// -------------------- 📂 Static & Files --------------------
// 	// ตรวจสอบว่า Backend ทำงาน
// 	r.GET("/", func(c *gin.Context) {
// 		c.JSON(http.StatusOK, gin.H{"message": "Backend server is running!"})
// 	})

// 	// API สำหรับดาวน์โหลดไฟล์
// 	r.GET("/download/:filename", func(c *gin.Context) {
// 		filename := c.Param("filename")
// 		filepath := "./uploads/" + filename
// 		c.FileAttachment(filepath, filename) // ✅ บังคับดาวน์โหลดไฟล์
// 	})

// 	// ให้เข้าถึงโฟลเดอร์ uploads โดยตรง
// 	r.Static("/uploads", "./uploads")

//		// Run server
//		r.Run(":8080")
//	}
package main

import (
	"github.com/KBook22/System-Analysis-and-Design/config"
	"github.com/KBook22/System-Analysis-and-Design/controller"
	"github.com/KBook22/System-Analysis-and-Design/middleware"
	"github.com/KBook22/System-Analysis-and-Design/seed"
	"github.com/gin-gonic/gin"
	"net/http"

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
	seed.SeedSkills(db)

	// -------------------- Public Routes --------------------
	api := r.Group("/api")
	{
		// --- JobPosts (ดูได้ทุกคน) ---
		api.GET("/jobposts", controller.ListJobPosts)

		// --- Student Profile (Public) ---
		api.GET("/students", controller.GetAllStudents)
		api.GET("/students/:id", controller.GetStudentByID)

		// 🔧 ⭐ เพิ่มใหม่: Public Profile View - ดูโปรไฟล์คนอื่นได้โดยไม่ต้อง login
		api.GET("/profile/:studentId", controller.GetProfileByStudentID)

		// --- Job Categories ---
		api.GET("/jobcategories", controller.ListJobCategories)
		api.GET("/jobcategories/:id", controller.GetJobCategoryByID)
		api.GET("/payments/methods", controller.ListPaymentMethods)

		// api.GET("/banks", controller.ListBanks)
		// api.GET("/genders", controller.ListGenders)

		//=====================================
		//get report status
		api.GET("/reportstatus", controller.GetReportstatus)

		// Report status
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

		api.GET("/jobposts/employer/:id", controller.GetJobpostByEmployerID)
		api.GET("/worklogs/user/:id", controller.GetJobpostByUserID)

		api.GET("/jobapplications/:id", controller.GetstudentByjobpostID)
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

		// --- FAQs & Student Posts (Public) ---
		api.GET("/faqs", controller.GetFAQs)
		api.GET("/faqs/:id", controller.GetFAQByID)
		api.GET("/faqs/:id/comments", controller.GetFAQComments)
		api.GET("/student-posts", controller.GetStudentPosts)
		api.GET("/student-posts/:id", controller.GetStudentPostByID)
	}

	// -------------------- 🔐 Protected Routes (ต้องล็อกอิน) --------------------
	auth := api.Group("/")
	auth.Use(middleware.AuthMiddleware())
	{

		// --- Employer Profile (me) ---
		auth.GET("/employer/me", controller.GetEmployerProfile)
		auth.PUT("/employer/me/avatar", controller.UpdateMyEmployerAvatar)

		// --- JobPosts (สร้าง/แก้ไข/ลบ/ค้น) ---
		// --- Profile Routes (ต้อง login) ---
		auth.GET("/students/user/:userId", controller.GetStudentByUserID)
		auth.PUT("/students/:id", controller.UpdateStudent) // อัพเดตโปรไฟล์

		// --- Notifications ---
		// auth.GET("/notifications", controller.GetNotifications)
		// auth.PUT("/notifications/:id/read", controller.MarkNotificationAsRead)
		// auth.PUT("/notifications/read-all", controller.MarkAllNotificationsAsRead)

		// --- JobPosts (สร้าง/แก้ไข/ลบ) ---

		auth.POST("/jobposts", controller.CreateJobPost)
		auth.PUT("/jobposts/:id", controller.UpdateJobPost)
		auth.DELETE("/jobposts/:id", controller.DeleteJobPost)
		auth.POST("/jobposts/upload-portfolio/:id", controller.UploadPortfolio)
		auth.GET("/jobposts/:id", controller.GetJobPostByID)
		auth.POST("/jobposts/upload-logo/:id", controller.UploadLogo)

		// --- Employer: My Posts ---
		auth.GET("/employer/myposts", controller.GetEmployerPosts)

		// --- Student Profile ---
		// auth.POST("/student-profile-posts", controller.) หาfunction
		auth.GET("/profile", controller.GetMyProfile)
		auth.PUT("/student/:id", controller.UpdateapplyStudent)

		// --- Student Post ---
		auth.POST("/student-posts", controller.CreateStudentPost)
		auth.PUT("/student-posts/:id", controller.UpdateStudentPost)
		auth.DELETE("/student-posts/:id", controller.DeleteStudentPost)
		auth.GET("/skills", controller.ListSkills)
		auth.POST("/upload", controller.UploadToSupabase)
		

		// --- Job Applications ---
		auth.GET("/jobapplications/init/:id", controller.InitJobApplication)
		auth.POST("/jobapplications", controller.CreateJobApplication)
		auth.GET("/jobapplications/me", controller.GetMyApplications)
		auth.GET("/jobapplications/job/:jobpost_id", controller.GetApplicantsByJobPost)
		auth.PUT("/jobapplications/:id/status", controller.UpdateApplicationStatus)
		auth.GET("/jobapplications/check/:jobpost_id/:student_id", controller.CheckJobApplication)
		auth.PUT("/jobapplications/:id/interview", controller.UpdateInterviewSchedule) //นักศึกษาเลือก วันสัมภาษณ์ โดยตรง จากตารางเวลาที่นายจ้างสร้างไว้
		auth.POST("/jobapplications/:id/upload-resume", controller.UploadResume)

		// --- Tickets ---
		auth.POST("/tickets", controller.CreateRequestTicket)
		auth.GET("/tickets", controller.GetMyRequestTickets)
		auth.GET("/tickets/:id", controller.GetRequestTicketByID)
		auth.POST("/tickets/:id/replies", controller.CreateTicketReply)
		auth.POST("/faqs/:id/comments", controller.CreateFAQComment)

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
		// auth.GET("/billable_items", controller.ListBillableItems)

		// ===== Chat API =====
		chat := auth.Group("/chat")
		{
			chat.GET("/rooms", controller.ListMyChatRooms)
			chat.POST("/rooms", controller.CreateOrGetRoom)
			chat.GET("/rooms/:roomId/messages", controller.ListRoomMessages)
			chat.POST("/rooms/:roomId/messages", controller.SendMessage)
		}
		// ===== Chat API =====

		// ========= Interview & Interview Scheduling API =========
		interviewScheduling := auth.Group("/interview-schedules")
		{
			interviewScheduling.POST("/create", controller.CreateInterviewSchedule)       // สร้างช่วงเวลา
			interviewScheduling.GET("/get", controller.GetAllInterviewSchedules)          // ดูทั้งหมด
			interviewScheduling.GET("/get/employer/", controller.GetSchedulesByEmployerID) //ดูจาก ID ผู้ว่าจ้าง
			interviewScheduling.GET("/get/:id", controller.GetInterviewScheduleByID)      // ดึงตาม ID
			interviewScheduling.DELETE("/delete/:id", controller.DeleteInterviewSchedule) // ลบช่วงเวลา
		}

		interview := auth.Group("/interviews")
		{
			interview.POST("/book", controller.BookInterview) //สร้างเรคคอร์ด Interview จริง ๆ หลังจากนักศึกษาจองวันสัมภาษณ์ ก็คือผูกกับตารางนั่นแหละ
			interview.GET("/student/:studentId", controller.GetInterviewsByStudent)
			interview.GET("/employer/:employerId", controller.GetInterviewsByEmployer)
			interview.GET("/application/:applicationID", controller.GetInterviewsTableByApplication)
		}
		// ========= Interview & Interview Scheduling API =========
	}

	// -------------------- 🛡️ Admin Routes --------------------
	admin := api.Group("/admin")
	admin.Use(middleware.AdminMiddleware())
	{
		admin.GET("/tickets", controller.GetAllRequestTickets)
		admin.PUT("/tickets/:id/status", controller.UpdateTicketStatus)
		admin.POST("/faqs", controller.CreateFAQ)
		admin.PUT("/faqs/:id", controller.UpdateFAQ)
		admin.DELETE("/faqs/:id", controller.DeleteFAQ)
		admin.GET("/finance/summary", controller.FinanceSummary)
	}

	// -------------------- 📂 Static & Files --------------------
	r.GET("/", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"message": "Backend server is running!"})
	})

	r.GET("/download/:filename", func(c *gin.Context) {
		filename := c.Param("filename")
		filepath := "./uploads/" + filename
		c.FileAttachment(filepath, filename)
	})

	r.Static("/uploads", "./uploads")

	// Run server
	r.Run(":8080")
}
