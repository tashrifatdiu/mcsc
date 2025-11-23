import React, { useState } from 'react';
import axios from 'axios';
import './Courses.css';

const SECRET_PASSWORD = 'superSecret123';

const AdminCoursePanel = () => {
  const [auth, setAuth] = useState(false);
  const [password, setPassword] = useState('');
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [selectedModule, setSelectedModule] = useState(null);
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [newCourse, setNewCourse] = useState({ title: '', description: '' });
  const [newModule, setNewModule] = useState({ name: '' });
  const [newVideo, setNewVideo] = useState({ title: '', duration: '', content: '' });
  const [mcqQuestions, setMcqQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState({ question: '', options: ['', '', '', ''], correct: 0 });

  const handleLogin = () => {
    if (password === SECRET_PASSWORD) {
      setAuth(true);
      axios.get('/api/courses').then(res => setCourses(res.data.courses || []));
    }
  };

  const handleAddCourse = () => {
    axios.post('/api/courses', newCourse).then(() => {
      setNewCourse({ title: '', description: '' });
      axios.get('/api/courses').then(res => setCourses(res.data.courses || []));
    });
  };

  const handleDeleteCourse = (id) => {
    axios.delete(`/api/courses/${id}`).then(() => {
      axios.get('/api/courses').then(res => setCourses(res.data.courses || []));
    });
  };

  const handleSelectCourse = (course) => {
    setSelectedCourse(course);
    axios.get(`/api/courses/${course._id}/modules`).then(res => setModules(res.data.modules || []));
  };

  const handleAddModule = () => {
    axios.post(`/api/courses/${selectedCourse._id}/modules`, newModule).then(() => {
      setNewModule({ name: '' });
      axios.get(`/api/courses/${selectedCourse._id}/modules`).then(res => setModules(res.data.modules || []));
    });
  };

  const handleDeleteModule = (id) => {
    axios.delete(`/api/courses/${selectedCourse._id}/modules/${id}`).then(() => {
      axios.get(`/api/courses/${selectedCourse._id}/modules`).then(res => setModules(res.data.modules || []));
    });
  };

  const handleSelectModule = (module) => {
    setSelectedModule(module);
    axios.get(`/api/modules/${module._id}/videos`).then(res => setVideos(res.data.videos || []));
  };

  const handleAddVideo = () => {
    axios.post(`/api/modules/${selectedModule._id}/videos`, newVideo).then(() => {
      setNewVideo({ title: '', duration: '', content: '' });
      axios.get(`/api/modules/${selectedModule._id}/videos`).then(res => setVideos(res.data.videos || []));
    });
  };

  const handleDeleteVideo = (id) => {
    axios.delete(`/api/modules/${selectedModule._id}/videos/${id}`).then(() => {
      axios.get(`/api/modules/${selectedModule._id}/videos`).then(res => setVideos(res.data.videos || []));
    });
  };

  const handleSelectVideo = (video) => {
    setSelectedVideo(video);
    axios.get(`/api/videos/${video._id}/questions`).then(res => setMcqQuestions(res.data.questions || []));
  };

  const handleAddQuestion = () => {
    axios.post(`/api/videos/${selectedVideo._id}/questions`, newQuestion).then(() => {
      setNewQuestion({ question: '', options: ['', '', '', ''], correct: 0 });
      axios.get(`/api/videos/${selectedVideo._id}/questions`).then(res => setMcqQuestions(res.data.questions || []));
    });
  };

  const handleDeleteQuestion = (id) => {
    axios.delete(`/api/videos/${selectedVideo._id}/questions/${id}`).then(() => {
      axios.get(`/api/videos/${selectedVideo._id}/questions`).then(res => setMcqQuestions(res.data.questions || []));
    });
  };

  return (
    <div className="admin-panel-section">
      {!auth ? (
        <div className="admin-login">
          <h2>Admin Login</h2>
          <input className="admin-input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter secret password" />
          <button onClick={handleLogin}>Login</button>
        </div>
      ) : (
        <div className="admin-panel">
          <h2>Course Management</h2>
          <div className="add-course-form">
            <input className="admin-input" type="text" value={newCourse.title} onChange={e => setNewCourse({ ...newCourse, title: e.target.value })} placeholder="Course Title" />
            <input className="admin-input" type="text" value={newCourse.description} onChange={e => setNewCourse({ ...newCourse, description: e.target.value })} placeholder="Course Description" />
            <button onClick={handleAddCourse}>Add Course</button>
          </div>
          <ul className="course-list-admin">
            {courses.map(course => (
              <li key={course._id}>
                <span onClick={() => handleSelectCourse(course)}>{course.title}</span>
                <button onClick={() => handleDeleteCourse(course._id)}>Delete</button>
              </li>
            ))}
          </ul>
          {selectedCourse && (
            <div className="module-management">
              <h3>Modules for {selectedCourse.title}</h3>
              <div className="add-module-form">
                <input className="admin-input" type="text" value={newModule.name} onChange={e => setNewModule({ name: e.target.value })} placeholder="Module Name" />
                <button onClick={handleAddModule}>Add Module</button>
              </div>
              <ul className="module-list-admin">
                {modules.map(mod => (
                  <li key={mod._id}>
                    <span onClick={() => handleSelectModule(mod)}>{mod.name}</span>
                    <button onClick={() => handleDeleteModule(mod._id)}>Delete</button>
                  </li>
                ))}
              </ul>
              {selectedModule && (
                <div className="video-management">
                  <h4>Videos for {selectedModule.name}</h4>
                  <div className="add-video-form">
                    <input className="admin-input" type="text" value={newVideo.title} onChange={e => setNewVideo({ ...newVideo, title: e.target.value })} placeholder="Video Title" />
                    <input className="admin-small admin-input" type="text" value={newVideo.duration} onChange={e => setNewVideo({ ...newVideo, duration: e.target.value })} placeholder="Duration" />
                    <input className="admin-input" type="text" value={newVideo.content} onChange={e => setNewVideo({ ...newVideo, content: e.target.value })} placeholder="Content" />
                    <button onClick={handleAddVideo}>Add Video</button>
                  </div>
                  <ul className="video-list-admin">
                    {videos.map(vid => (
                      <li key={vid._id}>
                        <span onClick={() => handleSelectVideo(vid)}>{vid.title}</span>
                        <button onClick={() => handleDeleteVideo(vid._id)}>Delete</button>
                      </li>
                    ))}
                  </ul>
                  {selectedVideo && (
                    <div className="mcq-management">
                      <h5>MCQ Questions for {selectedVideo.title}</h5>
                      <div className="add-question-form">
                        <input className="admin-input" type="text" value={newQuestion.question} onChange={e => setNewQuestion({ ...newQuestion, question: e.target.value })} placeholder="Question" />
                        {newQuestion.options.map((opt, i) => (
                          <input key={i} className="admin-input" type="text" value={opt} onChange={e => {
                            const opts = [...newQuestion.options];
                            opts[i] = e.target.value;
                            setNewQuestion({ ...newQuestion, options: opts });
                          }} placeholder={`Option ${i + 1}`} />
                        ))}
                        <input className="admin-small admin-input" type="number" min={0} max={3} value={newQuestion.correct} onChange={e => setNewQuestion({ ...newQuestion, correct: Number(e.target.value) })} placeholder="Correct Option Index" />
                        <button onClick={handleAddQuestion}>Add Question</button>
                      </div>
                      <ul className="question-list-admin">
                        {mcqQuestions.map((q, idx) => (
                          <li key={idx}>
                            <span>{q.question} (Correct: {q.options[q.correct]})</span>
                            <button onClick={() => handleDeleteQuestion(q._id)}>Delete</button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminCoursePanel;
