// services/https/index.tsx
import axios from "axios";
import type { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";

import type { Employer } from "../../interfaces/employer";
import type { Student } from "../../interfaces/student";
import type {
  CreateReviewPayload,
  FindReviewRequest,
} from "../../interfaces/review";
import type { Discount } from "../../interfaces/discount";
import type { Ratingscore } from "../../interfaces/ratingscore";
import type { Jobpost, CreateJobpost } from "../../interfaces/jobpost";
import type { Payment, CreatePaymentPayload } from "../../interfaces/payment";
import type { Order } from "../../interfaces/order";
import type { EmploymentType } from "../../interfaces/employment_type";
import type { JobCategory } from "../../interfaces/job_category";
import type { SalaryType } from "../../interfaces/salary_type";
import type { SignInCommon } from "../../interfaces/user";

/** ใช้ VITE_API_KEY เป็น baseURL เหมือนเดิม */
const API_URL = import.meta.env.VITE_API_KEY || "http://localhost:8080";

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
    } catch {}
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

// Authentication APIs
export const authAPI = {
  login: (data: SignInCommon) => Post("/login", data, false),
};

export const studentAPI = {
  signup: (data: Student) => Post("/students", data, false),
  getAll: () => Get("/students"),
  getById: (id: number) => Get(`/students/${id}`),
  update: (id: number, data: Partial<Student>) =>
    Update(`/students/${id}`, data),
  delete: (id: number) => DeleteReq(`/students/${id}`),
};

export const employerAPI = {
  signup: (data: Employer) => Post("/employers", data, false),
  getAll: () => Get("/employers"),
  getById: (id: number) => Get(`/employers/${id}`),
  update: (id: number, data: Partial<Employer>) =>
    Update(`/employers/${id}`, data),
  delete: (id: number) => DeleteReq(`/employers/${id}`),
};


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

export const paymentAPI = {
  create: (data: CreatePaymentPayload) => Post("/api/payments", data),
  getById: (id: number): Promise<{ data: Payment }> =>
    Get(`/api/payments/${id}`, true, { silent404: true }),
  getByBillableItem: (billableId: number): Promise<{ data: Payment }> =>
    Get(`/api/payments/billable/${billableId}`, true, { silent404: true }),
  getByJobId: (jobId: number) => Get(`/api/payments/job/${jobId}`),
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

export const paymentReportAPI = {
  getMine: () => Get("/api/payment-reports/me"),
  getByEmployerId: (id: number) => Get(`/api/payment-reports/employer/${id}`),
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

export const reviewAPI = {
  create: (data: CreateReviewPayload) => Post("/api/reviews", data),
  find: (data: FindReviewRequest) => Post("/api/reviews/find", data),
  getForJob: (jobId: number) => Get(`/api/reviews/job/${jobId}`),
};

export const ratingScoreAPI = {
  getAll: (): Promise<{ data: Ratingscore[] }> =>
    Get<{ data: Ratingscore[] }>(`/api/reviews/scores`),
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
};

// Job Application APIs
export const jobApplicationAPI = {
  init: (jobpost_id: number) => Get(`/api/jobapplications/init/${jobpost_id}`),
  create: (data: any) => Post(`/api/jobapplications`, data),
  getMyApplications: () => Get(`/api/jobapplications/me`),
  getByJobPost: (jobpost_id: number) => Get(`/api/jobapplications/job/${jobpost_id}`),
  updateStatus: (id: number, status: string) => Update(`/api/jobapplications/${id}/status`, { application_status: status }),
  checkApplied: (jobpost_id: number, student_id: number) => Get(`/api/jobapplications/check/${jobpost_id}/${student_id}`)
};

// Job Category APIs
export const jobCategoryAPI = {
  getAll: () => Get("/api/jobcategories", false),
  getById: (id: number) => Get(`/api/jobcategories/${id}`, false),
};

// Job employmentType APIs
export const employmentTypeAPI = {
  getAll: () => Get("/api/employmenttypes", false),
  getById: (id: number) => Get(`/api/employmenttypes/${id}`, false),
};

// Salary Type APIs
export const salaryTypeAPI = {
  getAll: () => Get("/api/salarytype", false),
  getById: (id: number) => Get(`/api/salarytype/${id}`, false),
};

// report APIs
export const reportAPI = {
  create: (data: any) => Post("/api/reports", data),
  getAll: () => Get("/api/reports"),
  getById: (id: number) => Get(`/api reports/${id}`),
  getByUserId: (userId: number) => Get(`/api/reports/user/${userId}`),
  update: (id: number, data: Partial<any>) => Update(`/api/reports/${id}`, data),
  delete: (id: number) => Delete(`/api/reports/${id}`),
};

export const worklogAPI = {
  create: (data: any) => Post("/worklogs", data),
  getAll: () => Get("/worklogs"),
  getById: (id: number) => Get(`/worklogs/${id}`),
  getByUserId: (userId: number) => Get(`/worklogs/user/${userId}`),
  update: (id: number, data: Partial<any>) => Update(`/worklogs/${id}`, data),
  delete: (id: number) => Delete(`/worklogs/${id}`),
  
};

