import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Courses.css';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_BASE || 'http://localhost:5000'}/api/courses`)
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        if (data.courses) {
          setCourses(data.courses);
        } else {
          console.error('Unexpected response structure:', data);
        }
      })
      .catch(err => console.error('Failed to fetch courses:', err));
  }, []);

  return (
    <div className="course-list-section">
      <h1>Courses</h1>
      <div className="course-list-grid">
        {courses.map(course => (
          <div key={course._id} className="course-card" onClick={() => navigate(`/courses/${course._id}`)}>
            <h2>{course.title}</h2>
            <p>{course.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Courses;
