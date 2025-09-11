package entity

import (
	"time"
	"gorm.io/gorm"
)

type ApplicationStatusEnum string

const (
	StatusPending            ApplicationStatusEnum = "Pending"            // รอพิจารณา
	StatusInterviewPending   ApplicationStatusEnum = "InterviewPending"   // รอเลือกวันสัมภาษณ์
	StatusInterviewScheduled ApplicationStatusEnum = "InterviewScheduled" // เลือกวันสัมภาษณ์แล้ว
	StatusInterviewed        ApplicationStatusEnum = "Interviewed"        // สัมภาษณ์เสร็จแล้ว
	StatusAccepted           ApplicationStatusEnum = "Accepted"           // ผ่านการคัดเลือก
	StatusRejected           ApplicationStatusEnum = "Rejected"           // ไม่ผ่านการคัดเลือก
    StatusCancelled          ApplicationStatusEnum = "Cancelled"          // ยกเลิกการสมัคร เพิ่มอันนี้
)

type JobApplication struct {
    gorm.Model

    ApplicationStatus  ApplicationStatusEnum `gorm:"type:varchar(50);not null" json:"application_status"`
    LastUpdate        time.Time              `gorm:"not null" json:"last_update"`
    ApplicationReason string                 `gorm:"type:varchar(255);not null" json:"application_reason"`

    //บอกตัวเอง อย่าลืมไปเพื่อมตาราง JobApplication (1) to (1) Interview
   // FK Interview (1:1) ขแยาดเปลี่ยน ชั้นคิดผิดTTTT
   

    Interview   *Interview `gorm:"foreignKey:JobApplicationID" json:"interview"`

	//FK

    StudentID uint      `gorm:"not null" json:"student_id"`
    Student   Student `gorm:"foreignKey:StudentID;references:ID"`  // FK to Student.ID

    JobPostID uint    `gorm:"not null" json:"job_post_id"`
    JobPost   Jobpost `gorm:"foreignKey:JobPostID;references:ID"`  // FK to JobPost.ID

    //บอกตัวเอง อย่าลืมไปเพื่อมตาราง JobApplication (1) to (1) InterviewScheduling
    // เพิ่ม FK เพื่อเชื่อมกับตาราง InterviewScheduling
	// InterviewSchedulingID *uint               `json:"interview_scheduling_id"`
	// InterviewScheduling   *InterviewScheduling `gorm:"foreignKey:InterviewSchedulingID" json:"interview_scheduling"`

     // เพิ่มช่องเก็บไฟล์ ResumeFile
    ResumeFile string `gorm:"type:varchar(255)" json:"resume_file"`
    
}