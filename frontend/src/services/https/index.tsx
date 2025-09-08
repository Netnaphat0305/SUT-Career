// import axios from "axios";
// import type { AxiosResponse, AxiosError } from "axios";
// import type { Employer, SignInEmployer } from "../../interfaces/employer";
// import type { Student, SignInStudent } from "../../interfaces/student";
// import type {
//   Review,
//   CreateReviewRequest,
//   FindReviewRequest,
// } from "../../interfaces/review";
// import type { Ratingscore } from "../../interfaces/ratingscore";
// // import type { Jobpost } from "../../interfaces/jobpost";
// import type { Jobpost, CreateJobpost } from "../../interfaces/jobpost";

// const API_URL = import.meta.env.VITE_API_KEY || "http://localhost:8080";

// const getCookie = (name: string): string | null => {
//   const cookies = document.cookie.split("; ");
//   const cookie = cookies.find((row) => row.startsWith(`${name}=`));

//   if (cookie) {
//     let AccessToken = decodeURIComponent(cookie.split("=")[1]);
//     AccessToken = AccessToken.replace(/\\/g, "").replace(/"/g, "");
//     return AccessToken ? AccessToken : null;
//   }
//   return null;
// };


// const getConfig = () => {
//   const token = localStorage.getItem("token");
//   return {
//     headers: {
//       Authorization: token ? `Bearer ${token}` : "",
//       "Content-Type": "application/json",
//     },
//   };
// };

// const getConfigWithoutAuth = () => ({
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

// export const Post = async (
//   url: string,
//   data: any,
//   requireAuth: boolean = true
// ): Promise<AxiosResponse | any> => {
//   const config = requireAuth ? getConfig() : getConfigWithoutAuth();
//   return await axios
//     .post(`${API_URL}${url}`, data, config)
//     .then((res) => res)
//     .catch((error: AxiosError) => {
//       // if (error?.response?.status === 401) {
//       //   localStorage.clear();
//       //   window.location.reload();
//       // }
//       return error.response;
//     });
// };

// export const Get = async (
//   url: string,
//   requireAuth: boolean = true
// ): Promise<AxiosResponse | any> => {
//   const config = requireAuth ? getConfig() : getConfigWithoutAuth();
//   return await axios
//     .get(`${API_URL}${url}`, config)
//     .then((res) => res.data)
//     .catch((error: AxiosError) => {
//       if (error?.message === "Network Error") {
//         return error.response;
//       }
//       // if (error?.response?.status === 401) {
//       //   localStorage.clear();
//       //   window.location.reload();
//       // }
//       return error.response;
//     });
// };

// export const Update = async (
//   url: string,
//   data: any,
//   requireAuth: boolean = true
// ): Promise<AxiosResponse | any> => {
//   const config = requireAuth ? getConfig() : getConfigWithoutAuth();
//   return await axios
//     .put(`${API_URL}${url}`, data, config)
//     .then((res) => res.data)
//     .catch((error: AxiosError) => {
//       // if (error?.response?.status === 401) {
//       //   localStorage.clear();
//       //   window.location.reload();
//       // }
//       return error.response;
//     });
// };

// export const Delete = async (
//   url: string,
//   requireAuth: boolean = true
// ): Promise<AxiosResponse | any> => {
//   const config = requireAuth ? getConfig() : getConfigWithoutAuth();
//   return await axios
//     .delete(`${API_URL}${url}`, config)
//     .then((res) => res.data)
//     .catch((error: AxiosError) => {
//       // if (error?.response?.status === 401) {
//       //   localStorage.clear();
//       //   window.location.reload();
//       // }
//       return error.response;
//     });
// };

// // Authentication APIs
// export const authAPI = {
//   studentLogin: (data: SignInStudent) =>
//     Post("/auth/student/login", data, false),
//   employerLogin: (data: { email: string; password?: string }) =>
//     Post("/auth/employer/login", data, false),
// };

