import React from "react";
import { Route, Routes, useOutletContext } from "react-router-dom";
import FullLayout from '../layouts/FullLayout';
import StudentPostManager from '../pages/StudentPost';
import FeedPage from '../components/QA/FeedPage';
import HelpCenterPage from '../pages/HelpCenter/HelpCenterPage';
import CreateRequestPage from '../pages/HelpCenter/CreateRequestPage';
import PostCreator from '../components/QA/PostCreator';
import ProfilePageV2 from '../pages/ProfilePage2/ProfilePage';
import FAQPage from '../pages/StudentPost/FAQPage';
import AskQuestionPage from '../pages/StudentPost/AskQuestionPage';
import QuestionDetailPage from '../pages/StudentPost/QuestionDetailPage';
import RequestThreadPage from '../pages/RequestThreadPage/RequestThreadPage';
import RequestStatusPage from '../pages/RequestThreadPage/RequestStatusPage';
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
import EmployerFeedPage from '../pages/Employer/EmployerFeedPage';
import StudentPostForm from '../pages/StudentPost/StudentPostForm';
import RequestSentPage from '../pages/StudentPost/RequestSentPage'; // เพิ่ม import นี้
import MyPost from '../pages/MyPost/Mypost'
import WorklogPage from "../pages/worklog/worklog";
import StudentFeedPage from "../pages/StudentFeed/StudentFeedPage";

// Helper components to pass context from Outlet
const PostCreatorRoute = () => {
  const { handleAddPost }: any = useOutletContext();
  return <PostCreator onAddPost={handleAddPost} />;
};

const ProfilePageV2Route = () => {
  const context: any = useOutletContext();
  if (!context) {
    return <div>Loading profile...</div>;
  }
  return <ProfilePageV2
      posts={context.posts}
      handleAddPost={context.handleAddPost}
      handleDeletePost={context.handleDeletePost}
      handleLikePost={context.handleLikePost}
      handleAddComment={context.handleAddComment}
      onAddReport={context.onAddReport}
      onEdit={context.handleEditPost}
      onLikeComment={context.handleLikeComment}
    />;
}

const FAQPageRoute = () => {
    const { faqQuestions, myRequests, handleLikeQuestion }: any = useOutletContext();
    return <FAQPage
        questions={faqQuestions}
        myRequests={myRequests}
        onLike={handleLikeQuestion}
    />;
};

const AskQuestionPageRoute = () => {
  const { handleAddQuestion }: any = useOutletContext();
  return <AskQuestionPage onFormSubmit={handleAddQuestion} />;
};

const QuestionDetailPageRoute = () => {
  const context: any = useOutletContext();
  return (
    <QuestionDetailPage
      questions={context.questions}
      onAddAnswer={context.handleAddAnswer}
    />
  );
};

const RequestStatusPageRoute = () => {
  const { questions }: any = useOutletContext();
  return <RequestStatusPage questions={questions} />;
};


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
          

            {/* --- Feed Routes  เเก้ไขเส้นทางโดยพรศิริ (now independent) --- */}
            <Route path="/feed" element={<StudentFeedPage />} />
            
            {/* --- Student-focused Routes (State managed by StudentPostManager) --- */}
            <Route element={<StudentPostManager />}>
              <Route path="/create" element={<PostCreatorRoute />} />
              <Route path="/profile/:userId" element={<ProfilePageV2Route />} />
              <Route path="/profile" element={<ProfilePageV2Route />} />
              <Route path="/help" element={<HelpCenterPage />} />
              <Route path="/help/ask" element={<CreateRequestPage />} />
              <Route path="/help/request-sent" element={<RequestSentPage />} /> {/* เพิ่ม Route นี้กลับเข้ามา */}
              <Route path="/help/question/:id" element={<QuestionDetailPageRoute />} />
              
              <Route path="/help/request-status/:id" element={<RequestStatusPageRoute />} />
              <Route path="/help/request/:id" element={<RequestThreadPage />} />
            </Route>
        </Route>
    </Routes>
  );
};

export default MainRoutes;
