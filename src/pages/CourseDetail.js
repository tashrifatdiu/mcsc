import React, { useState, useEffect } from 'react';
import { ChevronRight, CheckCircle, Clock, BookOpen } from 'lucide-react';

const CoursePage = ({ courseId }) => {
  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentVideoId, setCurrentVideoId] = useState(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [completedVideos, setCompletedVideos] = useState(new Set());
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        const response = await fetch(`/api/courses/${courseId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch course data');
        }
        const data = await response.json();
        console.log(data);
        
        setCourseData(data.course);
        const firstVideoId = data.course.modules?.[0]?.videos?.[0]?._id || null;
        setCurrentVideoId(firstVideoId);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [courseId]);

  if (loading) {
    return <div className="text-center text-white">Loading...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">Error: {error}</div>;
  }

  if (!courseData || !courseData.modules || courseData.modules.length === 0) {
    return <div className="text-center text-white">No course data available.</div>;
  }

  const allVideos = courseData.modules.flatMap(m => m.videos || []);
  const currentVideo = allVideos.find(v => v._id === currentVideoId);
  const currentVideoIndex = allVideos.findIndex(v => v._id === currentVideoId);
  const totalVideos = allVideos.length;
  const isLastVideo = currentVideoIndex === totalVideos - 1;
  const courseCompleted = completedVideos.size === totalVideos;

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
      setCurrentVideoId(allVideos[currentVideoIndex + 1]._id);
      setShowQuiz(false);
    }
  };

  const getQuizScore = () => {
    const questions = currentVideo?.questions || [];
    let correct = 0;
    questions.forEach((q, idx) => {
      if (quizAnswers[idx] === q.correct) correct++;
    });
    return { correct, total: questions.length };
  };

  const goToVideo = (videoId) => {
    if (completedVideos.has(videoId) || videoId <= Math.max(...completedVideos, 1)) {
      setCurrentVideoId(videoId);
      setShowQuiz(false);
      setQuizSubmitted(false);
      setQuizAnswers({});
    }
  };

  const quizScore = getQuizScore();
  const quizPassed = quizScore.correct >= Math.ceil(quizScore.total / 2);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-3xl font-bold">{courseData.title}</h1>
          <p className="text-slate-400 mt-1">{courseData.description}</p>
          <div className="mt-2 text-sm text-slate-400">
            Progress: {completedVideos.size} of {totalVideos} videos completed
          </div>
          <div className="mt-2 w-full bg-slate-700 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${totalVideos > 0 ? (completedVideos.size / totalVideos) * 100 : 0}%` }}
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {courseCompleted ? (
          <div className="text-center py-20">
            <CheckCircle className="w-24 h-24 mx-auto text-green-500 mb-4" />
            <h2 className="text-4xl font-bold mb-4">Course Completed!</h2>
            <p className="text-xl text-slate-400 mb-6">Congratulations! You have successfully completed all modules and videos.</p>
            <div className="bg-green-500 bg-opacity-20 border border-green-500 rounded-lg p-4 inline-block">
              <p className="text-green-300 font-semibold">Certificate of Completion</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Video Section */}
            <div className="lg:col-span-3">
              {!showQuiz ? (
                <div className="bg-slate-800 rounded-lg overflow-hidden border border-slate-700">
                  <div className="bg-slate-900 aspect-video flex items-center justify-center">
                    <div className="text-center">
                      <BookOpen className="w-16 h-16 mx-auto text-blue-400 mb-4" />
                      <p className="text-xl font-semibold">{currentVideo?.title}</p>
                      <p className="text-slate-400 mt-2">{currentVideo?.description}</p>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-2xl font-bold mb-4">{currentVideo?.title}</h3>
                    <p className="text-slate-300 mb-6">{currentVideo?.description}</p>
                    <button
                      onClick={handleVideoComplete}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
                    >
                      Complete & Take Quiz
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
                  <h3 className="text-2xl font-bold mb-6">Quiz: {currentVideo?.title}</h3>
                  <div className="space-y-6">
                    {(currentVideo?.questions || []).map((q, idx) => (
                      <div key={idx} className="bg-slate-700 rounded-lg p-4">
                        <p className="font-semibold mb-4">{idx + 1}. {q.text}</p>
                        <div className="space-y-2">
                          {q.options.map((option, optIdx) => (
                            <label key={optIdx} className="flex items-center p-3 bg-slate-600 rounded cursor-pointer hover:bg-slate-500 transition-colors">
                              <input
                                type="radio"
                                name={`question-${idx}`}
                                checked={quizAnswers[idx] === optIdx}
                                onChange={() => handleAnswerChange(idx, optIdx)}
                                disabled={quizSubmitted}
                                className="w-4 h-4 mr-3"
                              />
                              <span>{option}</span>
                              {quizSubmitted && optIdx === q.correct && <CheckCircle className="w-5 h-5 ml-auto text-green-400" />}
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {!quizSubmitted ? (
                    <button
                      onClick={handleSubmitQuiz}
                      className="mt-8 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors w-full"
                    >
                      Submit Quiz
                    </button>
                  ) : (
                    <div className="mt-8">
                      <div className={`p-4 rounded-lg mb-4 ${quizPassed ? 'bg-green-900 border border-green-600' : 'bg-red-900 border border-red-600'}`}>
                        <p className="font-semibold">Score: {quizScore.correct}/{quizScore.total}</p>
                        <p className={quizPassed ? 'text-green-300' : 'text-red-300'}>
                          {quizPassed ? 'Great job! Ready to continue?' : 'Try again to proceed.'}
                        </p>
                      </div>
                      {quizPassed && (
                        <button
                          onClick={handleNextVideo}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors w-full flex items-center justify-center"
                        >
                          {isLastVideo ? 'Finish Course' : 'Next Video'}
                          <ChevronRight className="w-5 h-5 ml-2" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Sidebar - Modules and Videos */}
            <div className="lg:col-span-1">
              <div className="bg-slate-800 rounded-lg border border-slate-700 p-4 sticky top-20">
                <h3 className="font-bold text-lg mb-4">Course Content</h3>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {courseData.modules.map(module => (
                    <div key={module._id}>
                      <p className="text-slate-300 font-semibold text-sm mb-2">{module.title}</p>
                      <div className="space-y-2 pl-2">
                        {module.videos.map(video => {
                          const isCompleted = completedVideos.has(video._id);
                          const isCurrent = video._id === currentVideoId;
                          const isAccessible = isCompleted || video._id <= Math.max(...completedVideos, 1);
                          
                          return (
                            <button
                              key={video._id}
                              onClick={() => goToVideo(video._id)}
                              disabled={!isAccessible}
                              className={`w-full text-left p-2 rounded text-sm transition-colors ${
                                isCurrent
                                  ? 'bg-blue-600 text-white'
                                  : isCompleted
                                  ? 'bg-green-900 text-green-200 hover:bg-green-800'
                                  : isAccessible
                                  ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                  : 'bg-slate-700 text-slate-500 cursor-not-allowed opacity-50'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span>{video.title}</span>
                                {isCompleted && <CheckCircle className="w-4 h-4" />}
                              </div>
                              <div className="text-xs mt-1 opacity-75 flex items-center">
                                <Clock className="w-3 h-3 mr-1" />
                                {video.duration}
                              </div>
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

export default CoursePage;