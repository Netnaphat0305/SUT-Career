export interface User {
    username: string;
    password?: string;
    role: string;
}

export interface SignInCommon {
    username: string;
    password: string;
    role: "student" | "employer" | "admin";
}