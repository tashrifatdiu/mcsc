// src/pages/Club.js (Full Fixed - Added Link Import)
import React, { useState } from 'react';
import { useParams, Link, useLocation, Routes, Route } from 'react-router-dom'; // Added Link here
import History from '../components/History';
import Members from '../components/Members';
import Achievements from '../components/Achievements';
import News from '../components/News';
import PastEvents from '../components/PastEvents';
import FutureEvents from '../components/FutureEvents';
import RegistrationModal from '../components/RegistrationModal';
import NewsDetail from '../components/NewsDetail';

// Hardcoded Science Club Data (single club)
const scienceData = {
  name: 'Milestone College Science Club',
  history: 'The Science Club at Milestone College was founded in 2010 by a visionary group of students and faculty passionate about igniting curiosity in the wonders of the universe. Starting as a modest after-school group with just 15 members meeting in a borrowed classroom, the club quickly evolved into a dynamic hub for innovation. By 2012, we organized our first annual Science Fair, drawing over 100 participants and earning recognition from the local education board. Over the years, we\'ve hosted renowned guest lectures from Nobel laureates and NASA engineers, fostering collaborations that led to student-led research papers published in international journals. Today, with over 200 active members, the club continues to champion hands-on learning through labs, field trips to observatories, and hackathons on sustainable tech. Our motto, "Explore, Experiment, Excel," encapsulates our journey from humble beginnings to a cornerstone of Milestone\'s academic excellence, inspiring generations to pursue STEM careers.',
  members: [
    { name: 'John Doe', role: 'President', image: 'https://via.placeholder.com/80?text=JD' },
    { name: 'Jane Smith', role: 'Vice President', image: 'https://via.placeholder.com/80?text=JS' },
    { name: 'Bob Johnson', role: 'Secretary', image: 'https://via.placeholder.com/80?text=BJ' }
  ],
  achievements: [
    { title: 'National Science Fair Grand Prize 2023', description: 'Team project on biodegradable plastics won top honors, featured in national media.' },
    { title: '5 Student Papers Published', description: 'In peer-reviewed journals like "Youth Science Review," covering topics from AI in healthcare to renewable energy.' },
    { title: 'Annual Expo for 500+ Attendees', description: 'Hosted interactive exhibits and workshops, partnering with local universities for live demos.' },
    { title: 'Best Club Innovation Award 2024', description: 'Recognized by the Education Ministry for our app on virtual chemistry simulations.' },
    { title: 'International Collaboration Grant', description: 'Secured $10,000 funding for joint research with European STEM schools on climate modeling.' }
  ],
  news: [
    { 
      id: 1, 
      title: 'New Lab Equipment Arrived', 
      date: '2025-10-01', 
      content: 'We\'ve received state-of-the-art microscopes and advanced chemistry kits, thanks to a generous donation from alumni. This upgrade will enable hands-on experiments in biology and chemistry, allowing students to explore cellular structures and chemical reactions like never before. Club members are already scheduling training sessions to maximize usage.',
      byline: 'By Dr. Ahmed, Club Advisor'
    },
    { 
      id: 2, 
      title: 'Upcoming Webinar on Quantum Computing', 
      date: '2025-09-15', 
      content: 'Join us for an enlightening webinar on quantum computing, featuring guest speaker Prof. Elena Vasquez from MIT. The session will cover basics of qubits, superposition, and real-world applications in cryptography and drug discovery. Register now to secure your spot—over 200 students have already signed up! Don\'t miss this chance to dive into the future of technology.',
      byline: 'By Jane Smith, VP'
    },
    { 
      id: 3, 
      title: 'Student Wins Regional Science Award', 
      date: '2025-09-20', 
      content: 'Congratulations to sophomore Aisha Rahman for her groundbreaking project on sustainable water filtration using recycled materials. Aisha\'s innovation not only won first place at the Regional Youth Science Fair but also earned a spot in the national competition next month. The club is proud of her dedication and will support her journey with mentorship and resources.',
      byline: 'By Club Staff'
    },
    { 
      id: 4, 
      title: 'Science Fest 2025 Planning Underway', 
      date: '2025-10-05', 
      content: 'Excitement is building for Science Fest 2025! Our team is brainstorming themes around AI and climate solutions, with workshops, demos, and a guest panel from local tech firms. Volunteers needed—sign up today to contribute ideas or help with logistics. Last year\'s event drew 300+ participants; let\'s make this one even bigger!',
      byline: 'By John Doe, President'
    }
  ],
  pastEvents: [
    { 
      id: 1,
      title: 'Science Fest 2024', 
      date: '2024-05-15', 
      description: 'Our flagship annual festival featured explosive chemistry demos, robot races, and a star-gazing night. Over 400 attendees, including parents and alumni, enjoyed interactive booths on quantum physics and eco-innovations. Highlights included a live volcano eruption and a solar-powered car showcase.', 
      image: 'https://via.placeholder.com/600x400?text=Science+Fest+2024+Explosion',
      color: 'bg-red-100 border-red-200'
    },
    { 
      id: 2,
      title: 'Biology Workshop Series', 
      date: '2024-03-10 to 2024-03-20', 
      description: 'A week-long series on genetics and dissection techniques, led by guest biologists. Students extracted DNA from strawberries and explored microscope worlds, culminating in a group presentation on biodiversity. 150 participants gained certificates and lab access perks.', 
      image: 'https://via.placeholder.com/600x400?text=Biology+Workshop+DNA',
      color: 'bg-green-100 border-green-200'
    },
    { 
      id: 3,
      title: 'Physics Olympiad Prep Camp', 
      date: '2024-07-05', 
      description: 'Intensive 3-day camp with mock tests and problem-solving sessions on mechanics and electromagnetism. 80 students prepped for nationals, with 60% qualifying. Evening stargazing with telescopes added a cosmic touch to the rigorous training.', 
      image: 'https://via.placeholder.com/600x400?text=Physics+Olympiad+Stars',
      color: 'bg-blue-100 border-blue-200'
    }
  ],
  futureEvents: [
    { 
      id: 1, 
      title: 'Science Fest', 
      date: '2025-11-10', 
      description: 'Exciting science fest including Science Fair, Olympiad, and Cultural Evening. Each activity costs 200 TK.', 
      subEvents: [
        { id: 'fair', name: 'Science Fair', cost: 200 },
        { id: 'olympiad', name: 'Olympiad', cost: 200 },
        { id: 'cultural', name: 'Cultural Evening', cost: 200 }
      ]
    }
  ]
};