// // Student APIs
// export const studentAPI = {
//   signup: (data: Student) => Post("/students", data, false),
//   getAll: () => Get("/students"),
//   getById: (id: number) => Get(`/students/${id}`),
//   update: (id: number, data: Partial<Student>) =>
//     Update(`/students/${id}`, data),
//   delete: (id: number) => Delete(`/students/${id}`),
// };

// // Employer APIs
// export const employerAPI = {
//   signup: (data: Employer) => Post("/employers", data, false),
//   getAll: () => Get("/employers"),
//   getById: (id: number) => Get(`/employers/${id}`),
//   update: (id: number, data: Partial<Employer>) =>
//     Update(`/employers/${id}`, data),
//   delete: (id: number) => Delete(`/employers/${id}`),
// };

// // Review APIs
// export const reviewAPI = {
//   create: (data: CreateReviewRequest) => Post("/reviews", data),
//   find: (data: FindReviewRequest) => Post("/reviews/find", data),
//   getForJob: (jobId: number) => Get(`/reviews/job/${jobId}`),
// };

// // Rating Score APIs
// export const ratingScoreAPI = {
//   getAll: (): Promise<Ratingscore[]> => Get("/ratingscores"),
// };
// // Job Post APIs
// export const jobPostAPI = {
//   create: (data: CreateJobpost) => Post("/api/jobposts", data),
//   getAll: () => Get("/api/jobposts"),
//   getById: (id: number) => Get(`/api/jobposts/${id}`),
//   update: (id: number, data: Partial<Jobpost>) =>
//   Update(`/api/jobposts/${id}`, data),
//   delete: (id: number) => Delete(`/api/jobposts/${id}`),
//   getMyPosts: () => Get("/api/employer/myposts"), // ใช้ token จาก localStorage


//   uploadPortfolio: (id: number, file: File) => {
//     const formData = new FormData();
//     formData.append("portfolio", file);
//     const token = localStorage.getItem("token");
//     return axios.post(
//     `${API_URL}/api/jobposts/upload-portfolio/${id}`,
//     formData,
//     {
//       headers: {
//         "Content-Type": "multipart/form-data",
//         Authorization: `Bearer ${token}`,
//       },
//     }
//   );
//   },
// };


// // Job Application APIs
// export const jobApplicationAPI = {
//   init: (jobpost_id: number) => Get(`/api/jobapplications/init/${jobpost_id}`),
//   create: (data: any) => Post(`/api/jobapplications`, data),
//   getMyApplications: () => Get(`/api/jobapplications/me`),
//   getByJobPost: (jobpost_id: number) => Get(`/api/jobapplications/job/${jobpost_id}`),
//   updateStatus: (id: number, status: string) => Update(`/api/jobapplications/${id}/status`, { status }),

// }


// // Job Category APIs
// export const jobCategoryAPI = {
//   getAll: () => Get("/api/jobcategories", false),
//   getById: (id: number) => Get(`/api/jobcategories/${id}`, false),
// };

// // Job employmentType APIs
// export const employmentTypeAPI = {
//   getAll: () => Get("/api/employmenttypes", false), 
//   getById: (id: number) => Get(`/api/employmenttypes/${id}`, false),
// };

// // Salary Type APIs
// export const salaryTypeAPI = {
//   getAll: () => Get("/api/salarytype", false),
//   getById: (id: number) => Get(`/api/salarytype/${id}`, false),
// };

// // Payment APIs
// export const paymentAPI = {
//   getAll: () => Get("/payments"),
//   getById: (id: number) => Get(`/payment/${id}`),
//   create: (data: any) => Post("/payment", data),
// };

