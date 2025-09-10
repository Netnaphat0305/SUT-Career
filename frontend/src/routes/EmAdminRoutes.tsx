// src/routes/EmAdminRoutes.tsx
// สำหรับผู้ว่าจ้าง/แอดมิน
import React from "react";
import { Routes, Route } from "react-router-dom";
import JobPost from "../pages/JobPost/JobPost";

const EmAdminRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/Job/post-job" element={<JobPost />} />
    </Routes>
  );
};

export default EmAdminRoutes;

//อันนี้ไม่น่าได้ใช้แล้วมั้ย