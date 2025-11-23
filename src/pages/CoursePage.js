import React, { useState, useEffect, useContext } from 'react';
import { ChevronRight, CheckCircle, Clock, BookOpen, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import './CoursePage.css';

const CoursePage = () => {
  const navigate = useNavigate(); // Ensure navigate is defined
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

  // Validate courseId format before making the API call
  const isValidObjectId = (id) => typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id);

  // Fetch course data
  useEffect(() => {
    if (!courseId) {
      setError('Course id missing in URL');
      setLoading(false);
      return;
    }

    if (!isValidObjectId(courseId)) {
      console.error('Invalid courseId format:', courseId);
      setError('Invalid courseId format');
      setLoading(false);
      return;
    }

    fetch(`${process.env.REACT_APP_API_BASE || 'http://localhost:5000'}/api/courses/${courseId}`)
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        setCourseData(data.course);
        const firstModule = data.course.modules[0];
        const firstVideo = firstModule?.videos[0];
        if (firstVideo) {
          setCurrentVideoId(firstVideo.id);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch course details:', err);
        setError(err.message);
        setLoading(false);
      });
  }, [courseId]);

  // Ensure the user is logged in and is a registered club member
  useEffect(() => {
    if (authLoading) return; // wait until auth state is known

    if (!user) {
      navigate('/login'); // Redirect to login page if not logged in
      return;
    }

    const checkMember = async () => {
      try {
        // Prefer server-side centralized membership check to avoid relying on Supabase table shape.
        // Get current session to pass access token to server
        const sessionResult = await supabase.auth.getSession();
        // supabase.auth.getSession() returns { data: { session } }
        const session = sessionResult?.data?.session || sessionResult?.session || sessionResult?.data;
        const accessToken = session?.access_token || session?.accessToken || session?.provider_token;

        if (!accessToken) {
          navigate('/not-authorized');
          return;
        }

        const resp = await fetch(`${process.env.REACT_APP_API_BASE || 'http://localhost:5000'}/api/registration/check`, {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        });

        if (!resp.ok) {
          console.error('Membership check endpoint returned status', resp.status);
          navigate('/not-authorized');
          return;
        }

        const body = await resp.json();
        if (body.allowed) {
          // allowed
          return;
        }

        // Not allowed — optionally surface reason
        console.warn('Membership check denied:', body.reason);
        navigate('/not-authorized');
        return;
      } catch (err) {
        console.error('Error checking membership', err);
        setError('Failed to verify membership: ' + (err && (err.message || String(err))));
        return;
      }
    };

    checkMember();
  }, [user, authLoading, navigate]);

  const generateMCQQuestions = (videoId) => {
    if (!courseData) return [];

    const allVideos = courseData.modules.flatMap(m => m.videos);
    const video = allVideos.find(v => v.id === videoId);

    if (!video) return [];
    // Prefer quizzes provided as top-level mapping (legacy/seeded data)
    const quizQuestions = courseData.quizzes?.[videoId];
    if (Array.isArray(quizQuestions) && quizQuestions.length > 0) return quizQuestions;

    // Otherwise, find module that contains this video and use module.questions if present
    const moduleContaining = courseData.modules.find(m => (m.videos || []).some(v => v.id === videoId));
    if (moduleContaining && Array.isArray(moduleContaining.questions) && moduleContaining.questions.length > 0) {
      // Convert module.questions (server format) -> frontend expected format { question, options, correct }
      return moduleContaining.questions.map(q => {
        const options = Array.isArray(q.options) ? q.options : [];
        // `answer` on server may be the correct option text; convert to index
        let correct = 0;
        if (q.answer && options.length) {
          const idx = options.indexOf(q.answer);
          if (idx >= 0) correct = idx;
        }
        return { question: q.text || q.question || 'Question', options, correct };
      });
    }

    // Fallback default questions
    return [
      { question: "What was the main topic of this video?", options: ["Option A", "Option B", "Option C", "Option D"], correct: 0 },
      { question: "Which of the following best describes the content?", options: ["Description 1", "Description 2", "Description 3", "Description 4"], correct: 1 }
    ];
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>Loading course...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.errorContainer}>
        <div style={styles.errorBox}>
          <div style={styles.errorHeader}>
            <AlertCircle size={24} style={styles.errorIcon} />
            <p style={styles.errorTitle}>Error Loading Course</p>
          </div>
          <p style={styles.errorMessage}>{error}</p>
        </div>
      </div>
    );
  }

  if (!courseData) {
    return (
      <div style={styles.noDataContainer}>
        <p style={styles.noDataText}>No course data available</p>
      </div>
    );
  }

  const allVideos = courseData.modules.flatMap(m => m.videos);
  const currentVideo = allVideos.find(v => v.id === currentVideoId);
  const currentVideoIndex = allVideos.findIndex(v => v.id === currentVideoId);
  const totalVideos = allVideos.length;
  const isLastVideo = currentVideoIndex === totalVideos - 1;
  const courseCompleted = completedVideos.size === totalVideos;
  const mcqQuestions = generateMCQQuestions(currentVideoId);

  const handleVideoComplete = () => {
    setShowQuiz(true);
    setQuizSubmitted(false);
    setQuizAnswers({});
  };

  const handleAnswerChange = (questionIndex, optionIndex) => {
    if (!quizSubmitted) {
      setQuizAnswers(prev => ({
        ...prev,
        [questionIndex]: optionIndex
      }));
    }
  };

  const handleSubmitQuiz = () => {
    setQuizSubmitted(true);
  };

  const handleNextVideo = () => {
    setCompletedVideos(prev => new Set([...prev, currentVideoId]));
    if (!isLastVideo) {
      setCurrentVideoId(allVideos[currentVideoIndex + 1].id);
      setShowQuiz(false);
    }
  };

  const getQuizScore = () => {
    let correct = 0;
    mcqQuestions.forEach((q, idx) => {
      if (quizAnswers[idx] === q.correct) correct++;
    });
    return { correct, total: mcqQuestions.length };
  };

  const goToVideo = (videoId) => {
    setCurrentVideoId(videoId);
    setShowQuiz(false);
    setQuizSubmitted(false);
    setQuizAnswers({});
  };

  const quizScore = getQuizScore();
  const quizPassed = quizScore.correct >= Math.ceil(quizScore.total / 2);

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <h1 style={styles.headerTitle}>{courseData.title}</h1>
          <p style={styles.headerDescription}>{courseData.description}</p>
          <div style={styles.progressTextContainer}>
            <span style={styles.progressText}>
              Progress: {completedVideos.size} of {totalVideos} videos completed
            </span>
          </div>
          <div style={styles.progressBarContainer}>
            <div 
              style={{
                ...styles.progressBar,
                width: `${(completedVideos.size / totalVideos) * 100}%`
              }}
            ></div>
          </div>
        </div>
      </div>

      <div style={styles.contentWrapper}>
        {courseCompleted ? (
          <div style={styles.completionContainer}>
            <CheckCircle size={96} style={styles.completionIcon} />
            <h2 style={styles.completionTitle}>Course Completed!</h2>
            <p style={styles.completionMessage}>
              Congratulations! You have successfully completed all modules and videos.
            </p>
            <div style={styles.certificateBox}>
              <p style={styles.certificateTitle}>Certificate of Completion</p>
              <p style={styles.certificateCourse}>{courseData.title}</p>
            </div>
          </div>
        ) : (
          <div style={styles.mainGrid}>
            {/* Main Video Section */}
            <div style={styles.mainSection}>
              {!showQuiz ? (
                <div style={styles.videoCard}>
                  <div style={styles.videoPlaceholder}>
                    {currentVideo?.youtube_link ? (
                      <iframe
                        width="100%"
                        height="100%"
                        src={currentVideo.youtube_link.replace('watch?v=', 'embed/')}
                        title={currentVideo.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    ) : (
                      <>
                        <BookOpen size={64} style={styles.videoIcon} />
                        <p style={styles.videoPlaceholderTitle}>{currentVideo?.title}</p>
                      </>
                    )}
                  </div>
                  <div style={styles.videoContent}>
                    <h3 style={styles.videoTitle}>{currentVideo?.title}</h3>
                    <p style={styles.videoDescription}>{currentVideo?.description}</p>
                    {currentVideo?.duration && (
                      <p style={styles.videoDuration}>
                        <Clock size={16} style={styles.durationIcon} />
                        Duration: {currentVideo.duration} minutes
                      </p>
                    )}
                    <button
                      onClick={handleVideoComplete}
                      style={styles.completeButton}
                      className="cp-button cp-button-primary"
                    >
                      Complete & Take Quiz
                    </button>
                  </div>
                </div>
              ) : (
                <div style={styles.quizCard}>
                  <h3 style={styles.quizTitle}>Quiz: {currentVideo?.title}</h3>
                  {mcqQuestions.length > 0 ? (
                    <>
                      <div style={styles.quizContent}>
                        {mcqQuestions.map((q, idx) => (
                          <div key={idx} style={styles.questionContainer}>
                            <p style={styles.questionText}>{idx + 1}. {q.question}</p>
                            <div style={styles.optionsContainer}>
                              {q.options.map((option, optIdx) => (
                                <label key={optIdx} style={styles.optionLabel}>
                                  <input
                                    type="radio"
                                    name={`question-${idx}`}
                                    checked={quizAnswers[idx] === optIdx}
                                    onChange={() => handleAnswerChange(idx, optIdx)}
                                    disabled={quizSubmitted}
                                    style={styles.radioInput}
                                  />
                                  <span style={styles.optionText}>{option}</span>
                                  {quizSubmitted && optIdx === q.correct && (
                                    <CheckCircle size={20} style={styles.correctIcon} />
                                  )}
                                </label>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>

                      {!quizSubmitted ? (
                        <button
                          onClick={handleSubmitQuiz}
                          style={styles.submitButton}
                          className="cp-button cp-button-success"
                        >
                          Submit Quiz
                        </button>
                      ) : (
                        <div style={styles.resultContainer}>
                          <div style={{
                            ...styles.resultBox,
                            background: quizPassed ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                            borderColor: quizPassed ? '#16a34a' : '#dc2626'
                          }}>
                            <p style={styles.scoreText}>Score: {quizScore.correct}/{quizScore.total}</p>
                            <p style={{
                              ...styles.resultText,
                              color: quizPassed ? '#4ade80' : '#f87171'
                            }}>
                              {quizPassed ? 'Great job! Ready to continue?' : 'Try again to proceed.'}
                            </p>
                          </div>
                          {quizPassed && (
                            <button
                              onClick={handleNextVideo}
                              style={styles.nextButton}
                              className="cp-button cp-button-primary"
                            >
                              {isLastVideo ? 'Finish Course' : 'Next Video'}
                              <ChevronRight size={20} style={styles.nextButtonIcon} />
                            </button>
                          )}
                        </div>
                      )}
                    </>
                  ) : (
                    <div style={styles.noQuizContainer}>
                      <p style={styles.noQuizText}>No quiz questions available for this video.</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div style={styles.sidebar}>
              <div style={styles.sidebarContent}>
                <h3 style={styles.sidebarTitle}>Course Content</h3>
                <div style={styles.modulesContainer}>
                  {courseData.modules.map(module => (
                    <div key={module.id} style={styles.moduleSection}>
                      <p style={styles.moduleName}>{module.title}</p>
                      <div style={styles.videosListContainer}>
                        {module.videos.map(video => {
                          const isCompleted = completedVideos.has(video.id);
                          const isCurrent = video.id === currentVideoId;
                          
                            const vbClass = `video-button ${isCurrent ? 'current' : ''} ${isCompleted ? 'completed' : ''} ${(!isCurrent && !isCompleted) ? 'accessible' : ''}`;
                            return (
                              <button
                                key={video.id}
                                onClick={() => goToVideo(video.id)}
                                className={vbClass}
                                style={{ ...styles.videoButton }}
                              >
                                <div style={styles.videoButtonContent}>
                                  <span style={styles.videoButtonText}>{video.title}</span>
                                  {isCompleted && <CheckCircle size={16} style={styles.videoCheckIcon} />}
                                </div>
                                {video.duration && (
                                  <div style={styles.videoDurationSmall}>
                                    <Clock size={12} style={styles.durationIconSmall} />
                                    {video.duration} min
                                  </div>
                                )}
                              </button>
                            );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #181c2b 0%, #232946 100%)',
    color: '#f3f6fa',
    display: 'flex',
    flexDirection: 'column',
  },
  loadingContainer: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #181c2b 0%, #232946 100%)',
    color: '#f3f6fa',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinner: {
    width: '48px',
    height: '48px',
    border: '3px solid rgba(243, 246, 250, 0.3)',
    borderTop: '3px solid #eebf3f',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '16px',
  },
  loadingText: {
    fontSize: '20px',
  },
  errorContainer: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #181c2b 0%, #232946 100%)',
    color: '#f3f6fa',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorBox: {
    background: '#7f1d1d',
    border: '1px solid #dc2626',
    borderRadius: '12px',
    padding: '24px',
    maxWidth: '448px',
  },
  errorHeader: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '16px',
  },
  errorIcon: {
    marginRight: '8px',
    color: '#f87171',
  },
  errorTitle: {
    fontSize: '18px',
    fontWeight: '600',
    margin: 0,
  },
  errorMessage: {
    color: '#cbd5e1',
    margin: 0,
  },
  noDataContainer: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noDataText: {
    fontSize: '20px',
  },
  header: {
    background: '#1e293b',
    borderBottom: '1px solid #3f3f46',
    position: 'sticky',
    top: 0,
    zIndex: 10,
  },
  headerContent: {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '24px',
    width: '100%',
  },
  headerTitle: {
    fontSize: '30px',
    fontWeight: '700',
    margin: 0,
    marginBottom: '8px',
    color: '#eebf3f',
  },
  headerDescription: {
    color: '#b8c1ec',
    marginTop: '4px',
    fontSize: '16px',
  },
  progressTextContainer: {
    marginTop: '12px',
  },
  progressText: {
    fontSize: '14px',
    color: '#9ca3af',
  },
  progressBarContainer: {
    marginTop: '12px',
    width: '100%',
    background: '#3f3f46',
    borderRadius: '9999px',
    height: '8px',
    overflow: 'hidden',
  },
  progressBar: {
    background: '#eebf3f',
    height: '100%',
    transition: 'width 0.3s ease',
  },
  contentWrapper: {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '32px 24px',
    width: '100%',
    flex: 1,
  },
  completionContainer: {
    textAlign: 'center',
    paddingTop: '80px',
  },
  completionIcon: {
    margin: '0 auto 16px',
    color: '#22c55e',
  },
  completionTitle: {
    fontSize: '36px',
    fontWeight: '700',
    margin: '0 0 24px',
    color: '#eebf3f',
  },
  completionMessage: {
    fontSize: '20px',
    color: '#9ca3af',
    marginBottom: '24px',
  },
  certificateBox: {
    background: 'rgba(34, 197, 94, 0.2)',
    border: '1px solid #16a34a',
    borderRadius: '8px',
    padding: '16px',
    display: 'inline-block',
  },
  certificateTitle: {
    color: '#4ade80',
    fontWeight: '600',
    margin: 0,
  },
  certificateCourse: {
    color: '#4ade80',
    fontSize: '14px',
    marginTop: '8px',
  },
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '32px',
  },
  mainSection: {
    gridColumn: 'span 3',
  },
  videoCard: {
    background: '#1e293b',
    borderRadius: '12px',
    overflow: 'hidden',
    border: '1px solid #3f3f46',
  },
  videoPlaceholder: {
    background: '#0f172a',
    aspectRatio: '16 / 9',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoIcon: {
    color: '#60a5fa',
    marginBottom: '16px',
  },
  videoPlaceholderTitle: {
    fontSize: '20px',
    fontWeight: '600',
    margin: 0,
  },
  videoUrl: {
    color: '#9ca3af',
    marginTop: '8px',
    fontSize: '14px',
  },
  videoContent: {
    padding: '24px',
  },
  videoTitle: {
    fontSize: '24px',
    fontWeight: '700',
    margin: '0 0 16px',
  },
  videoDescription: {
    color: '#cbd5e1',
    marginBottom: '8px',
  },
  videoDuration: {
    color: '#9ca3af',
    fontSize: '14px',
    marginBottom: '24px',
    display: 'flex',
    alignItems: 'center',
  },
  durationIcon: {
    marginRight: '8px',
  },
  completeButton: {
    background: '#2563eb',
    color: 'white',
    fontWeight: '600',
    padding: '12px 32px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    transition: 'background 0.3s',
  },
  quizCard: {
    background: '#1e293b',
    borderRadius: '12px',
    border: '1px solid #3f3f46',
    padding: '24px',
  },
  quizTitle: {
    fontSize: '24px',
    fontWeight: '700',
    marginBottom: '24px',
  },
  quizContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  questionContainer: {
    background: '#3f3f46',
    borderRadius: '8px',
    padding: '16px',
  },
  questionText: {
    fontWeight: '600',
    marginBottom: '16px',
  },
  optionsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  optionLabel: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px',
    background: '#52525b',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'background 0.3s',
  },
  radioInput: {
    width: '16px',
    height: '16px',
    marginRight: '12px',
    cursor: 'pointer',
  },
  optionText: {
    flex: 1,
  },
  correctIcon: {
    color: '#4ade80',
    marginLeft: 'auto',
  },
  submitButton: {
    background: '#22c55e',
    color: 'white',
    fontWeight: '600',
    padding: '12px 32px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    marginTop: '32px',
    width: '100%',
    transition: 'background 0.3s',
  },
  resultContainer: {
    marginTop: '32px',
  },
  resultBox: {
    padding: '16px',
    borderRadius: '8px',
    marginBottom: '16px',
    border: '1px solid',
  },
  scoreText: {
    fontWeight: '600',
    margin: 0,
  },
  resultText: {
    margin: '8px 0 0',
  },
  nextButton: {
    background: '#2563eb',
    color: 'white',
    fontWeight: '600',
    padding: '12px 32px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background 0.3s',
  },
  nextButtonIcon: {
    marginLeft: '8px',
  },
  noQuizContainer: {
    textAlign: 'center',
    paddingTop: '32px',
  },
  noQuizText: {
    color: '#cbd5e1',
  },
  sidebar: {
    gridColumn: 'span 1',
  },
  sidebarContent: {
    background: '#1e293b',
    borderRadius: '12px',
    border: '1px solid #3f3f46',
    padding: '16px',
    position: 'sticky',
    top: '128px',
  },
  sidebarTitle: {
    fontWeight: '700',
    fontSize: '18px',
    marginBottom: '16px',
  },
  modulesContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    maxHeight: '384px',
    overflowY: 'auto',
  },
  moduleSection: {
    display: 'flex',
    flexDirection: 'column',
  },
  moduleName: {
    color: '#cbd5e1',
    fontWeight: '600',
    fontSize: '14px',
    marginBottom: '8px',
  },
  videosListContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    paddingLeft: '8px',
  },
  videoButton: {
    textAlign: 'left',
    padding: '8px',
    borderRadius: '6px',
    fontSize: '14px',
    border: 'none',
    cursor: 'pointer',
    transition: 'background 0.3s',
    color: 'white',
  },
  videoButtonCurrent: {
    background: '#2563eb',
    color: 'white',
  },
  videoButtonCompleted: {
    background: '#1e3a1f',
    color: '#4ade80',
  },
  videoButtonAccessible: {
    background: '#3f3f46',
    color: '#cbd5e1',
  },
  videoButtonDisabled: {
    background: '#3f3f46',
    color: '#6b7280',
    cursor: 'not-allowed',
    opacity: 0.5,
  },
  videoButtonContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  videoButtonText: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    flex: 1,
  },
  videoCheckIcon: {
    marginLeft: '8px',
    flexShrink: 0,
  },
  videoDurationSmall: {
    fontSize: '12px',
    marginTop: '4px',
    opacity: 0.75,
    display: 'flex',
    alignItems: 'center',
  },
  durationIconSmall: {
    marginRight: '4px',
  },
};

export default CoursePage;