// // report APIs
// export const reportAPI = {
//   create: (data: any) => Post("/api/reports", data),
//   getAll: () => Get("/api/reports"),
//   getById: (id: number) => Get(`/api reports/${id}`),
//   update: (id: number, data: Partial<any>) => Update(`/api/reports/${id}`, data),
//   delete: (id: number) => Delete(`/api/reports/${id}`),
// };
import axios from "axios";
import type { AxiosResponse, AxiosError } from "axios";
import type { Employer, SignInEmployer } from "../../interfaces/employer";
import type { Student, SignInStudent } from "../../interfaces/student";
// ✨ 1. เปลี่ยน path การ import และเพิ่ม TicketAttachment
import type { FAQ, RequestTicket, TicketAttachment } from '../../interfaces/helpcenter';
import type {
  Review,
  CreateReviewRequest,
  FindReviewRequest,
} from "../../interfaces/review";
import type { Ratingscore } from "../../interfaces/ratingscore";
import type { Jobpost, CreateJobpost } from "../../interfaces/jobpost";
import type { Skill } from "../../interfaces/skill";

const API_URL = "http://localhost:8080/api";
export const UPLOAD_URL = `${API_URL}/upload`;


const getConfig = (requireAuth = true) => {
  const token = localStorage.getItem("token");
  const headers: { [key: string]: string } = {
    "Content-Type": "application/json",
  };
  if (requireAuth && token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return { headers };
};

// --- Helper Functions ---
const handleRequest = async (request: Promise<AxiosResponse>) => {
  try {
    const res = await request;
    return res;
  } catch (error) {
    const err = error as AxiosError;
    if (err.response?.status === 401) {
      console.error("Authentication error:", err.response);
    }
    return err.response;
  }
};

const get = (url: string, requireAuth = true) => handleRequest(axios.get(`${API_URL}${url}`, getConfig(requireAuth)));
const post = (url: string, data: any, requireAuth = true) => handleRequest(axios.post(`${API_URL}${url}`, data, getConfig(requireAuth)));
const put = (url: string, data: any, requireAuth = true) => handleRequest(axios.put(`${API_URL}${url}`, data, getConfig(requireAuth)));
const del = (url: string, requireAuth = true) => handleRequest(axios.delete(`${API_URL}${url}`, getConfig(requireAuth)));

// --- API Service Objects ---

export const authAPI = {
  studentLogin: (data: SignInStudent) =>
    post("/auth/student/login", data, false),
  employerLogin: (data: { email: string; password?: string }) =>
    post("/auth/employer/login", data, false),
};

// Student APIs
export const studentAPI = {
  signup: (data: Student) => post("/students", data, false),
  getAll: () => get("/students"),
  getById: (id: number) => get(`/students/${id}`),
  update: (id: number, data: Partial<Student>) =>
    put(`/students/${id}`, data),
  delete: (id: number) => del(`/students/${id}`),
};

// Employer APIs
export const employerAPI = {
  signup: (data: Employer) => post("/employers", data, false),
  getAll: () => get("/employers"),
  getById: (id: number) => get(`/employers/${id}`),
  update: (id: number, data: Partial<Employer>) =>
    put(`/employers/${id}`, data),
  delete: (id: number) => del(`/employers/${id}`),
};


// Job Post APIs
export const jobPostAPI = {
  create: (data: CreateJobpost) => post("/jobposts", data),
  getAll: () => get("/jobposts", false),
  getById: (id: number) => get(`/jobposts/${id}`, false),
  update: (id: number, data: Partial<Jobpost>) =>
  put(`/jobposts/${id}`, data),
  delete: (id: number) => del(`/jobposts/${id}`),
  getMyPosts: () => get("/employer/myposts"),
  uploadPortfolio: (id: number, file: File) => {
    const formData = new FormData();
    formData.append("portfolio", file);
    const token = localStorage.getItem("token");
    return axios.post(
    `${API_URL}/jobposts/upload-portfolio/${id}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    }
  );
  },
};

// Student Post APIs
export const studentPostAPI = {
    getStudentPosts: () => get("/student-posts", false),
    getStudentPostById: (id: number) => get(`/student-posts/${id}`, false),
    createStudentPost: (postData: any) => post("/student-posts", postData),
    updateStudentPost: (postId: number, postData: any) => put(`/student-posts/${postId}`, postData),
    deleteStudentPost: (postId: number) => del(`/student-posts/${postId}`),
    getMyStudentPosts: () => get("/my-posts"),
};

// Skill API
export const skillAPI = {
    getAllSkills: (): Promise<AxiosResponse<Skill[]>> => get("/skills") as Promise<AxiosResponse<Skill[]>>,
};

// Q&A and Help Center APIs
export const qnaAPI = {
  // FAQ APIs
  getFaqs: (): Promise<AxiosResponse<FAQ[]>> => get("/faqs", false) as Promise<AxiosResponse<FAQ[]>>,
  createFaq: (data: { title: string, content: string, image_url?: string }) => post("/admin/faqs", data),
  updateFaq: (id: string, data: { title: string, content: string, image_url?: string }) => put(`/admin/faqs/${id}`, data),
  deleteFaq: (id: string) => del(`/admin/faqs/${id}`),

  // Ticket APIs
  createTicket: (data: { subject: string; initial_message: string; attachments?: any[] }) => post("/tickets", data),
  getMyTickets: () => get("/tickets"),
  getAllTicketsForAdmin: () => get("/admin/tickets"),
  getTicketById: (ticketId: string) => get(`/tickets/${ticketId}`),
  // ✨ 2. แก้ไข Type ของ `data` ให้รองรับ `attachments`
  createTicketReply: (ticketId: string, data: { message: string; is_staff_reply: boolean; attachments?: Omit<TicketAttachment, 'ID'>[] }) => post(`/tickets/${ticketId}/replies`, data),
  updateTicketStatus: (ticketId: string, status: string) => put(`/admin/tickets/${ticketId}/status`, { status }),
};

// Profile API
export const profileAPI = {
    getMyProfile: () => get("/profile"),
};

// Job Application APIs
export const jobApplicationAPI = {
  init: (jobpost_id: number) => get(`/jobapplications/init/${jobpost_id}`),
  create: (data: any) => post(`/jobapplications`, data),
  getMyApplications: () => get(`/jobapplications/me`),
  getByJobPost: (jobpost_id: number) => get(`/jobapplications/job/${jobpost_id}`),
  updateStatus: (id: number, status: string) => put(`/jobapplications/${id}/status`, { status }),
};

// Job Category APIs
export const jobCategoryAPI = {
  getAll: () => get("/jobcategories", false),
  getById: (id: number) => get(`/jobcategories/${id}`, false),
};

// Job employmentType APIs
export const employmentTypeAPI = {
  getAll: () => get("/employmenttypes", false),
  getById: (id: number) => get(`/employmenttypes/${id}`, false),
};

// Salary Type APIs
export const salaryTypeAPI = {
  getAll: () => get("/salarytype", false),
  getById: (id: number) => get(`/salarytype/${id}`, false),
};

// Review & Rating APIs
export const reviewAPI = {
  create: (data: CreateReviewRequest) => post("/reviews", data),
  find: (data: FindReviewRequest) => post("/reviews/find", data),
  getForJob: (jobId: number) => get(`/reviews/job/${jobId}`),
};

export const ratingScoreAPI = {
  getAll: (): Promise<AxiosResponse<Ratingscore[]>> => get("/ratingscores") as Promise<AxiosResponse<Ratingscore[]>>,
};

// Payment APIs
export const paymentAPI = {
  getAll: () => get("/payments"),
  getById: (id: number) => get(`/payment/${id}`),
  create: (data: any) => post("/payment", data),
};

// Notification APIs
export const notificationAPI = {
  getMyNotifications: () => get("/notifications"),
  markAsRead: (id: number) => put(`/notifications/${id}/read`, {}),
  markAllAsRead: () => put("/notifications/read-all", {}),
};

// Report APIs
export const reportAPI = {
  create: (data: any) => post("/reports", data),
  getAll: () => get("/reports"),
  getById: (id: number) => get(`/reports/${id}`),
  update: (id: number, data: Partial<any>) => put(`/api/reports/${id}`, data),
  delete: (id: number) => del(`/api/reports/${id}`),
};

