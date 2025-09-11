package seed

import (
    "time"

    "github.com/KBook22/System-Analysis-and-Design/entity"
    "golang.org/x/crypto/bcrypt"
    "gorm.io/gorm"
)

func SeedUsersAndProfiles(db *gorm.DB) {
    password, _ := bcrypt.GenerateFromPassword([]byte("123"), 14)

    // --- Users ---
    users := []entity.User{
        // Original Users
        {Model: gorm.Model{ID: 1}, Username: "hormok_hr", Password: string(password), Role: entity.Emp},
        {Model: gorm.Model{ID: 2}, Username: "panida_t", Password: string(password), Role: entity.Stu},
        // New Employers
        {Model: gorm.Model{ID: 3}, Username: "kfc_hr", Password: string(password), Role: entity.Emp},
        {Model: gorm.Model{ID: 4}, Username: "major_hr", Password: string(password), Role: entity.Emp},
        {Model: gorm.Model{ID: 5}, Username: "sut_lib", Password: string(password), Role: entity.Emp},
        // New Students
        {Model: gorm.Model{ID: 6}, Username: "somchai_s", Password: string(password), Role: entity.Stu},
        {Model: gorm.Model{ID: 7}, Username: "somsri_k", Password: string(password), Role: entity.Stu},
        {Model: gorm.Model{ID: 8}, Username: "peter_p", Password: string(password), Role: entity.Stu},
        {Model: gorm.Model{ID: 9}, Username: "mana_d", Password: string(password), Role: entity.Stu},
        {Model: gorm.Model{ID: 10}, Username: "lisa_m", Password: string(password), Role: entity.Stu},
        {Model: gorm.Model{ID: 11}, Username: "tony_j", Password: string(password), Role: entity.Stu},
    }
    for _, u := range users {
        db.FirstOrCreate(&u, u.ID)
    }

    // --- Employers ---
    employers := []entity.Employer{
        {
            Model: gorm.Model{ID: 1}, Firstname: "พรศิริ", Lastname: "ถาบุญศรี", Email: "hr@hormok.co.th",
            CompanyName: "ห่อหมก สตูดิโอ", ContactPerson: "คุณพรศิริ ถาบุญศรี", Birthday: time.Date(1990, 5, 15, 0, 0, 0, 0, time.UTC),
            Phone: "081-234-5678", Address: "123 มทส. ประตู 4 ต.สุรนารี อ.เมือง จ.นครราชสีมา", UserID: 1, GenderID: 1,
        },
        {
            Model: gorm.Model{ID: 2}, Firstname: "สมศักดิ์", Lastname: "รักไก่", Email: "hr@kfc.co.th",
            CompanyName: "KFC Thailand", ContactPerson: "คุณสมศักดิ์", Birthday: time.Date(1985, 3, 10, 0, 0, 0, 0, time.UTC),
            Phone: "088-888-8888", Address: "สาขาเดอะมอลล์ โคราช", UserID: 3, GenderID: 1,
        },
        {
            Model: gorm.Model{ID: 3}, Firstname: "อารยา", Lastname: "ชอบดูหนัง", Email: "hr@major.co.th",
            CompanyName: "Major Cineplex", ContactPerson: "คุณอารยา", Birthday: time.Date(1992, 7, 22, 0, 0, 0, 0, time.UTC),
            Phone: "099-999-9999", Address: "สาขาเซ็นทรัล โคราช", UserID: 4, GenderID: 2,
        },
        {
            Model: gorm.Model{ID: 4}, Firstname: "บรรณารักษ์", Lastname: "ใจดี", Email: "lib@sut.ac.th",
            CompanyName: "SUT Library", ContactPerson: "คุณบรรณารักษ์", Birthday: time.Date(1980, 1, 1, 0, 0, 0, 0, time.UTC),
            Phone: "044-224-333", Address: "มหาวิทยาลัยเทคโนโลยีสุรนารี", UserID: 5, GenderID: 3,
        },
    }
    for _, e := range employers {
        db.FirstOrCreate(&e, e.ID)
    }

    // --- Students ---
    students := []entity.Student{
        {
            Model: gorm.Model{ID: 1}, Email: "panida.t@gmail.com", FirstName: "พนิดา", LastName: "โต๊ะเหลือ",
            Birthday: time.Date(2004, 12, 31, 0, 0, 0, 0, time.UTC), Age: 20, GPA: 3.5, Year: 3, Faculty: "วิศวกรรมศาสตร์",
            Phone: "081-234-2154", Skills: "เคยทำงานพาร์ทไทม์ร้านชาบู", UserID: 2, GenderID: 2, BankAccount: "8630211849", BankID: 4,
        },
        {
            Model: gorm.Model{ID: 2}, Email: "somchai.s@gmail.com", FirstName: "สมชาย", LastName: "สายเสมอ",
            Birthday: time.Date(2003, 5, 20, 0, 0, 0, 0, time.UTC), Age: 21, GPA: 2.8, Year: 2, Faculty: "เทคโนโลยีสารสนเทศ",
            Phone: "081-111-1111", Skills: "เขียนโปรแกรมเบื้องต้น", UserID: 6, GenderID: 1, BankAccount: "1111111111", BankID: 1,
        },
		  {
            Model: gorm.Model{ID: 3}, Email: "somsri.k@gmail.com", FirstName: "สมศรี", LastName: "แข็งแรง",
            Birthday: time.Date(2002, 8, 15, 0, 0, 0, 0, time.UTC), Age: 22, GPA: 3.2, Year: 3, Faculty: "ศิลปศาสตร์",
            Phone: "082-222-2222", Skills: "สื่อสารภาษาอังกฤษได้ดี", UserID: 7, GenderID: 2, BankAccount: "2222222222", BankID: 2,
        },
        {
            Model: gorm.Model{ID: 4}, Email: "peter.p@gmail.com", FirstName: "พีรพล", LastName: "เก่งกาจ",
            Birthday: time.Date(2003, 1, 10, 0, 0, 0, 0, time.UTC), Age: 21, GPA: 3.5, Year: 2, Faculty: "วิศวกรรมศาสตร์",
            Phone: "083-333-3333", Skills: "ใช้โปรแกรมออกแบบได้", UserID: 8, GenderID: 1, BankAccount: "3333333333", BankID: 3,
        },
        {
            Model: gorm.Model{ID: 5}, Email: "mana.d@gmail.com", FirstName: "มานะ", LastName: "ดีจริง",
            Birthday: time.Date(2004, 2, 12, 0, 0, 0, 0, time.UTC), Age: 20, GPA: 3.0, Year: 1, Faculty: "วิทยาศาสตร์",
            Phone: "084-444-4444", Skills: "มีความรับผิดชอบสูง", UserID: 9, GenderID: 1, BankAccount: "4444444444", BankID: 4,
        },
        {
            Model: gorm.Model{ID: 6}, Email: "lisa.m@gmail.com", FirstName: "ลลิษา", LastName: "มากความสามารถ",
            Birthday: time.Date(2002, 11, 30, 0, 0, 0, 0, time.UTC), Age: 22, GPA: 3.8, Year: 3, Faculty: "นิเทศศาสตร์",
            Phone: "085-555-5555", Skills: "เต้น, ร้องเพลง, Content Creator", UserID: 10, GenderID: 2, BankAccount: "5555555555", BankID: 5,
        },
        {
            Model: gorm.Model{ID: 7}, Email: "tony.j@gmail.com", FirstName: "ธนากร", LastName: "ใจกล้า",
            Birthday: time.Date(2001, 4, 5, 0, 0, 0, 0, time.UTC), Age: 23, GPA: 2.5, Year: 4, Faculty: "พละศึกษา",
            Phone: "086-666-6666", Skills: "ศิลปะป้องกันตัว, แข็งแรง", UserID: 11, GenderID: 1, BankAccount: "6666666666", BankID: 6,
        },
        
    }
    for _, s := range students {
        db.FirstOrCreate(&s, s.ID)
    }
	// --- Admin ---
	admin := entity.Admin{
        Model:     gorm.Model{ID: 1},
        Firstname: "Supanut",
        Lastname: "Srisawat",
        Email:     "admin@example.com",
        Phone:     "0812345678",
        Password:  "adminpassword", // ควรเข้ารหัสก่อนใช้งานจริง
    }
    db.FirstOrCreate(&admin, admin.ID)
}

