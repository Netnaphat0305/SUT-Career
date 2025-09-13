// import type { Gender } from "./gender"
// import type { Bank } from "./bank"
// import type { User } from "./user"

// export interface Student {
//     ID: number;
//     email: string;
//     first_name: string;
//     last_name: string;
//     birthday: Date;
//     age: number;
//     gpa: number;
//     year: number;
//     bank_account: string;
//     faculty: string;
//     phone: string;
//     skills: string;

//     user_id: number;
//     user?: User;

//     gender_id: number;
//     gender?: Gender;
    
//     bank_id: number;
//     bank?: Bank;
// }

export interface SignInStudent {
    email :string;
    password? :string;
}

// interfaces/student.ts
export interface Student {
    ID: number;
    id?: number; // backward compatibility
    user_id: number; // ⭐ สำคัญ: ต้องมี field นี้เพื่อเทียบกับ user.id
    UserID?: number; // backward compatibility
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    faculty: string;
    year: number;
    profile_image_url?: string;
    skills?: string;
    birthday?: string;
    age?: number;
    gpa?: number;
    gender_id?: number;
    bank_account?: string;
    bank_id?: number;
    created_at?: string;
    updated_at?: string;
  }
  
  // interfaces/studentpost.ts
  export interface StudentPost {
    ID: number;
    title: string;
    availability: string;
    preferred_location: string;
    expected_compensation?: string;
    introduction?: string;
    portfolio_url?: string;
    status?: string;
    student_id?: number;
    employment_type_id?: number;
    
    // ⭐ Relations - สำคัญสำหรับการ navigate
    student?: Student; // ต้องมี student object พร้อม ID
    employment_type?: EmploymentType;
    skills?: Skill[];
    attachments?: StudentPostAttachment[];
    
    created_at?: string;
    updated_at?: string;
  }
  
  export interface StudentPostAttachment {
    ID: number;
    student_post_id: number;
    url: string;
    name: string;
    type: string;
  }
  
  // interfaces/skill.ts
  export interface Skill {
    ID: number;
    skill_name: string;
    SkillName?: string; // backward compatibility
  }
  
  // interfaces/employmenttype.ts  
  export interface EmploymentType {
    ID: number;
    employment_type_name: string;
  }
  
  /* 
  ⚠️ สิ่งที่ต้องตรวจสอบใน Backend Response:
  
  1. StudentPost object ต้องมี student relation ที่ populated:
     {
       "ID": 1,
       "title": "หางาน Frontend Developer",
       "student": {
         "ID": 123,           // ⭐ ต้องมี
         "user_id": 456,      // ⭐ ต้องมี
         "first_name": "สมชาย",
         "last_name": "ใจดี"
       }
     }
  
  2. การ Preload ใน Backend (Go):
     config.DB().Preload("Student").Find(&posts)
  
  3. API Response Structure ที่คาดหวัง:
     {
       "data": [
         {
           "ID": 1,
           "student": { "ID": 123, "user_id": 456, ... },
           ...
         }
       ]
     }
  */



// interfaces/student.ts
//add by netnaphat
// User ของ Student
export interface User {
  ID: number;
  username: string;
}

// ข้อมูลเพศ
export interface Gender {
  ID: number;
  gender_name: string;
}

// ข้อมูลธนาคาร
export interface Bank {
  ID: number;
  bank_name: string;
}

// Student
export interface Student {
  ID: number;
  id?: number; // backward compatibility
  user_id: number; 
  UserID?: number; 

  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  faculty: string;
  year: number;

  profile_image_url?: string;
  skills?: string;
  birthday?: string;
  age?: number;
  gpa?: number;

  gender_id?: number;
  bank_account?: string;
  bank_id?: number;
  created_at?: string;
  updated_at?: string;

  // Relations
  user?: User;
  gender?: Gender;
  bank?: Bank;
}
