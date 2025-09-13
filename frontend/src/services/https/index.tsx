//services/https/index.tsx
import axios from "axios";
import type { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
import type { ChatRoom, ChatHistory } from "../../interfaces/Chat";
import type { InterviewScheduling } from "../../interfaces/InterviewScheduling"

import type { Employer, SignInEmployer } from "../../interfaces/employer";
import type { Student, SignInStudent } from "../../interfaces/student";
import type {
  CreateReviewPayload,
  Review,
  FindReviewRequest,
} from "../../interfaces/review";
import type {
  FAQ,
  RequestTicket,
  TicketAttachment,
  FAQComment,
} from "../../interfaces/helpcenter";
import type { Discount } from "../../interfaces/discount";
import type { Jobpost, CreateJobpost } from "../../interfaces/jobpost";
import type {
  Payment,
  CreatePaymentPayload,
  StudentFinanceResponse,
  FinanceSummaryResponse,
} from "../../interfaces/payment";
import type { Order } from "../../interfaces/order";
import type { EmploymentType } from "../../interfaces/employment_type";
import type { JobCategory } from "../../interfaces/job_category";
import type { SalaryType } from "../../interfaces/salary_type";
import type { SignInCommon } from "../../interfaces/user";
import type { CreateBillableitemPayload } from "../../interfaces/billableitem";
import type { Paymentmethod } from "../../interfaces/paymentmethod";
import type { Ratingscore } from "../../interfaces/ratingscore";
import type { Skill } from "../../interfaces/skill";
/** ใช้ VITE_API_KEY เป็น baseURL เหมือนเดิม */
const API_URL = import.meta.env.VITE_API_KEY || "http://localhost:8080";
export const UPLOAD_URL = `${API_URL}/upload`;
/** build URL ให้สะอาด */
const buildUrl = (path: string) =>
  `${API_URL.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;

/** ดึง token จาก cookie/localStorage */
const getAuthToken = (): string | null => {
  const cookies = (typeof document !== "undefined" ? document.cookie : "")
    .split("; ")
    .filter(Boolean);
  const cookie = cookies.find((row) => row.startsWith("auth_token="));
  if (cookie) {
    let token = decodeURIComponent(cookie.split("=")[1] || "");
    token = token.replace(/\\/g, "").replace(/"/g, "");
    if (token) return token;
  }
  return (
    (typeof localStorage !== "undefined" && localStorage.getItem("token")) ||
    (typeof localStorage !== "undefined" &&
      localStorage.getItem("auth_token")) ||
    null
  );
};

const getAuthConfig = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
      "Content-Type": "application/json",
    },
  };
};

const getNoAuthConfig = () => ({
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

/* -------------------- helpers: status/message -------------------- */
export const getHttpStatus = (e: any): number =>
  e?.status ?? e?.response?.status ?? e?.request?.status ?? 0;

export const getHttpMessage = (e: any): string =>
  e?.response?.data?.error || e?.message || "API error";

/* -------------------- axios instance -------------------- */
const http = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

/* -------------------- error handling (ปรับให้เงียบ 404 ได้) -------------------- */
type ReqOpts = {
  /** เงียบทุกสถานะ (ไม่ log) */
  silent?: boolean;
  /** เงียบเฉพาะ 404 (ใช้กับ pre-check/fallback) */
  silent404?: boolean;
};

const handleApiError = (error: AxiosError, opts?: ReqOpts): never => {
  const status = error.response?.status;

  if (status === 401) {
    // จัดการ token หมดอายุ → เคลียร์ + redirect ไป login
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user");
      localStorage.removeItem("profile");
      document.cookie = "auth_token=; Path=/; Max-Age=0; SameSite=Lax";
    } catch { }
    if (window.location.pathname !== "/login") {
      window.location.replace("/login");
    }
  }

  // ถ้า caller ขอให้เงียบ 404
  if (opts?.silent404 && status === 404) {
    const err: any = new Error(
      (error.response?.data as any)?.error || "Not Found"
    );
    err.status = 404;
    err.response = error.response;
    throw err;
  }

  // log แบบเบา ๆ เว้นแต่ขอ silent
  if (!opts?.silent) {
    const msg =
      (error.response?.data as any)?.error || error.message || "API error";
    // ใช้ debug เพื่อลดเสียงใน console
    // eslint-disable-next-line no-console
    console.debug("API call failed:", msg, "(status:", status + ")");
  }

  const err: any = new Error(
    (error.response?.data as any)?.error || error.message || "API error"
  );
  err.status = status;
  err.response = error.response;
  err.data = error.response?.data;
  throw err;
};

/* -------------------- generic methods (เพิ่ม opts) -------------------- */
export async function Get<T = any>(
  url: string,
  requireAuth: boolean = true,
  opts?: ReqOpts,
  config?: AxiosRequestConfig
): Promise<T> {
  const cfg = {
    ...(requireAuth ? getAuthConfig() : getNoAuthConfig()),
    ...(config || {}),
  };
  try {
    const res = await http.get(buildUrl(url), cfg);
    return res.data as T;
  } catch (error) {
    return handleApiError(error as AxiosError, opts);
  }
}

export async function Post<T = any>(
  url: string,
  data?: any,
  requireAuth: boolean = true,
  opts?: ReqOpts,
  config?: AxiosRequestConfig
): Promise<T> {
  const cfg = {
    ...(requireAuth ? getAuthConfig() : getNoAuthConfig()),
    ...(config || {}),
  };
  try {
    const res = await http.post(buildUrl(url), data, cfg);
    return res.data as T;
  } catch (error) {
    return handleApiError(error as AxiosError, opts);
  }
}

export const DeleteReq = async (
  url: string,
  requireAuth: boolean = true
): Promise<AxiosResponse | any> => {
  const config = requireAuth ? getAuthConfig() : getNoAuthConfig();
  return await axios
    .get(`${API_URL}${url}`, config)
    .then((res) => res.data)
    .catch((error: AxiosError) => {
      if (error?.message === "Network Error") {
        return error.response;
      }
      // if (error?.response?.status === 401) {
      //   localStorage.clear();
      //   window.location.reload();
      // }
      return error.response;
    });
};

export const Update = async (
  url: string,
  data: any,
  requireAuth: boolean = true
): Promise<AxiosResponse | any> => {
  const config = requireAuth ? getAuthConfig() : getNoAuthConfig();
  return await axios
    .put(`${API_URL}${url}`, data, config)
    .then((res) => res.data)
    .catch((error: AxiosError) => {
      // if (error?.response?.status === 401) {
      //   localStorage.clear();
      //   window.location.reload();
      // }
      return error.response;
    });
};

export const Delete = async (
  url: string,
  requireAuth: boolean = true
): Promise<AxiosResponse | any> => {
  const config = requireAuth ? getAuthConfig() : getNoAuthConfig();
  return await axios
    .delete(`${API_URL}${url}`, config)
    .then((res) => res.data)
    .catch((error: AxiosError) => {
      // if (error?.response?.status === 401) {
      //   localStorage.clear();
      //   window.location.reload();
      // }
      return error.response;
    });
};

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

const get = (url: string, requireAuth = true) =>
  handleRequest(axios.get(`${API_URL}${url}`, getConfig(requireAuth)));
const post = (url: string, data: any, requireAuth = true) =>
  handleRequest(axios.post(`${API_URL}${url}`, data, getConfig(requireAuth)));
const put = (url: string, data: any, requireAuth = true) =>
  handleRequest(axios.put(`${API_URL}${url}`, data, getConfig(requireAuth)));
const del = (url: string, requireAuth = true) =>
  handleRequest(axios.delete(`${API_URL}${url}`, getConfig(requireAuth)));

// --- API Service Objects ---

export const authAPI = {
  login: (data: SignInCommon) => Post("/api/login", data, false),
  studentLogin: (data: SignInStudent) =>
    post("/auth/student/login", data, false),
  employerLogin: (data: { email: string; password?: string }) =>
    post("/auth/employer/login", data, false),
};

export const studentAPI = {
  signup: (data: Student) => post("/students", data, false),
  getAll: () => get("/students"),
  getById: (id: number) => get(`/students/${id}`),
  getByUserId: (userId: number) => get(`/students/user/${userId}`),
  //============edit by netnaphat แก้ให้มันไม่ซ้ำเพราะต้องใช้ update เหมือนกัน=============================//
  updateapply: (id: number, data: Partial<Student>) =>
    Update(`/api/student/${id}`, data),
  deleteapply: (id: number) => DeleteReq(`/students/${id}`),
  //===============================================================================================//
  update: (id: number, data: Partial<Student>) => put(`students/${id}`, data),
  delete: (id: number) => del(`/students/${id}`),
};

export const employerAPI = {
  signup: (data: Employer) => post("/employers", data, false),
  getAll: () => get("/employers"),
  getById: (id: number) => get(`/employers/${id}`),
  update: (id: number, data: Partial<Employer>) =>
    Update(`/employers/${id}`, data),
  delete: (id: number) => DeleteReq(`/employers/${id}`),
};
//     put(`/employers/${id}`, data),
//   delete: (id: number) => del(`/employers/${id}`),
// };
// Employer Profile APIs (Base64 JSON version)
export const employerProfileAPI = {
  getMe: () =>
    axios.get(`${API_URL}/api/employer/me`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      withCredentials: true,
    }),

  // ส่ง JSON: { avatar_url: "data:image/png;base64,..." }
  uploadAvatar: (payload: { avatar_url: string }) =>
    axios.put(`${API_URL}/api/employer/me/avatar`, payload, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      withCredentials: true,
    }),
};

export const jobpostAPI = {
  create: (data: Jobpost) => Post("/api/myjobposts", data),
  getAll: () => Get("/api/myjobposts"),
  getById: (id: number): Promise<{ data: Jobpost }> =>
    Get<{ data: Jobpost }>(`/api/myjobposts/${id}`),
  getByEmployerId: (id: number): Promise<{ data: Jobpost[] }> =>
    Get<{ data: Jobpost[] }>(`/api/myjobposts/employer/${id}`),
  update: (id: number, data: Partial<Jobpost>) =>
    Update(`/api/myjobposts/${id}`, data),
  delete: (id: number) => DeleteReq(`/api/myjobposts/${id}`),
};

export const myjobpostAPI = {
  getAcceptedApplications: () => Get(`/api/my-jobs/accepted`),
  getById: (id: number) => Get(`/api/my-jobs/${id}`),
};

export const billableItemAPI = {
  create: (data: CreateBillableitemPayload) =>
    Post("/api/billable_items", data),
  getById: (id: number) => Get(`/api/billable_items/${id}`),
  getByJobPostId: (jobPostId: number) =>
    Get(`/api/billable_items/jobpost/${jobPostId}`),
  list: () => Get("/billable_items"),
  delete: (id: number) => DeleteReq(`/api/billable_items/${id}`),
};

export const paymentAPI = {
  create: (data: CreatePaymentPayload) => Post("/api/payments", data),
  getById: (id: number): Promise<{ data: Payment }> =>
    Get(`/api/payments/${id}`, true, { silent404: true }),
  getLatestByBillable: (billableId: number) =>
    Get(`/api/payments/billable/${billableId}`),
  getByEmployerId: (employerId: number): Promise<{ data: Payment[] }> =>
    Get(`/api/payments/employer/${employerId}`),
  update: (id: number, data: Partial<Payment>) =>
    Update(`/api/payments/${id}`, data),
  uploadEvidence: (paymentId: number, form: FormData) =>
    axios.post(buildUrl(`/api/payments/${paymentId}/evidence`), form, {
      withCredentials: true,
      headers: {
        ...(getAuthToken()
          ? { Authorization: `Bearer ${getAuthToken()}` }
          : {}),
        "Content-Type": "multipart/form-data",
      },
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
    }),
};

export const PaymentmethodAPI = {
  list: () => Get<Paymentmethod[]>(`/api/paymentmethods`),
};

export const discountAPI = {
  list: () => Get<Discount[]>(`/api/discounts`),
  getApplicableByJob: (jobPostId: number) =>
    Get<Discount[]>(`/discounts/applicable?job_post_id=${jobPostId}`),
  getUsedByEmployer: (employerId: number) =>
    Get<number[] | { discount_id: number }[]>(
      `/discounts/used?employer_id=${employerId}&employerId=${employerId}`
    ),
  checkUsage: (discountId: number, employerId: number) =>
    Get<{ used: boolean } | { data: { used: boolean } }>(
      `/discounts/${discountId}/usage?employer_id=${employerId}&employerId=${employerId}`
    ),
};

export const paymentReportAPI = {
  getMine: () => Get("/api/payment-reports/me", true),
  getByEmployerId: (id: number) =>
    Get(`/api/payment-reports/employer/${id}`, true),
  upload: (form: FormData) =>
    axios.post(buildUrl("/api/payment-reports/upload"), form, {
      headers: {
        "Content-Type": "multipart/form-data",
        ...(getAuthToken()
          ? { Authorization: `Bearer ${getAuthToken()}` }
          : {}),
      },
    }),
};
export const StudentFinanceAPI = {
  // API ใหม่ที่ใช้ JWT token
  getFinanceData: async (): Promise<StudentFinanceResponse> => {
    console.log(`📊 Fetching my finance data (using JWT token)`);

    try {
      const response = await Get<StudentFinanceResponse>(`/api/my/finance`);

      console.log("💰 My finance data response:", {
        hasData: !!response?.data,
        dataLength: response?.data?.length || 0,
        data: response?.data,
      });

      if (!response) {
        throw new Error("No response received from server");
      }

      if (!response.data) {
        console.warn("⚠️ Response has no data property");
        return { data: [] };
      }

      if (!Array.isArray(response.data)) {
        console.warn("⚠️ Response data is not an array:", typeof response.data);
        return { data: [] };
      }

      return response;
    } catch (error) {
      console.error("💥 Error fetching my finance data:", error);
      throw error;
    }
  },

  getFinanceSummary: async (): Promise<FinanceSummaryResponse> => {
    console.log(`📈 Fetching my finance summary (using JWT token)`);

    try {
      const response = await Get<FinanceSummaryResponse>(
        `/api/my/finance/summary`
      );

      console.log("📊 My finance summary response:", {
        hasData: !!response?.data,
        summary: response?.data,
      });

      if (!response) {
        throw new Error("No response received from server");
      }

      if (!response.data) {
        console.warn("⚠️ Summary response has no data property");
        return {
          data: {
            monthlyJobCount: 0,
            totalJobCount: 0,
            totalEarnings: 0,
          },
        };
      }

      return response;
    } catch (error) {
      console.error("💥 Error fetching my finance summary:", error);
      throw error;
    }
  },

  // ✅ เพิ่ม missing functions ที่ Frontend ต้องการ
  getFinanceDataByStudentId: async (
    studentId: number
  ): Promise<StudentFinanceResponse> => {
    console.log(`📊 Fetching finance data for student ID: ${studentId}`);

    try {
      const response = await Get<StudentFinanceResponse>(
        `/api/student/${studentId}/finance`
      );

      console.log("💰 Finance data response:", {
        hasData: !!response?.data,
        dataLength: response?.data?.length || 0,
        data: response?.data,
      });

      if (!response) {
        throw new Error("No response received from server");
      }

      if (!response.data) {
        console.warn("⚠️ Response has no data property");
        return { data: [] };
      }

      if (!Array.isArray(response.data)) {
        console.warn("⚠️ Response data is not an array:", typeof response.data);
        return { data: [] };
      }

      return response;
    } catch (error) {
      console.error("💥 Error fetching finance data:", error);
      throw error;
    }
  },

  getFinanceSummaryByStudentId: async (
    studentId: number
  ): Promise<FinanceSummaryResponse> => {
    console.log(`📈 Fetching finance summary for student ID: ${studentId}`);

    try {
      const response = await Get<FinanceSummaryResponse>(
        `/api/student/${studentId}/finance/summary`
      );

      console.log("📊 Finance summary response:", {
        hasData: !!response?.data,
        summary: response?.data,
      });

      if (!response) {
        throw new Error("No response received from server");
      }

      if (!response.data) {
        console.warn("⚠️ Summary response has no data property");
        return {
          data: {
            monthlyJobCount: 0,
            totalJobCount: 0,
            totalEarnings: 0,
          },
        };
      }

      return response;
    } catch (error) {
      console.error("💥 Error fetching finance summary:", error);
      throw error;
    }
  },
};

export const adminFinanceAPI = {
  summary: (from?: string, to?: string) =>
    Get(
      `/api/admin/finance/summary${
        from ? `?from=${from}&to=${to ?? from}` : ""
      }`
    ),
};

export const reviewAPI = {
  create: (data: CreateReviewPayload) => Post("/api/reviews", data),
  getForJob: (jobId: number) => Get(`/api/reviews/job/${jobId}`),
  getById: (id: string): Promise<{ data: Review }> =>
    Get(`/api/reviews/view/${id}`),
};

// Job Post APIs
export const jobPostAPI = {
  create: (data: CreateJobpost) => Post("/api/jobposts", data),
  getAll: () => Get("/api/jobposts"),
  getById: (id: number) => Get(`/api/jobposts/${id}`),
  update: (id: number, data: Partial<Jobpost>) =>
    Update(`/api/jobposts/${id}`, data),
  delete: (id: number) => Delete(`/api/jobposts/${id}`),
  getMyPosts: () => Get("/api/employer/myposts"), // ใช้ token จาก localStorage


  // Upload Portfolio
  uploadPortfolio: (id: number, file: File) => {
    const formData = new FormData();
    formData.append("portfolio", file);

    const token = localStorage.getItem("token");
    return axios.post(
      `${API_URL}/api/jobposts/upload-portfolio/${id}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      }
    );
  },

  // Upload Logo (เก็บใน image_url)
  uploadLogo: (id: number, file: File) => {
    const formData = new FormData();
    formData.append("logo", file);

    const token = localStorage.getItem("token");
    return axios.post(`${API_URL}/api/jobposts/upload-logo/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    });
  },
};

// Job Application APIs
export const jobApplicationAPI = {
  init: (jobpost_id: number) => Get(`/api/jobapplications/init/${jobpost_id}`),
  create: (data: any) => Post(`/api/jobapplications`, data),
  getMyApplications: () => Get(`/api/jobapplications/me`),
  getByJobPost: (jobpost_id: number) =>
    Get(`/api/jobapplications/job/${jobpost_id}`),
  updateStatus: (id: number, status: string) =>
    Update(`/api/jobapplications/${id}/status`, { application_status: status }),
  checkApplied: (jobpost_id: number, student_id: number) =>
    Get(`/api/jobapplications/check/${jobpost_id}/${student_id}`),

  // แก้ตรงนี้ ให้รับ FormData
  uploadResume: (id: number, formData: FormData) => {
    return axios.post(
      `${API_URL}/api/jobapplications/${id}/upload-resume`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
  },
};

// Student Post APIs (รวมจาก studentPostService.ts)
export const studentPostAPI = {
  getStudentPosts: () => get("/api/student-posts", false),
  getStudentPostById: (id: number) => get(`/api/student-posts/${id}`, false),
  getPostsByStudentId: (studentId: number) =>
    get(`/api/student-posts/student/${studentId}`, false),
  createStudentPost: (postData: any) => post("/api/student-posts", postData),
  updateStudentPost: (postId: number, postData: any) =>
    put(`/api/student-posts/${postId}`, postData),
  deleteStudentPost: (postId: number) => del(`/api/student-posts/${postId}`),
  getMyStudentPosts: () => get("/my-posts"),
};

// Skill API
export const skillAPI = {
  getAllSkills: (): Promise<AxiosResponse<Skill[]>> =>
    get("/skills") as Promise<AxiosResponse<Skill[]>>,
};

// Q&A and Help Center APIs
export const qnaAPI = {
  // FAQ APIs
  getFaqs: (): Promise<AxiosResponse<{ data: FAQ[] }>> =>
    get("/api/faqs", false) as Promise<AxiosResponse<{ data: FAQ[] }>>,
  getFaqById: (id: string): Promise<AxiosResponse<{ data: FAQ }>> =>
    get(`/api/faqs/${id}`, false) as Promise<AxiosResponse<{ data: FAQ }>>,
  createFaq: (data: {
    title: string;
    content: string;
    image_url?: string;
    comments_enabled: boolean;
  }) => post("/api/admin/faqs", data),
  updateFaq: (
    id: string,
    data: {
      title: string;
      content: string;
      image_url?: string;
      comments_enabled: boolean;
    }
  ) => put(`/api/admin/faqs/${id}`, data),
  deleteFaq: (id: string) => del(`/api/admin/faqs/${id}`),

  // FAQ Comment APIs
  getFaqComments: (
    faqId: string
  ): Promise<AxiosResponse<{ data: FAQComment[] }>> =>
    get(`/api/faqs/${faqId}/comments`, false) as Promise<
      AxiosResponse<{ data: FAQComment[] }>
    >,
  createFaqComment: (
    faqId: string,
    data: { content: string }
  ): Promise<AxiosResponse<{ data: FAQComment }>> =>
    post(`/api/faqs/${faqId}/comments`, data) as Promise<
      AxiosResponse<{ data: FAQComment }>
    >,

  // Ticket APIs
  createTicket: (data: {
    subject: string;
    initial_message: string;
    attachments?: any[];
  }) => post("/api/tickets", data),
  getMyTickets: () => get("/api/tickets"),
  getAllTicketsForAdmin: () => get("/api/admin/tickets"),
  getTicketById: (ticketId: string) => get(`/api/tickets/${ticketId}`),
  createTicketReply: (
    ticketId: string,
    data: {
      message: string;
      is_staff_reply: boolean;
      attachments?: Omit<TicketAttachment, "ID">[];
    }
  ) => post(`/api/tickets/${ticketId}/replies`, data),
  updateTicketStatus: (ticketId: string, status: string) =>
    put(`/api/admin/tickets/${ticketId}/status`, { status }),
};

// Profile API
export const profileAPI = {
  getMyProfile: () => get("/profile"),
  getProfileById: (studentId: string) => get(`/profile/${studentId}`),
};

// Job Category APIs
export const jobCategoryAPI = {
  getAll: () => get("/api/jobcategories", false),
  getById: (id: number) => get(`/api/jobcategories/${id}`, false),
};

// Job employmentType APIs
export const employmentTypeAPI = {
  getAll: () => Get("/api/employmenttypes", false),
  getById: (id: number) => Get(`/api/employmenttypes/${id}`, false),
};

// Salary Type APIs
export const salaryTypeAPI = {
  getAll: () => get("/api/salarytype", false),
  getById: (id: number) => get(`/api/salarytype/${id}`, false),
};

export const ratingScoreAPI = {
  getAll: (): Promise<AxiosResponse<Ratingscore[]>> =>
    get("/ratingscores") as Promise<AxiosResponse<Ratingscore[]>>,
};

// report APIs
export const reportAPI = {
  create: (data: any) => Post("/api/reports", data),
  getAll: () => Get("/api/reports"),
  getById: (id: number) => Get(`/api reports/${id}`),
  getByUserId: (userId: number) => Get(`/api/reports/user/${userId}`),
  update: (id: number, data: Partial<any>) =>
    Update(`/api/reports/${id}`, data),
  delete: (id: number) => Delete(`/api/reports/${id}`),
};

//==================== edit by book ===========================
export const interviewSchedulingAPI = {
  list: (): Promise<InterviewScheduling[]> =>
    Get("/api/interview-schedules/get"),

  getById: (id: number): Promise<InterviewScheduling> =>
    Get(`/api/interview-schedules/get/${id}`),

  getByEmployerId: (): Promise<InterviewScheduling[]> =>
    Get(`/api/interview-schedules/get/employer/`),

  create: (data: {
    DateAndTimeStart: string;
    DateAndTimeEnd: string;
    Status: string;
    Detail: string;
  }): Promise<InterviewScheduling> =>
    Post("/api/interview-schedules/create", data),

  delete: (id: number): Promise<any> =>
    Delete(`/api/interview-schedules/delete/${id}`),
}

// ===== Interview APIs =====
export const interviewAPI = {
  book: (payload: {
    job_application_id: number;
    schedule_id: number;
  }) => Post("/api/interviews/book", payload),

  getByStudent: (studentId: number) =>
    Get(`/api/interviews/student/${studentId}`),

  getByEmployer: (employerId: number) =>
    Get(`/api/interviews/employer/${employerId}`),

  GetInterviewsTableByApplication: (applicationID: number) =>
    Get(`/api/interviews/application/${applicationID}`),
};


export const chatAPI = {
  listMyRooms: (): Promise<ChatRoom[]> => Get("/api/chat/rooms"),

  createOrGetRoom: (targetId: number, targetRole: string): Promise<ChatRoom> =>
    Post("/api/chat/rooms", { target_id: targetId, target_role: targetRole }),

  listMessages: (roomId: number): Promise<ChatHistory[]> =>
    Get(`/api/chat/rooms/${roomId}/messages`),

  // ✅ รองรับข้อความ + รูปภาพ
  sendMessage: (
    roomId: number,
    payload: { message?: string; image_url?: string; message_type: string }
  ): Promise<ChatHistory> =>
    Post(`/api/chat/rooms/${roomId}/messages`, payload),
};

export const ChatUploadAPI = {
  uploadFile: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await axios.post(`${API_URL}/api/upload`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    return res.data.url; // ได้ URL กลับมา เช่น http://localhost:8080/uploads/xxx.png
  },
};


//==================== edit by book ===========================
export const worklogAPI = {
  create: (data: any) => Post("api/worklogs", data),
  getAll: () => Get("/worklogs"),
  getById: (id: number) => Get(`/worklogs/${id}`),
  getByUserId: (userId: number) => Get(`/worklogs/user/${userId}`),
  update: (id: number, data: Partial<any>) => Update(`/worklogs/${id}`, data),
  delete: (id: number) => Delete(`/worklogs/${id}`),
  getByEmployerID: (employerId: number) =>
    Get(`/api/worklogs/employer/${employerId}`),
  getJobpostByUserID: (userId: number) => Get(`/api/worklogs/user/${userId}`),
  getJobApplicationByJobpostID: (jobpostID: number) =>
    Get(`/api/jobapplications/${jobpostID}`),
};
