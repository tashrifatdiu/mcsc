import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Courses.css';

const CourseList = () => {
  const [courses, setCourses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('/api/courses').then(res => setCourses(res.data.courses || []));
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

export default CourseList;
