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
import ProfilePageV2 from '../pages/ProfilePage2/ProfilePage';


const MainRoutes: React.FC = () => {
    return (
      <Routes>
        <Route element={<FullLayout />}>
            {/* --- General Routes --- */}
            <Route path="/" element={<Homepage />} />
            <Route path="/home" element={<Homepage />} />
            <Route path="/Job/Board" element={<Board />} />
            <Route path="/Job/post-detail/:id" element={<JobDetail />} />
            <Route path="/Job/ApplyJob" element={<ApplyJob />} />
            <Route path="/Job/post-job" element={<JobPost />} />
            <Route path="/Job/Mypost-job" element={<MyPost />} />
            <Route path="/interview" element={<Interview />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/students" element={<StudentListPage />} />
            <Route path="/report" element={<Reportpage />} />
            <Route path="/my-jobs" element={<JobsPage />} />
            <Route path="/payment-report" element={<PaymentReportPage />} />
            <Route path="/payment" element={<PaymentPage />} />
            <Route path="/review" element={<ReviewPage />} />
            <Route path="/Interview-Schedule" element={<InterviewScheduling/>} />
            <Route path="/profile-v1" element={<ProfilePageV1 />} />
            <Route path="/review-page" element={<ReviewPage />} />
            <Route path="/worklog" element={<WorklogPage />} />
          

            {/* --- Feed Routes --- */}
            <Route path="/feed" element={<StudentFeedPage />} />
            
            {/* --- Profile & Help Center Routes --- */}
            <Route path="/profile/:userId" element={<ProfilePageV2 />} />
            <Route path="/profile" element={<ProfilePageV2 />} />
            <Route path="/help" element={<HelpCenterPage />} />
            <Route path="/help/ask" element={<CreateRequestPage />} />
            <Route path="/help/faq/:id" element={<FaqDetailPage />} />
            <Route path="/help/request/:id" element={<RequestThreadPage />} />
        </Route>
    </Routes>
  );
};

export default MainRoutes;

