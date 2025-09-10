import React from "react";
import { Route, Routes } from "react-router-dom";
import FullLayout from '../layouts/FullLayout';
import HelpCenterPage from '../pages/HelpCenter/HelpCenterPage';
import CreateRequestPage from '../pages/HelpCenter/CreateRequestPage';
import RequestThreadPage from '../pages/RequestThreadPage/RequestThreadPage';
import Homepage from '../pages/Home/Home';
import Board from "../pages/Board/Board";
import JobDetail from "../pages/Board/JobDetail";
import ApplyJob from "../pages/ApplyJob/ApplyJob";
import Interview from '../pages/Interview/Interview';
import Chat from '../pages/Chat/Chat';
import StudentListPage from "../pages/worklog/StudentListPage";
import Reportpage from '../pages/Reportpage/report';
import JobsPage from '../pages/myjob';
import PaymentReportPage from '../pages/paymentreport';
import ProfilePageV1 from '../pages/profile';
import ReviewPage from '../pages/review';
import PaymentPage from '../pages/payment';
import JobPost from "../pages/JobPost/JobPost";
import InterviewScheduling from "../pages/InterviewScheduling/InterviewScheduling";
import FaqDetailPage from "../pages/HelpCenter/FaqDetailPage";
import MyPost from '../pages/MyPost/Mypost'
import WorklogPage from "../pages/worklog/worklog";
import StudentFeedPage from "../pages/StudentFeed/StudentFeedPage";
import ProfilePage2 from '../pages/profile2/ProfilePage2.tsx';
import StudentProfileEditPage from '../pages/ProfileEditPage/ProfileEditPage.tsx';

const MainRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<FullLayout />}>
        {/* --- General Routes --- */}
        <Route index element={<Homepage />} />
        <Route path="board" element={<Board />} />
        <Route path="job/:id" element={<JobDetail />} />
        <Route path="apply/:id" element={<ApplyJob />} />
        <Route path="interview" element={<Interview />} />
        <Route path="chat" element={<Chat />} />
        <Route path="student-list" element={<StudentListPage />} />
        <Route path="report" element={<Reportpage />} />
        <Route path="myjob" element={<JobsPage />} />
        <Route path="payment-report" element={<PaymentReportPage />} />
        <Route path="profilev1" element={<ProfilePageV1 />} />
        <Route path="review" element={<ReviewPage />} />
        <Route path="payment" element={<PaymentPage />} />
        <Route path="job-post" element={<JobPost />} />
        <Route path="interview-scheduling" element={<InterviewScheduling />} />
        <Route path="my-post" element={<MyPost />} />
        <Route path="worklog" element={<WorklogPage />} />

        {/* --- Feed Routes --- */}
        <Route path="/feed" element={<StudentFeedPage />} />

        {/* --- Profile & Help Center Routes --- */}
        {/* ⭐ แก้ไข: ใช้ studentId แทน userId เพื่อให้ตรงกับการส่งค่าจาก goToProfile */}
        <Route path="profile" element={<ProfilePage2 />} />
        <Route path="profile/:studentId" element={<ProfilePage2 />} />
        <Route path="profile/edit" element={<StudentProfileEditPage />} />
        <Route path="help" element={<HelpCenterPage />} />
        <Route path="help/request" element={<CreateRequestPage />} />
        <Route path="help/request/:id" element={<RequestThreadPage />} />
        <Route path="help/faq/:id" element={<FaqDetailPage />} />
      </Route>
    </Routes>
  );
};

export default MainRoutes;