import React from "react";
import { Route, Routes, useOutletContext } from "react-router-dom";
import EmployerProfile from "../pages/EmployerProfile/EmployerProfile";
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
import StudentListPage from "../pages/StudentListpage/StudentListPage";
import Reportpage from '../pages/Reportpage/reportpage/report';
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
import IncidentReportList from "../pages/Reportpage/reportlist";

import ManageApplicants from "../pages/ManageApplicants/ManageApplicants"; 
import MyApplications from "../pages/MyApplications/MyApplications"; 
import EditJobPost from "../pages/EditJobPost/EditJobPost";
import QRPaymentPage from "../pages/payment/qrpaymentpage";
import ViewReviewPage from "../pages/review/reviewhistory";
import FinancialReportPage from "../pages/studentfinance";
import StudentFeedPage from "../pages/StudentFeed/StudentFeedPage";
import ProfilePage2 from '../pages/profile2/ProfilePage2.tsx';
import StudentProfileEditPage from '../pages/ProfileEditPage/ProfileEditPage.tsx';


const MainRoutes: React.FC = () => {
    return (
      <Routes>
        <Route element={<FullLayout />}>
            {/* --- General Routes --- */}
            <Route path="/employer/profile" element={<EmployerProfile />} />
            <Route path="/" element={<Homepage />} />
            <Route path="/home" element={<Homepage />} />
            <Route path="/Job/Board" element={<Board />} />
            <Route path="/Job/post-detail/:id" element={<JobDetail />} />
            <Route path="/Job/ApplyJob" element={<ApplyJob />} />
            <Route path="/Job/post-job" element={<JobPost />} />
            <Route path="/Job/Mypost-job" element={<MyPost />} />
            <Route path="/job-ManageApplicants/:jobpost_id" element={<ManageApplicants />} />
            <Route path="/my-applications" element={<MyApplications />} />
            <Route path="/jobpost/edit/:id" element={<EditJobPost />} />
            <Route path="/interview" element={<Interview />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/students" element={<StudentListPage />} />
            <Route path="/report" element={<Reportpage />} />
            <Route path="/my-jobs" element={<JobsPage />} />
            <Route path="/payment-report" element={<PaymentReportPage />} />
            <Route path="/payment/:jobId" element={<PaymentPage />} />
            <Route path="/qr-payment/:paymentId" element={<QRPaymentPage />} />
            <Route path="/review/:jobId" element={<ReviewPage />} />
            <Route path="/reviews/view/:id" element={<ViewReviewPage/>}/>
            <Route path="/Interview-Schedule" element={<InterviewScheduling/>} />
            <Route path="/profile-v1" element={<ProfilePageV1 />} />
            <Route path="/student/:id/finance/summary" element={<FinancialReportPage />} />
            <Route path="/my/finance/summary" element={<FinancialReportPage />} />
            <Route path="/worklog" element={<WorklogPage />} />
            <Route path="/edit-report" element={<IncidentReportList />} />


        {/* --- Feed Routes --- */}
        <Route path="/feed" element={<StudentFeedPage />} />
        {/* โปรไฟล์เวอร์ชันเก่า ใช้ path ใหม่เพื่อไม่ชนกับ V2 */}
        <Route path="/profile-v1" element={<ProfilePageV1 />} />
        {/* --- Feed Routes (independent) --- */}
        {/* <Route path="/feed" element={<EmployerFeedPage />} />
        <Route path="/feed/create" element={<StudentPostForm />} /> */}
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