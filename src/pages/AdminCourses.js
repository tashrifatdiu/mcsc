import React, { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  adminLogin,
  adminCreateCourse,
  adminFetchPendingJournals,
  adminFetchJournalById,
  fetchCourses,
  adminUpdateCourse,
  adminDeleteCourse
} from '../api';

// NOTE: admin token removed for course admin UI — no token required to submit courses

export default function AdminCourses() {
  // no admin token required for this UI
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', modules: [] });
  const [message, setMessage] = useState(null);

  // Use CSS classes for dark-themed admin inputs (defined in Courses.css):
  // - `admin-input` for standard inputs
  // - `admin-textarea` for textareas
  // - `admin-small` for small inline inputs

  useEffect(() => { loadCourses(); }, []);

  async function loadCourses() {
    setLoading(true); setMessage(null);
    try {
      const res = await fetchCourses();
      setCourses(res.courses || []);
    } catch (err) {
      console.error('load courses err', err); setMessage(err.message || 'Failed to load');
    } finally { setLoading(false); }
  }

  // token storage removed for course admin

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
    setForm({ title: c.title || '', description: c.description || '', modules: c.modules || [] });
  }

  function cloneCourseToForm(c) {
    setForm({ title: c.title || '', description: c.description || '', modules: (c.modules || []).map(m => ({
      ...m,
      videos: (m.videos || []).map(v => ({ ...v })),
      questions: (m.questions || []).map(q => ({ ...q }))
    })) });
  }

  function addModule() {
    setForm(prev => ({ ...prev, modules: [...prev.modules, { title: 'New module', description: '', youtube: '', videos: [], questions: [] }] }));
  }

  function updateModule(idx, key, value) {
    setForm(prev => {
      const modules = prev.modules.slice(); modules[idx] = { ...modules[idx], [key]: value }; return { ...prev, modules };
    });
  }

  function removeModule(idx) {
    setForm(prev => ({ ...prev, modules: prev.modules.filter((_, i) => i !== idx) }));
  }

  function moveModule(idx, dir) {
    setForm(prev => {
      const modules = prev.modules.slice();
      const to = dir === 'up' ? idx - 1 : idx + 1;
      if (to < 0 || to >= modules.length) return prev;
      const tmp = modules[to]; modules[to] = modules[idx]; modules[idx] = tmp;
      return { ...prev, modules };
    });
  }

  function addVideo(moduleIdx) {
    setForm(prev => {
      const modules = prev.modules.slice();
      const m = { ...modules[moduleIdx] };
      m.videos = [...(m.videos || []), { id: uuidv4(), title: 'New video', youtube_link: '', duration: '', description: '' }];
      modules[moduleIdx] = m;
      return { ...prev, modules };
    });
  }

  function removeVideo(moduleIdx, vidIdx) {
    setForm(prev => {
      const modules = prev.modules.slice();
      const m = { ...modules[moduleIdx] };
      m.videos = (m.videos || []).filter((_, i) => i !== vidIdx);
      modules[moduleIdx] = m;
      return { ...prev, modules };
    });
  }

  function updateVideo(moduleIdx, vidIdx, key, value) {
    setForm(prev => {
      const modules = prev.modules.slice();
      const m = { ...modules[moduleIdx] };
      m.videos = (m.videos || []).slice();
      m.videos[vidIdx] = { ...m.videos[vidIdx], [key]: value };
      modules[moduleIdx] = m;
      return { ...prev, modules };
    });
  }

  function addQuestion(moduleIdx) {
    setForm(prev => {
      const modules = prev.modules.slice();
      const m = { ...modules[moduleIdx] };
      m.questions = [...(m.questions || []), { _id: uuidv4(), text: 'New question', options: ['A','B','C','D'], answer: '' }];
      modules[moduleIdx] = m;
      return { ...prev, modules };
    });
  }

  function removeQuestion(moduleIdx, qIdx) {
    setForm(prev => {
      const modules = prev.modules.slice();
      const m = { ...modules[moduleIdx] };
      m.questions = (m.questions || []).filter((_, i) => i !== qIdx);
      modules[moduleIdx] = m;
      return { ...prev, modules };
    });
  }

  function updateQuestion(moduleIdx, qIdx, key, value) {
    setForm(prev => {
      const modules = prev.modules.slice();
      const m = { ...modules[moduleIdx] };
      m.questions = (m.questions || []).slice();
      m.questions[qIdx] = { ...m.questions[qIdx], [key]: value };
      modules[moduleIdx] = m;
      return { ...prev, modules };
    });
  }

  // No token required — show admin UI immediately

  return (
    <div style={{ maxWidth: 1200, margin: '20px auto' }}>
      <h2>Manage Courses</h2>
      {message && <div className="status">{message}</div>}
      <div style={{ marginTop: 12 }}>
        <h3>Create new course</h3>
        <label style={{ display: 'block', marginBottom: 8 }}>Title
          <input className="admin-input" value={form.title} onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))} />
        </label>
        <label style={{ display: 'block', marginBottom: 8 }}>Description
          <textarea className="admin-textarea" value={form.description} onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))} />
        </label>
        <div>
          <h4>Modules</h4>
          {form.modules.map((m, i) => (
            <div key={i} className="card" style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <strong>Module #{i + 1}</strong>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-ghost" onClick={() => moveModule(i, 'up')}>↑</button>
                  <button className="btn btn-ghost" onClick={() => moveModule(i, 'down')}>↓</button>
                  <button className="btn btn-danger" onClick={() => removeModule(i)}>Remove</button>
                </div>
              </div>
              <label style={{ display: 'block', marginBottom: 8 }}>Title
                <input className="admin-input" value={m.title} onChange={e => updateModule(i, 'title', e.target.value)} />
              </label>
              <label style={{ display: 'block', marginBottom: 8 }}>Description
                <textarea className="admin-textarea" value={m.description} onChange={e => updateModule(i, 'description', e.target.value)} />
              </label>
              <label style={{ display: 'block', marginBottom: 8 }}>YouTube playlist/link
                <input className="admin-input" value={m.youtube || ''} onChange={e => updateModule(i, 'youtube', e.target.value)} />
              </label>

              <div style={{ marginTop: 8 }}>
                <strong>Videos</strong>
                {(m.videos || []).map((v, vi) => (
                  <div key={v.id || vi} className="card" style={{ marginTop: 6 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <em>{v.title || 'Untitled'}</em>
                      <button className="btn btn-danger" onClick={() => removeVideo(i, vi)}>Remove</button>
                    </div>
                    <label style={{ display: 'block', marginBottom: 6 }}>Title
                      <input className="admin-input" value={v.title} onChange={e => updateVideo(i, vi, 'title', e.target.value)} />
                    </label>
                    <label style={{ display: 'block', marginBottom: 6 }}>YouTube link
                      <input className="admin-input" value={v.youtube_link || ''} onChange={e => updateVideo(i, vi, 'youtube_link', e.target.value)} />
                    </label>
                    <label style={{ display: 'block', marginBottom: 6 }}>Duration
                      <input className="admin-small admin-input" value={v.duration || ''} onChange={e => updateVideo(i, vi, 'duration', e.target.value)} />
                    </label>
                    <label style={{ display: 'block', marginBottom: 6 }}>Description
                      <textarea className="admin-textarea" value={v.description || ''} onChange={e => updateVideo(i, vi, 'description', e.target.value)} />
                    </label>
                  </div>
                ))}
                <div style={{ marginTop: 6 }}><button className="btn btn-ghost" onClick={() => addVideo(i)}>Add video</button></div>
              </div>

              <div style={{ marginTop: 8 }}>
                <strong>Questions</strong>
                {(m.questions || []).map((q, qi) => (
                  <div key={q._id || qi} className="card" style={{ marginTop: 6 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <em>{q.text || 'Question'}</em>
                      <button className="btn btn-danger" onClick={() => removeQuestion(i, qi)}>Remove</button>
                    </div>
                    <label style={{ display: 'block', marginBottom: 6 }}>Question
                      <textarea className="admin-textarea" value={q.text} onChange={e => updateQuestion(i, qi, 'text', e.target.value)} />
                    </label>
                    <label style={{ display: 'block', marginBottom: 6 }}>Options (comma separated)
                      <input className="admin-input" value={(q.options || []).join(',')} onChange={e => updateQuestion(i, qi, 'options', e.target.value.split(',').map(s=>s.trim()))} />
                    </label>
                    <label style={{ display: 'block', marginBottom: 6 }}>Answer
                      <input className="admin-small admin-input" value={q.answer || q.correct || ''} onChange={e => updateQuestion(i, qi, 'answer', e.target.value)} />
                    </label>
                  </div>
                ))}
                <div style={{ marginTop: 6 }}><button className="btn btn-ghost" onClick={() => addQuestion(i)}>Add question</button></div>
              </div>
            </div>
          ))}
          <div style={{ marginTop: 6 }}>
            <button className="btn btn-ghost" onClick={addModule}>Add module</button>
          </div>
        </div>
        <div style={{ marginTop: 10 }}>
          {!editing && <button className="btn btn-primary" onClick={handleCreate}>Create course</button>}
          {editing && <button className="btn btn-primary" onClick={() => handleSave(editing)}>Save changes</button>}
        </div>
      </div>

      <hr />

      <h3>Existing courses</h3>
      {loading ? <div>Loading...</div> : (
        <div style={{ display: 'grid', gap: 12 }}>
          {courses.map(c => (
            <div key={c._id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <h4 style={{ margin: 0 }}>{c.title}</h4>
                  <div style={{ color: '#6b7280' }}>{c.description}</div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-ghost" onClick={() => startEdit(c)}>Edit</button>
                  <button className="btn btn-danger" onClick={() => handleDelete(c._id)}>Delete</button>
                </div>
              </div>
              <div style={{ marginTop: 8 }}>
                <strong>Modules:</strong>
                <ol>
                  {(c.modules || []).map((m, i) => (
                    <li key={i}>{m.title} {m.videoUrl ? <span style={{ color: '#6b7280', fontSize: 12 }}>({m.videoUrl})</span> : null}</li>
                  ))}
                </ol>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
