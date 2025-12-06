import React, { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  adminLogin,
  adminCreateCourse,
  fetchCourses,
  adminUpdateCourse,
  adminDeleteCourse
} from '../api';
import { 
  Plus, Edit3, Trash2, Save, X, LogOut, 
  BookOpen, Video, HelpCircle, ChevronDown, ChevronUp,
  Shield, GripVertical, Eye, EyeOff, FileText, Users, UserCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './AdminCourses.css';

const LOCAL_TOKEN_KEY = 'mcsc_admin_token';
const LOCAL_ADMIN_KEY = 'mcsc_admin_info';

export default function AdminCourses() {
  const navigate = useNavigate();
  // Authentication state
  const [adminInfo, setAdminInfo] = useState(() => {
    try {
      const raw = localStorage.getItem(LOCAL_ADMIN_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  });
  const [token, setToken] = useState(localStorage.getItem(LOCAL_TOKEN_KEY) || null);
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState([]);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', modules: [] });
  const [message, setMessage] = useState(null);
  const [expandedModules, setExpandedModules] = useState({});
  const [expandedSections, setExpandedSections] = useState({});

  // Use CSS classes for dark-themed admin inputs (defined in Courses.css):
  // - `admin-input` for standard inputs
  // - `admin-textarea` for textareas
  // - `admin-small` for small inline inputs

  useEffect(() => { 
    if (token && adminInfo) {
      // Only main building admin can manage courses
      if (adminInfo.building === 'main building') {
        loadCourses();
      }
    }
  }, [token, adminInfo]);

  async function loadCourses() {
    setLoading(true); setMessage(null);
    try {
      const res = await fetchCourses();
      setCourses(res.courses || []);
    } catch (err) {
      console.error('load courses err', err); setMessage(err.message || 'Failed to load');
    } finally { setLoading(false); }
  }

  async function handleLogin(e) {
    e.preventDefault();
    if (!credentials.username || !credentials.password) {
      setMessage('Please enter username and password');
      return;
    }
    setLoading(true);
    try {
      const res = await adminLogin(credentials.username, credentials.password);
      
      // Only main building admin can access courses
      if (res.admin.building !== 'main building') {
        setMessage('Access denied. Only main building admin can manage courses.');
        setLoading(false);
        return;
      }
      
      setToken(res.token);
      setAdminInfo(res.admin);
      localStorage.setItem(LOCAL_TOKEN_KEY, res.token);
      localStorage.setItem(LOCAL_ADMIN_KEY, JSON.stringify(res.admin));
      setCredentials({ username: '', password: '' });
      setMessage(`Welcome, ${res.admin.username}!`);
      await loadCourses();
    } catch (err) {
      setMessage(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    setToken(null);
    setAdminInfo(null);
    setCourses([]);
    setEditing(null);
    setForm({ title: '', description: '', modules: [] });
    localStorage.removeItem(LOCAL_TOKEN_KEY);
    localStorage.removeItem(LOCAL_ADMIN_KEY);
    setMessage('Logged out');
  }

  async function handleCreate() {
    setMessage(null);
    try {
      const payload = { title: form.title, description: form.description, modules: form.modules };
      const res = await adminCreateCourse(payload);
      setMessage('Created');
      setForm({ title: '', description: '', modules: [] });
      await loadCourses();
    } catch (err) { console.error('create failed', err); setMessage(err.message || 'Create failed'); }
  }

  async function handleSave(id) {
    setMessage(null);
    try {
      await adminUpdateCourse(id, form);
      setMessage('Saved'); setEditing(null); await loadCourses();
    } catch (err) { console.error('save failed', err); setMessage(err.message || 'Save failed'); }
  }

  async function handleDelete(id) {
    if (!confirm('Delete course?')) return;
    setMessage(null);
    try {
      await adminDeleteCourse(id);
      setMessage('Deleted'); await loadCourses();
    } catch (err) { console.error('delete failed', err); setMessage(err.message || 'Delete failed'); }
  }

  function startEdit(c) {
    setEditing(c._id);
    setForm({
      title: c.title || '',
      description: c.description || '',
      modules: (c.modules || []).map(m => ({
        id: m.id || uuidv4(),
        title: m.title || '',
        description: m.description || '',
        youtube: m.youtube || '',
        videos: (m.videos || []).map(v => ({
          id: v.id || uuidv4(),
          title: v.title || '',
          youtube_link: v.youtube_link || '',
          duration: v.duration || '',
          description: v.description || ''
        })),
        questions: (m.questions || []).map(q => ({
          id: q.id || q._id || uuidv4(),
          text: q.text || q.question || '',
          options: q.options || ['', '', '', ''],
          answer: q.answer || q.correct || ''
        }))
      }))
    });
    setShowForm(true);
    const expanded = {};
    (c.modules || []).forEach((m, i) => {
      expanded[m.id || i] = true;
    });
    setExpandedModules(expanded);
  }

  function startNew() {
    setEditing(null);
    setForm({ title: '', description: '', modules: [] });
    setShowForm(true);
    setExpandedModules({});
    setExpandedSections({});
  }

  function cancelEdit() {
    setEditing(null);
    setShowForm(false);
    setForm({ title: '', description: '', modules: [] });
    setExpandedModules({});
    setExpandedSections({});
  }

  function addModule() {
    const newModule = {
      id: uuidv4(),
      title: '',
      description: '',
      youtube: '',
      videos: [],
      questions: []
    };
    setForm(prev => ({ ...prev, modules: [...prev.modules, newModule] }));
    setExpandedModules(prev => ({ ...prev, [newModule.id]: true }));
  }

  function updateModule(id, updates) {
    setForm(prev => ({
      ...prev,
      modules: prev.modules.map(m => m.id === id ? { ...m, ...updates } : m)
    }));
  }

  function removeModule(id) {
    if (!window.confirm('Delete this module?')) return;
    setForm(prev => ({ ...prev, modules: prev.modules.filter(m => m.id !== id) }));
  }

  function moveModule(id, dir) {
    setForm(prev => {
      const modules = [...prev.modules];
      const idx = modules.findIndex(m => m.id === id);
      if (idx === -1) return prev;
      const to = dir === 'up' ? idx - 1 : idx + 1;
      if (to < 0 || to >= modules.length) return prev;
      [modules[idx], modules[to]] = [modules[to], modules[idx]];
      return { ...prev, modules };
    });
  }

  function toggleModule(id) {
    setExpandedModules(prev => ({ ...prev, [id]: !prev[id] }));
  }

  function toggleSection(key) {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  }

  function addVideo(moduleId) {
    const module = form.modules.find(m => m.id === moduleId);
    if (!module) return;
    const newVideo = { id: uuidv4(), title: '', youtube_link: '', duration: '', description: '' };
    updateModule(moduleId, { videos: [...(module.videos || []), newVideo] });
  }

  function removeVideo(moduleId, vidId) {
    if (!window.confirm('Delete this video?')) return;
    const module = form.modules.find(m => m.id === moduleId);
    if (!module) return;
    updateModule(moduleId, { videos: (module.videos || []).filter(v => v.id !== vidId) });
  }

  function updateVideo(moduleId, vidId, updates) {
    const module = form.modules.find(m => m.id === moduleId);
    if (!module) return;
    updateModule(moduleId, {
      videos: (module.videos || []).map(v => v.id === vidId ? { ...v, ...updates } : v)
    });
  }

  function addQuestion(moduleId) {
    const module = form.modules.find(m => m.id === moduleId);
    if (!module) return;
    const newQuestion = { id: uuidv4(), text: '', options: ['', '', '', ''], answer: '' };
    updateModule(moduleId, { questions: [...(module.questions || []), newQuestion] });
  }

  function removeQuestion(moduleId, qId) {
    if (!window.confirm('Delete this question?')) return;
    const module = form.modules.find(m => m.id === moduleId);
    if (!module) return;
    updateModule(moduleId, { questions: (module.questions || []).filter(q => q.id !== qId) });
  }

  function updateQuestion(moduleId, qId, updates) {
    const module = form.modules.find(m => m.id === moduleId);
    if (!module) return;
    updateModule(moduleId, {
      questions: (module.questions || []).map(q => q.id === qId ? { ...q, ...updates } : q)
    });
  }

  // LOGIN SCREEN
  if (!token || !adminInfo || adminInfo.building !== 'main building') {
    return (
      <div className="admin-courses-login">
        <div className="login-card">
          <div className="login-header">
            <div className="login-icon">
              <Shield size={48} />
            </div>
            <h2>Course Admin Login</h2>
            <p>Main building admin only</p>
            <div className="warning">
              ⚠️ Only main building admin can manage courses
            </div>
          </div>
          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label>Username</label>
              <input 
                value={credentials.username} 
                onChange={e => setCredentials(p => ({...p, username: e.target.value}))}
                placeholder="Enter username" 
                required 
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input 
                type="password" 
                value={credentials.password} 
                onChange={e => setCredentials(p => ({...p, password: e.target.value}))}
                placeholder="Enter password" 
                required 
              />
            </div>
            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
          {message && <div className={`login-message ${message?.type || 'info'}`}>{typeof message === 'string' ? message : message?.text}</div>}
        </div>
      </div>
    );
  }

  // MAIN UI
  return (
    <div className="admin-courses-page">
      <div className="admin-header">
        <div className="header-left">
          <h1>Course Management</h1>
          <p>Logged in as: <strong>{adminInfo.username}</strong></p>
        </div>
        <div className="header-actions">
          <button className="nav-btn" onClick={() => navigate('/admin-verify')}>
            <UserCheck size={18} />
            Registrations
          </button>
          <button className="nav-btn" onClick={() => navigate('/admin/members')}>
            <Users size={18} />
            Members
          </button>
          <button className="nav-btn" onClick={() => navigate('/admin/journals')}>
            <FileText size={18} />
            Journals
          </button>
          <button className="new-course-btn" onClick={startNew}>
            <Plus size={18} />
            New Course
          </button>
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>

      {message && (
        <div className={`status-message ${typeof message === 'object' ? message.type : 'info'}`}>
          {typeof message === 'string' ? message : message?.text}
        </div>
      )}

      {showForm && (
        <div className="course-form-modal">
          <div className="form-container">
            <div className="form-header">
              <h2>{editing ? 'Edit Course' : 'Create New Course'}</h2>
              <button className="close-btn" onClick={cancelEdit}>
                <X size={24} />
              </button>
            </div>

            <div className="form-content">
              <div className="basic-info-section">
                <h3>Basic Information</h3>
                <div className="form-group">
                  <label>Course Title *</label>
                  <input
                    value={form.title}
                    onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter course title"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Course Description</label>
                  <textarea
                    value={form.description}
                    onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter course description"
                    rows={3}
                  />
                </div>
              </div>

              <div className="modules-section">
                <div className="section-header">
                  <h3>Course Modules ({form.modules.length})</h3>
                  <button type="button" className="add-module-btn" onClick={addModule}>
                    <Plus size={16} />
                    Add Module
                  </button>
                </div>

                {form.modules.length === 0 && (
                  <div className="empty-modules">
                    <BookOpen size={48} />
                    <p>No modules yet. Click "Add Module" to get started.</p>
                  </div>
                )}

                {form.modules.map((module, moduleIndex) => (
                  <div key={module.id} className="module-card">
                    <div className="module-header" onClick={() => toggleModule(module.id)}>
                      <div className="module-title-section">
                        <GripVertical size={20} className="drag-handle" />
                        <span className="module-number">Module {moduleIndex + 1}</span>
                        <span className="module-title-preview">
                          {module.title || 'Untitled Module'}
                        </span>
                        <div className="module-stats">
                          <span title="Videos"><Video size={14} /> {module.videos?.length || 0}</span>
                          <span title="Questions"><HelpCircle size={14} /> {module.questions?.length || 0}</span>
                        </div>
                      </div>
                      <div className="module-actions">
                        <button type="button" onClick={e => { e.stopPropagation(); moveModule(module.id, 'up'); }} disabled={moduleIndex === 0}>
                          <ChevronUp size={16} />
                        </button>
                        <button type="button" onClick={e => { e.stopPropagation(); moveModule(module.id, 'down'); }} disabled={moduleIndex === form.modules.length - 1}>
                          <ChevronDown size={16} />
                        </button>
                        <button type="button" className="delete-btn" onClick={e => { e.stopPropagation(); removeModule(module.id); }}>
                          <Trash2 size={16} />
                        </button>
                        {expandedModules[module.id] ? <EyeOff size={16} /> : <Eye size={16} />}
                      </div>
                    </div>

                    {expandedModules[module.id] && (
                      <div className="module-content">
                        <div className="form-group">
                          <label>Module Title *</label>
                          <input
                            value={module.title}
                            onChange={e => updateModule(module.id, { title: e.target.value })}
                            placeholder="Enter module title"
                            onClick={e => e.stopPropagation()}
                          />
                        </div>
                        <div className="form-group">
                          <label>Module Description</label>
                          <textarea
                            value={module.description}
                            onChange={e => updateModule(module.id, { description: e.target.value })}
                            placeholder="Enter module description"
                            rows={2}
                          />
                        </div>
                        <div className="form-group">
                          <label>YouTube Playlist/Link (Optional)</label>
                          <input
                            value={module.youtube}
                            onChange={e => updateModule(module.id, { youtube: e.target.value })}
                            placeholder="https://youtube.com/playlist?list=..."
                          />
                        </div>

                        {/* Videos Section */}
                        <div className="subsection">
                          <div className="subsection-header" onClick={() => toggleSection(`videos-${module.id}`)}>
                            <h4>
                              <Video size={16} /> 
                              Videos ({module.videos?.length || 0})
                            </h4>
                            <div className="subsection-actions">
                              <button type="button" onClick={e => { e.stopPropagation(); addVideo(module.id); }}>
                                <Plus size={14} /> Add Video
                              </button>
                              {expandedSections[`videos-${module.id}`] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </div>
                          </div>
                          
                          {expandedSections[`videos-${module.id}`] && (
                            <div className="subsection-content">
                              {module.videos?.length === 0 && (
                                <div className="empty-subsection">
                                  <p>No videos added yet</p>
                                </div>
                              )}
                              {module.videos?.map((video, videoIndex) => (
                                <div key={video.id} className="video-item">
                                  <div className="item-header">
                                    <span className="item-number">Video {videoIndex + 1}</span>
                                    <button type="button" onClick={() => removeVideo(module.id, video.id)}>
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                  <div className="item-fields">
                                    <div className="form-group">
                                      <label>Video Title</label>
                                      <input
                                        value={video.title}
                                        onChange={e => updateVideo(module.id, video.id, { title: e.target.value })}
                                        placeholder="Enter video title"
                                      />
                                    </div>
                                    <div className="form-group">
                                      <label>YouTube Link</label>
                                      <input
                                        value={video.youtube_link}
                                        onChange={e => updateVideo(module.id, video.id, { youtube_link: e.target.value })}
                                        placeholder="https://youtube.com/watch?v=..."
                                      />
                                    </div>
                                    <div className="form-group">
                                      <label>Duration</label>
                                      <input
                                        value={video.duration}
                                        onChange={e => updateVideo(module.id, video.id, { duration: e.target.value })}
                                        placeholder="e.g., 10:30"
                                      />
                                    </div>
                                    <div className="form-group">
                                      <label>Video Description</label>
                                      <textarea
                                        value={video.description}
                                        onChange={e => updateVideo(module.id, video.id, { description: e.target.value })}
                                        placeholder="Enter video description"
                                        rows={2}
                                      />
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Quiz Section */}
                        <div className="subsection">
                          <div className="subsection-header" onClick={() => toggleSection(`quiz-${module.id}`)}>
                            <h4>
                              <HelpCircle size={16} /> 
                              Quiz Questions ({module.questions?.length || 0})
                            </h4>
                            <div className="subsection-actions">
                              <button type="button" onClick={e => { e.stopPropagation(); addQuestion(module.id); }}>
                                <Plus size={14} /> Add Question
                              </button>
                              {expandedSections[`quiz-${module.id}`] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </div>
                          </div>
                          
                          {expandedSections[`quiz-${module.id}`] && (
                            <div className="subsection-content">
                              {module.questions?.length === 0 && (
                                <div className="empty-subsection">
                                  <p>No questions added yet</p>
                                </div>
                              )}
                              {module.questions?.map((question, questionIndex) => (
                                <div key={question.id} className="question-item">
                                  <div className="item-header">
                                    <span className="item-number">Question {questionIndex + 1}</span>
                                    <button type="button" onClick={() => removeQuestion(module.id, question.id)}>
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                  <div className="item-fields">
                                    <div className="form-group">
                                      <label>Question Text</label>
                                      <textarea
                                        value={question.text}
                                        onChange={e => updateQuestion(module.id, question.id, { text: e.target.value })}
                                        placeholder="Enter question"
                                        rows={2}
                                      />
                                    </div>
                                    <div className="options-grid">
                                      {question.options?.map((option, optionIndex) => (
                                        <div key={optionIndex} className="option-item">
                                          <input
                                            type="radio"
                                            name={`correct-${question.id}`}
                                            checked={question.answer === optionIndex.toString() || question.answer === optionIndex}
                                            onChange={() => updateQuestion(module.id, question.id, { answer: optionIndex.toString() })}
                                          />
                                          <input
                                            value={option}
                                            onChange={e => {
                                              const newOptions = [...question.options];
                                              newOptions[optionIndex] = e.target.value;
                                              updateQuestion(module.id, question.id, { options: newOptions });
                                            }}
                                            placeholder={`Option ${optionIndex + 1}`}
                                          />
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="form-footer">
              <button type="button" className="cancel-btn" onClick={cancelEdit}>
                Cancel
              </button>
              <button type="button" className="save-btn" onClick={editing ? () => handleSave(editing) : handleCreate} disabled={loading}>
                <Save size={18} />
                {loading ? 'Saving...' : (editing ? 'Save Changes' : 'Create Course')}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="courses-grid">
        {loading && courses.length === 0 ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading courses...</p>
          </div>
        ) : courses.length === 0 ? (
          <div className="empty-state">
            <BookOpen size={64} />
            <h3>No courses yet</h3>
            <p>Create your first course to get started</p>
            <button className="create-first-btn" onClick={startNew}>
              <Plus size={18} />
              Create First Course
            </button>
          </div>
        ) : (
          courses.map(course => (
            <div key={course._id} className="course-card">
              <div className="course-header">
                <h3>{course.title}</h3>
                <div className="course-actions">
                  <button className="edit-btn" onClick={() => startEdit(course)}>
                    <Edit3 size={16} />
                  </button>
                  <button className="delete-btn" onClick={() => handleDelete(course._id)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <p className="course-description">{course.description}</p>
              <div className="course-stats">
                <span className="stat">
                  <BookOpen size={14} />
                  {course.modules?.length || 0} modules
                </span>
                <span className="stat">
                  <Video size={14} />
                  {course.modules?.reduce((total, module) => total + (module.videos?.length || 0), 0) || 0} videos
                </span>
                <span className="stat">
                  <HelpCircle size={14} />
                  {course.modules?.reduce((total, module) => total + (module.questions?.length || 0), 0) || 0} questions
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
