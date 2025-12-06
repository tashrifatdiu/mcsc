import React, { useState, useEffect, useContext } from 'react';
import { ChevronRight, CheckCircle, Clock, BookOpen, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';

const CoursePage = () => {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const [courseData, setCourseData] = useState(null);
  const [currentVideoId, setCurrentVideoId] = useState(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [completedVideos, setCompletedVideos] = useState(new Set());
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, loading: authLoading } = useContext(AuthContext);

  const isValidObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(id);

  // Fetch course
  useEffect(() => {
    if (!courseId || !isValidObjectId(courseId)) {
      setError('Invalid course ID');
      setLoading(false);
      return;
    }

    fetch(`${process.env.REACT_APP_API_BASE || 'http://localhost:5000'}/api/courses/${courseId}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to load course');
        return res.json();
      })
      .then(data => {
        setCourseData(data.course);
        const firstVideo = data.course.modules[0]?.videos[0];
        if (firstVideo) setCurrentVideoId(firstVideo.id);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [courseId]);

  // Auth & membership
  useEffect(() => {
    if (authLoading) return;
    if (!user) return navigate('/login');

    const checkMembership = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) return navigate('/not-authorized');

        const res = await fetch(`${process.env.REACT_APP_API_BASE || 'http://localhost:5000'}/api/registration/check`, {
          headers: { Authorization: `Bearer ${session.access_token}` }
        });
        const body = await res.json();
        if (!res.ok || !body.allowed) navigate('/not-authorized');
      } catch {
        navigate('/not-authorized');
      }
    };
    checkMembership();
  }, [user, authLoading, navigate]);

  const generateQuestions = (videoId) => {
    if (!courseData) return [];
    const allVideos = courseData.modules.flatMap(m => m.videos || []);
    const video = allVideos.find(v => v.id === videoId);
    if (!video) return [];

    if (courseData.quizzes?.[videoId]?.length) return courseData.quizzes[videoId];

    const module = courseData.modules.find(m => m.videos?.some(v => v.id === videoId));
    if (module?.questions?.length) {
      return module.questions.map(q => ({
        question: q.text || q.question || '',
        options: q.options || [],
        correct: q.options?.indexOf(q.answer) >= 0 ? q.options.indexOf(q.answer) : 0
      }));
    }

    return [
      { question: "What was the main topic?", options: ["A", "B", "C", "D"], correct: 0 },
      { question: "Key takeaway?", options: ["1", "2", "3", "4"], correct: 2 }
    ];
  };

  if (loading) return <div className="loading">Loading course...</div>;
  if (error || !courseData) return <div className="error">Error: {error || 'Course not found'}</div>;

  const allVideos = courseData.modules.flatMap(m => m.videos || []);
  const currentVideo = allVideos.find(v => v.id === currentVideoId);
  const currentIndex = allVideos.findIndex(v => v.id === currentVideoId);
  const total = allVideos.length;
  const isLast = currentIndex === total - 1;
  const completedAll = completedVideos.size === total;
  const questions = generateQuestions(currentVideoId);

  const score = questions.filter((q, i) => quizAnswers[i] === q.correct).length;
  const passed = score >= Math.ceil(questions.length / 2);

  const goToVideo = (id) => {
    setCurrentVideoId(id);
    setShowQuiz(false);
    setQuizSubmitted(false);
    setQuizAnswers({});
  };

  const nextVideo = () => {
    setCompletedVideos(prev => new Set([...prev, currentVideoId]));
    if (!isLast) {
      setCurrentVideoId(allVideos[currentIndex + 1].id);
      setShowQuiz(false);
      setQuizAnswers({});
      setQuizSubmitted(false);
    }
  };

  return (
    <>
      {/* === ALL CSS IN ONE PLACE === */}
      <style jsx>{`
        .course-page { min-height: 100vh; background: linear-gradient(135deg, #181c2b 0%, #232946 100%); color: #f3f6fa; font-family: system-ui, sans-serif; }
        .container { max-width: 1280px; margin: 0 auto; padding: 0 24px; }

        /* Header */
        .header { background: #1e293b; border-bottom: 1px solid #3f3f46; padding: 32px 0; position: sticky; top: 0; z-index: 10; }
        .header h1 { font-size: 2.2rem; color: #eebf3f; margin: 0 0 12px; }
        .header p { color: #b8c1ec; font-size: 1.1rem; margin: 8px 0 20px; }
        
        /* Notice Banner */
        .course-notice { 
          margin: 20px 0; 
          padding: 16px 20px; 
          background: rgba(251, 191, 36, 0.15); 
          border: 2px solid rgba(251, 191, 36, 0.3); 
          border-radius: 12px; 
          display: flex; 
          align-items: flex-start; 
          gap: 12px; 
        }
        .notice-icon { font-size: 1.3rem; flex-shrink: 0; }
        .course-notice p { 
          margin: 0; 
          color: #f3f6fa; 
          font-size: 0.95rem; 
          line-height: 1.5; 
        }
        .course-notice strong { color: #fbbf24; font-weight: 700; }
        @media (max-width: 768px) {
          .course-notice { 
            flex-direction: column; 
            text-align: center; 
            padding: 14px 16px; 
          }
          .notice-icon { font-size: 1.5rem; }
        }
        
        .progress-text { color: #9ca3af; font-size: 0.95rem; }
        .progress-bar { margin-top: 12px; height: 10px; background: #3f3f46; border-radius: 999px; overflow: hidden; }
        .progress-fill { height: 100%; background: #eebf3f; transition: width 0.4s ease; }

        /* Layout */
        .layout { display: grid; gap: 40px; margin: 40px 0; grid-template-columns: 1fr 360px; }
        @media (max-width: 1024px) {
          .layout { grid-template-columns: 1fr; gap: 48px; }
          .sidebar { order: 2; margin-top: 20px; }
        }

        /* Cards */
        .card { background: #1e293b; border: 1px solid #3f3f46; border-radius: 16px; overflow: hidden; }
        .video-wrapper { position: relative; padding-bottom: 56.25%; height: 0; background: #000; }
        .video-wrapper iframe { position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none; }
        .placeholder { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 400px; background: #0f172a; color: #94a3b8; }
        .video-info { padding: 32px; }
        .video-info h3 { font-size: 1.6rem; margin: 0 0 12px; }
        .duration { display: flex; align-items: center; gap: 8px; color: #94a3b8; margin: 16px 0; }
        .btn { padding: 14px 32px; border: none; border-radius: 12px; font-weight: 600; font-size: 1.1rem; cursor: pointer; width: 100%; margin-top: 20px; transition: 0.3s; }
        .btn-primary { background: #2563eb; color: white; }
        .btn-success { background: #22c55e; color: white; }
        .btn:hover { opacity: 0.9; }

        /* Quiz */
        .quiz { padding: 40px 32px; }
        .quiz h3 { font-size: 1.8rem; color: #eebf3f; margin-bottom: 32px; }
        .question { background: #2d3748; padding: 24px; border-radius: 12px; margin-bottom: 20px; }
        .question p { font-weight: 600; margin-bottom: 16px; }
        .option { display: flex; align-items: center; background: #4a5568; padding: 14px 20px; margin: 8px 0; border-radius: 10px; cursor: pointer; transition: 0.3s; }
        .option input { margin-right: 12px; transform: scale(1.2); }
        .option.correct { background: #166534; border: 2px solid #22c55e; color: #86efac; }
        .option.wrong { background: #7f1d1d; border: 2px solid #ef4444; color: #fca5a5; }
        .result { margin-top: 32px; text-align: center; }
        .score-box { padding: 24px; border-radius: 12px; font-size: 1.4rem; font-weight: bold; }
        .pass { background: rgba(34,197,94,0.3); border: 2px solid #22c55e; color: #86efac; }
        .fail { background: rgba(239,68,68,0.3); border: 2px solid #ef4444; color: #fca5a5; }

        /* Sidebar */
        .sidebar-inner { padding: 28px; border-radius: 16px; background: #1e293b; border: 1px solid #3f3f46; position: sticky; top: 130px; }
        .sidebar-inner h3 { font-size: 1.4rem; margin-bottom: 24px; color: #eebf3f; }
        .module-title { color: #cbd5e1; font-weight: 600; margin: 24px 0 12px; font-size: 1rem; }
        .video-btn { display: flex; align-items: center; justify-content: space-between; width: 100%; padding: 12px 16px; background: #334155; border-radius: 10px; border: none; color: #e2e8f0; text-align: left; cursor: pointer; margin-bottom: 8px; transition: 0.3s; }
        .video-btn:hover { background: #475569; }
        .video-btn.active { background: #2563eb; font-weight: 600; }
        .video-btn.completed { background: #166534; color: #86efac; }
        .check-icon { color: #22c55e; margin-left: 10px; }

        /* Completion */
        .completion { text-align: center; padding: 100px 20px; }
        .completion h2 { font-size: 3rem; color: #eebf3f; }
        .certificate { margin-top: 40px; padding: 32px; background: rgba(34,197,94,0.2); border: 2px solid #22c55e; border-radius: 16px; color: #86efac; font-size: 1.5rem; }

        /* Loading & Error */
        .loading, .error { min-height: 100vh; display: flex; align-items: center; justify-content: center; flex-direction: column; font-size: 1.5rem; }
        .loading::before { content: ''; width: 60px; height: 60px; border: 5px solid #334155; border-top-color: #eebf3f; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 20px; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div className="course-page">
        {/* Header */}
        <header className="header">
          <div className="container">
            <h1>{courseData.title}</h1>
            <p>{courseData.description}</p>
            
            {/* Notice Banner */}
            <div className="course-notice">
              <span className="notice-icon">ℹ️</span>
              <p>
                <strong>Note:</strong> This is a dummy course for demonstration purposes. 
                In the future, we will offer real courses on high-level skills, workshops, 
                and professional development opportunities.
              </p>
            </div>
            
            <div className="progress-text">
              Progress: {completedVideos.size} / {total} videos completed
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${(completedVideos.size / total) * 100}%` }} />
            </div>
          </div>
        </header>

        <div className="container">
          {completedAll ? (
            <div className="completion">
              <CheckCircle size={96} style={{ color: '#22c55e', marginBottom: '24px' }} />
              <h2>Congratulations!</h2>
              <p>You've completed the entire course!</p>
              <div className="certificate">Certificate of Completion – {courseData.title}</div>
            </div>
          ) : (
            <div className="layout">
              {/* Main Content */}
              <main>
                {!showQuiz ? (
                  <div className="card">
                    {currentVideo?.youtube_link ? (
                      <div className="video-wrapper">
                        <iframe
                          src={`${currentVideo.youtube_link.replace('watch?v=', 'embed/')}?modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&cc_load_policy=0&fs=1&color=white&controls=1&disablekb=0&playsinline=1`}
                          title={currentVideo.title}
                          allowFullScreen
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          frameBorder="0"
                        />
                      </div>
                    ) : (
                      <div className="placeholder">
                        <BookOpen size={80} />
                        <h3>{currentVideo?.title}</h3>
                      </div>
                    )}
                    <div className="video-info">
                      <h3>{currentVideo?.title}</h3>
                      <p>{currentVideo?.description}</p>
                      {currentVideo?.duration && (
                        <div className="duration">
                          <Clock size={16} /> {currentVideo.duration} min
                        </div>
                      )}
                      <button onClick={() => setShowQuiz(true)} className="btn btn-primary">
                        Complete & Take Quiz
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="card quiz">
                    <h3>Quiz: {currentVideo?.title}</h3>
                    {questions.map((q, i) => (
                      <div key={i} className="question">
                        <p>{i + 1}. {q.question}</p>
                        {q.options.map((opt, j) => (
                          <label key={j} className={`option ${quizSubmitted ? (j === q.correct ? 'correct' : quizAnswers[i] === j ? 'wrong' : '') : ''}`}>
                            <input
                              type="radio"
                              name={`q${i}`}
                              disabled={quizSubmitted}
                              checked={quizAnswers[i] === j}
                              onChange={() => !quizSubmitted && setQuizAnswers(prev => ({ ...prev, [i]: j }))}
                            />
                            {opt}
                            {quizSubmitted && j === q.correct && <CheckCircle size={20} className="check-icon" />}
                          </label>
                        ))}
                      </div>
                    ))}

                    {!quizSubmitted ? (
                      <button onClick={() => setQuizSubmitted(true)} className="btn btn-success">
                        Submit Quiz
                      </button>
                    ) : (
                      <div className="result">
                        <div className={`score-box ${passed ? 'pass' : 'fail'}`}>
                          Score: {score} / {questions.length}
                        </div>
                        <p>{passed ? 'Great job! Ready to continue?' : 'Try again to proceed.'}</p>
                        {passed && (
                          <button onClick={nextVideo} className="btn btn-primary">
                            {isLast ? 'Finish Course' : 'Next Video'} <ChevronRight size={20} style={{ marginLeft: '8px' }} />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </main>

              {/* Sidebar – goes below on mobile */}
              <aside className="sidebar">
                <div className="card sidebar-inner">
                  <h3>Course Content</h3>
                  {courseData.modules.map(mod => (
                    <div key={mod.id}>
                      <div className="module-title">{mod.title}</div>
                      {mod.videos?.map(video => {
                        const done = completedVideos.has(video.id);
                        const active = video.id === currentVideoId;
                        return (
                          <button
                            key={video.id}
                            onClick={() => goToVideo(video.id)}
                            className={`video-btn ${active ? 'active' : ''} ${done ? 'completed' : ''}`}
                          >
                            <span>{video.title}</span>
                            <div>
                              {done && <CheckCircle size={16} className="check-icon" />}
                              {video.duration && (
                                <span style={{ fontSize: '0.8rem', opacity: 0.7, marginLeft: '8px' }}>
                                  <Clock size={12} /> {video.duration}m
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </aside>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CoursePage;