const Club = () => {
  const location = useLocation();
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [resetTrigger, setResetTrigger] = useState(0);

  const path = location.pathname.split('/club/').pop() || 'history';

  const openRegistration = (eventWithSubs) => {
    setSelectedEvent(eventWithSubs);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleModalSuccess = () => {
    setResetTrigger(prev => prev + 1);
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-primary">
      <header className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-6 sm:py-8">
          <Link to="/" className="news-link mb-4 inline-block text-sm">&larr; Back to Home</Link>
          <h1 className="news-headline mb-2">{scienceData.name}</h1>
          <p className="news-subtext max-w-3xl">{scienceData.history}</p>
        </div>
      </header>
      <div className="bg-gray-secondary">
        <nav className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <div className="overflow-x-auto">
            <div className="flex space-x-1 sm:space-x-2 border-b border-gray-border py-2">
              {[
                { path: 'history', label: 'About' },
                { path: 'members', label: 'Team' },
                { path: 'achievements', label: 'Highlights' },
                { path: 'news', label: 'News' },
                { path: 'past-events', label: 'Past Coverage' },
                { path: 'future-events', label: 'Upcoming' }
              ].map(item => (
                <Link
                  key={item.path}
                  to={`/club/${item.path}`}
                  className={`py-2 px-3 sm:px-4 text-xs sm:text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0 ${
                    path === item.path
                      ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                      : 'text-gray-text hover:text-gray-headline bg-gray-accent'
                  } rounded-t-lg`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </nav>
      </div>
      <main className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-6 sm:py-8">
        <Routes>
          <Route path="history" element={<History history={scienceData.history} />} />
          <Route path="members" element={<Members members={scienceData.members} />} />
          <Route path="achievements" element={<Achievements achievements={scienceData.achievements} />} />
          <Route path="news" element={<News news={scienceData.news} clubId="science" />} />
          <Route path="news/:newsId" element={<NewsDetail clubData={{ science: scienceData }} />} />
          <Route path="past-events" element={<PastEvents events={scienceData.pastEvents} />} />
          <Route path="future-events" element={<FutureEvents events={scienceData.futureEvents} onRegister={openRegistration} resetTrigger={resetTrigger} />} />
          <Route index element={<History history={scienceData.history} />} />
        </Routes>
      </main>
      <RegistrationModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
        eventData={selectedEvent}
      />
    </div>
  );
};

export default Club;