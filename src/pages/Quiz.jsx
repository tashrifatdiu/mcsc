// src/pages/Quiz.jsx (Full Fixed - All ESLint Errors/Warnings Resolved)
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const questions = [
  {
    id: 1,
    question: 'What is the chemical symbol for gold?',
    options: ['Au', 'Ag', 'Fe', 'Cu'],
    correct: 'Au'
  },
  {
    id: 2,
    question: 'Which planet is known as the Red Planet?',
    options: ['Venus', 'Mars', 'Jupiter', 'Saturn'],
    correct: 'Mars'
  },
  {
    id: 3,
    question: 'What is the speed of light in vacuum?',
    options: ['3x10^8 m/s', '3x10^6 m/s', '3x10^10 m/s', '3x10^4 m/s'],
    correct: '3x10^8 m/s'
  },
  {
    id: 4,
    question: 'Who discovered penicillin?',
    options: ['Alexander Fleming', 'Louis Pasteur', 'Marie Curie', 'Isaac Newton'],
    correct: 'Alexander Fleming'
  },
  {
    id: 5,
    question: 'What is the pH of pure water?',
    options: ['0', '7', '14', '1'],
    correct: '7'
  }
];

const Quiz = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [timeLeft, setTimeLeft] = useState(15);
  const [answers, setAnswers] = useState({});
  const [quizComplete, setQuizComplete] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sessionValid, setSessionValid] = useState(false);
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();

  // Memoized fetchProfile (moved up to avoid useBeforeDefine)
  const fetchProfile = useCallback(async (email) => {
    try {
      const response = await fetch(`http://localhost:5000/api/olympiad/profile?email=${email}`);
      const result = await response.json();
      if (response.ok && result.data && result.data.isRegistered) {
        setProfile(result.data);
        setSessionValid(true);
      } else {
        alert('Register first.');
        localStorage.removeItem('olympiadSession');
        navigate('/olympiad');
      }
    } catch (error) {
      console.error('Profile fetch error:', error);
      alert('Error loading profile.');
      navigate('/olympiad');
    }
  }, [navigate]);

  // Memoized handleNext with all deps
  const handleNext = useCallback(async () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setTimeLeft(15);
      setSelectedAnswer('');
    } else {
      setLoading(true);
      try {
        const sessionEmail = localStorage.getItem('olympiadSession');
        await fetch('http://localhost:5000/api/olympiad/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: sessionEmail, answers })
        });
        setQuizComplete(true);
        localStorage.removeItem('olympiadSession');
        alert('Quiz submitted! Results saved to your profile.');
        navigate('/olympiad');
      } catch (error) {
        alert('Submit error: ' + error.message);
      }
      setLoading(false);
    }
  }, [answers, currentQuestion, navigate]);

  useEffect(() => {
    const sessionEmail = localStorage.getItem('olympiadSession');
    if (!sessionEmail) {
      alert('Login required for quiz.');
      navigate('/olympiad');
      return;
    }

    // Fetch profile to check registration
    fetchProfile(sessionEmail);

    if (quizComplete) return;
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      handleNext();
    }
  }, [timeLeft, quizComplete, navigate, handleNext, fetchProfile]);

  const handleAnswer = (answer) => {
    setSelectedAnswer(answer);
    setAnswers(prev => ({ ...prev, [questions[currentQuestion].id]: answer }));
    setTimeout(() => handleNext(), 500);
  };

  const handleLogout = () => {
    localStorage.removeItem('olympiadSession');
    alert('Logged out.');
    navigate('/olympiad');
  };

  if (!sessionValid) return <div className="text-center py-8">Loading profile...</div>;

  if (quizComplete) {
    return (
      <div className="max-w-md mx-auto p-6 bg-green-50 rounded-lg text-center">
        <h2 className="text-2xl font-bold mb-4">Quiz Complete!</h2>
        <p className="mb-4">Thanks for participating. Score saved to profile.</p>
        <Link to="/olympiad" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">View Profile</Link>
      </div>
    );
  }

  const q = questions[currentQuestion];

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Online Olympiad - MCSC & Kishor Alo</h1>
        <button onClick={handleLogout} className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600">Logout</button>
      </div>
      <div className="text-center mb-6">
        <p className="text-lg font-semibold">Question {currentQuestion + 1} of 5 - Hi, {profile.profile.name} from {profile.profile.school}</p>
        <div className="text-3xl font-mono text-red-500 mb-2">{timeLeft}s</div>
      </div>
      <h2 className="text-xl font-bold mb-4">{q.question}</h2>
      <div className="space-y-2">
        {q.options.map((option, idx) => (
          <button
            key={idx}
            onClick={() => handleAnswer(option)}
            disabled={selectedAnswer}
            className={`w-full p-3 border rounded-lg text-left transition-colors ${
              selectedAnswer ? 'bg-gray-200 cursor-not-allowed' : 'bg-blue-50 hover:bg-blue-100'
            }`}
          >
            {option}
          </button>
        ))}
      </div>
      {loading && <p className="text-center mt-4">Submitting...</p>}
    </div>
  );
};

export default Quiz;