import React from "react";
import { Route, Routes, useOutletContext } from "react-router-dom";
import FullLayout from "../layouts/FullLayout";
import StudentPostManager from "../pages/StudentPost";
import FeedPage from "../components/QA/FeedPage";
import PostCreator from "../components/QA/PostCreator";
import ProfilePageV2 from "../pages/ProfilePage2/ProfilePage";
import FAQPage from "../pages/StudentPost/FAQPage";
import AskQuestionPage from "../pages/StudentPost/AskQuestionPage";
import QuestionDetailPage from "../pages/StudentPost/QuestionDetailPage";
import RequestThreadPage from "../pages/RequestThreadPage/RequestThreadPage";
import RequestStatusPage from "../pages/RequestThreadPage/RequestStatusPage";
import Homepage from "../pages/Home/Home";
import Board from "../pages/Board/Board";
import JobDetail from "../pages/Board/JobDetail";
import ApplyJob from "../pages/ApplyJob/ApplyJob";
import Interview from "../pages/Interview/Interview";
import Chat from "../pages/Chat/Chat";
import StudentListPage from "../pages/StudentListpage/StudentListPage";
import Reportpage from "../pages/Reportpage/report";
import JobsPage from "../pages/myjob";
import PaymentReportPage from "../pages/paymentreport";
import ProfilePageV1 from "../pages/profile";
import ReviewPage from "../pages/review";
import PaymentPage from "../pages/payment";
import JobPost from "../pages/JobPost/JobPost";
import InterviewScheduling from "../pages/InterviewScheduling/InterviewScheduling";
import EmployerFeedPage from '../pages/Employer/EmployerFeedPage';
import StudentPostForm from '../pages/StudentPost/StudentPostForm';
import RequestSentPage from '../pages/StudentPost/RequestSentPage'; // เพิ่ม import นี้
import MyPost from '../pages/MyPost/Mypost'
import WorklogPage from "../pages/worklog/worklog";
import ManageApplicants from "../pages/ManageApplicants/ManageApplicants"; // เพิ่ม import นี้
import MyApplications from "../pages/MyApplications/MyApplications"; // เพิ่ม import นี้
import QRPaymentPage from "../pages/payment/qrpaymentpage";



// Helper components to pass context from Outlet
// const PostCreatorRoute = () => {
//   const { handleAddPost }: any = useOutletContext();
//   return <PostCreator onAddPost={handleAddPost} />;
// };

// const ProfilePageV2Route = () => {
//   const context: any = useOutletContext();
//   if (!context) return <div>Loading profile...</div>;
//   return (
//     <ProfilePageV2
//       posts={context.posts}
//       handleAddPost={context.handleAddPost}
//       handleDeletePost={context.handleDeletePost}
//       handleLikePost={context.handleLikePost}
//       handleAddComment={context.handleAddComment}
//       onAddReport={context.onAddReport}
//       onEdit={context.handleEditPost}
//       onLikeComment={context.handleLikeComment}
//     />
//   );
// };

// const FAQPageRoute = () => {
//   const { faqQuestions, myRequests, handleLikeQuestion }: any = useOutletContext();
//   return (
//     <FAQPage
//       questions={faqQuestions}
//       myRequests={myRequests}
//       onLike={handleLikeQuestion}
//     />
//   );
// };

// const AskQuestionPageRoute = () => {
//   const { handleAddQuestion }: any = useOutletContext();
//   return <AskQuestionPage onFormSubmit={handleAddQuestion} />;
// };

// const QuestionDetailPageRoute = () => {
//   const context: any = useOutletContext();
//   return (
//     <QuestionDetailPage
//       questions={context.questions}
//       onAddAnswer={context.handleAddAnswer}
//     />
//   );
// };

// const RequestStatusPageRoute = () => {
//   const { questions }: any = useOutletContext();
//   return <RequestStatusPage questions={questions} />;
// };

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
            <Route path="/job-ManageApplicants/:jobpost_id" element={<ManageApplicants />} />
            <Route path="/my-applications" element={<MyApplications />} />
            <Route path="/interview" element={<Interview />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/students" element={<StudentListPage />} />
            <Route path="/report" element={<Reportpage />} />
            <Route path="/my-jobs" element={<JobsPage />} />
            <Route path="/payment-report" element={<PaymentReportPage />} />
            <Route path="/payment/:jobId" element={<PaymentPage />} />
            <Route path="/qr-payment/:paymentId" element={<QRPaymentPage />} />
            <Route path="/review/:jobId" element={<ReviewPage />} />
            <Route path="/Interview-Schedule" element={<InterviewScheduling/>} />
            <Route path="/profile-v1" element={<ProfilePageV1 />} />
            <Route path="/review-page" element={<ReviewPage />} />
            <Route path="/worklog" element={<WorklogPage />} />

            {/* --- Feed Routes (now independent) --- */}
            <Route path="/feed" element={<EmployerFeedPage />} />
            <Route path="/feed/create" element={<StudentPostForm />} />

        {/* โปรไฟล์เวอร์ชันเก่า ใช้ path ใหม่เพื่อไม่ชนกับ V2 */}
        <Route path="/profile-v1" element={<ProfilePageV1 />} />

        {/* Review ที่ต้องมีพารามิเตอร์งาน */}
        <Route path="/review/:id" element={<ReviewPage />} />
        {/* เผื่อไว้ถ้าต้องการให้เปิดหน้าเปล่าได้ */}
        <Route path="/review" element={<ReviewPage />} />

        {/* --- Feed Routes (independent) --- */}
        <Route path="/feed" element={<EmployerFeedPage />} />
        <Route path="/feed/create" element={<StudentPostForm />} />

        {/* --- Student-focused Routes (state by StudentPostManager) --- */}
        {/* <Route element={<StudentPostManager />}>
          <Route path="/create" element={<PostCreatorRoute />} />
          <Route path="/profile/:userId" element={<ProfilePageV2Route />} />
          <Route path="/profile" element={<ProfilePageV2Route />} />
          <Route path="/help" element={<FAQPageRoute />} />
          <Route path="/help/ask" element={<AskQuestionPageRoute />} />
          <Route path="/help/request-sent" element={<RequestSentPage />} />
          <Route path="/help/question/:id" element={<QuestionDetailPageRoute />} />
          <Route path="/help/request-status/:id" element={<RequestStatusPageRoute />} />
          <Route path="/help/request/:id" element={<RequestThreadPage />} />
        </Route> */}
      </Route>
    </Routes>
  );
};

export default MainRoutes;
