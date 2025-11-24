import { BrowserRouter, Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar';
import Home from './pages/Home';
import Club from './pages/Club';
import Olympiad from './pages/Olympiad';
import RegistrationRequest from './pages/RegistrationRequest';
import AdminVerify from './pages/AdminVerify';
import AdminJournals from './pages/AdminJournals';
import AdminJournalView from './pages/AdminJournalView';
import Courses from './pages/Courses';
import AdminCourses from './pages/AdminCourses';
import Dashboard from './pages/Dashboard';
import JournalEditor from './pages/JournalEditor';
import JournalList from './pages/JournalList';
import JournalDetail from './pages/JournalDetail';
import MyDrafts from './pages/MyDrafts';
import JournalGallery from './pages/JournalGallery';
import AuthorWorks from './pages/AuthorWorks';
import SignUp from './pages/SignUp';
import Login from './pages/Login';
import PastEvents from './pages/PastEvents';
import FutureEvents from './pages/FutureEvents';
import EventDetail from './pages/EventDetail';
import CoursePage from './pages/CoursePage';
import NotAuthorized from './pages/NotAuthorized';
import CertificateManagement from './pages/CertificateManagement';

function App() {
  return (
    <>
      <div className="scanlines"></div>
      <NavBar />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Home />} />
    <Route path="/club" element={<Club />} />
    <Route path="/olympiad" element={<Olympiad />} />
    <Route path="/registration-request" element={<RegistrationRequest />} />
    <Route path="/admin-verify" element={<AdminVerify />} />
    <Route path="/admin/journals" element={<AdminJournals />} />
    <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/journal" element={<JournalList />} />
          <Route path="/journal/new" element={<JournalEditor />} />
          <Route path="/journal/edit/:id" element={<JournalEditor />} />
          <Route path="/journal/drafts" element={<MyDrafts />} />
          <Route path="/journal/gallery" element={<JournalGallery />} />
          <Route path="/journal/author/:authorId" element={<AuthorWorks />} />
          <Route path="/journal/:id" element={<JournalDetail />} />
                <Route path="/admin/journals/:id" element={<AdminJournalView />} />
                <Route path="/courses" element={<Courses />} />
                <Route path="/admin/courses" element={<AdminCourses />} />
                <Route path="/courses/:courseId" element={<CoursePage />} />
          <Route path="/events/past" element={<PastEvents />} />
          <Route path="/events/future" element={<FutureEvents />} />
          <Route path="/events/:eventId" element={<EventDetail />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
          <Route path="/not-authorized" element={<NotAuthorized />} />
          <Route path="/certificate-management" element={<CertificateManagement />} />
          {/* existing routes */}
        </Routes>
      </main>
    </>
  );
}

export default App;