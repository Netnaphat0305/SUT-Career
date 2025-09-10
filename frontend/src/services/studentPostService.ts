// services/studentPostService.ts

// ✅ ปรับปรุง interface สำหรับ Skills ใหม่
interface Skill {
    ID: number;
    skill_name: string;
    SkillName?: string;
    CreatedAt: string;
    UpdatedAt: string;
  }
  
  interface Student {
    ID: number;
    first_name: string;
    last_name: string;
    email?: string;
    phone?: string;
    profile_image_url?: string;
    faculty: string;
    year?: number;
    UserID?: number;
    user_id?: number;
  }
  
  interface Faculty {
    ID: number;
    Name: string;
  }
  
  interface Department {
    ID: number;
    Name: string;
  }
  
  interface Attachment {
    ID: number;
    url: string;
    name: string;
    type: string;
    student_post_id: number;
  }
  
  interface StudentPost {
    ID: number;
    title: string;
    job_type: string;
    skills: Skill[];  // ✅ เปลี่ยนจาก string เป็น array ของ Skill objects
    availability: string;
    preferred_location: string;
    expected_compensation?: string;
    introduction: string;
    portfolio_url?: string;
    status: string;
    student?: Student;
    faculty?: Faculty;
    department?: Department;
    attachments?: Attachment[];
    CreatedAt: string;
    UpdatedAt: string;
  }
  
  const API_BASE_URL = 'http://localhost:8080/api';
  
  // Helper function to get auth headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };
  
  // Get all student posts (public)
  export const getStudentPosts = async () => {
    const response = await fetch(`${API_BASE_URL}/student-posts`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
  
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch posts');
    }
  
    return response.json();
  };
  
  // Get student post by ID (public)
  export const getStudentPostById = async (id: number) => {
    const response = await fetch(`${API_BASE_URL}/student-posts/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
  
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch post');
    }
  
    return response.json();
  };
  
  // Create student post (protected)
  export const createStudentPost = async (postData: any) => {
    const response = await fetch(`${API_BASE_URL}/student-posts`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(postData)
    });
  
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create post');
    }
  
    return response.json();
  };
  
  // Update student post (protected)
  export const updateStudentPost = async (postId: number, postData: any) => {
    const response = await fetch(`${API_BASE_URL}/student-posts/${postId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(postData)
    });
  
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update post');
    }
  
    return response.json();
  };
  
  // Delete student post (protected)
  export const deleteStudentPost = async (postId: number) => {
    const response = await fetch(`${API_BASE_URL}/student-posts/${postId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
  
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete post');
    }
  
    return response.json();
  };
  
  // Get my student posts (protected)
  export const getMyStudentPosts = async () => {
    const response = await fetch(`${API_BASE_URL}/my-posts`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
  
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch my posts');
    }
  
    return response.json();
  };
  
  // Backward compatibility - alias for old function name
  export const getStudentProfilePosts = getStudentPosts;
  export const createStudentProfilePost = createStudentPost;