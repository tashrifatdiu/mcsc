// client/src/apiJournal.js
// Journal-related client API helpers. Uses getAccessToken from existing api.js
import { getAccessToken } from './api';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000';

export async function createJournal(payload) {
  const token = await getAccessToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE.replace(/\/$/, '')}/api/journal`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload)
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error || data?.message || 'Failed to save journal');
  return data;
}

export async function updateJournal(id, payload) {
  const token = await getAccessToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE.replace(/\/$/, '')}/api/journal/${id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(payload)
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error || data?.message || 'Failed to update journal');
  return data;
}

export async function fetchJournals({ limit = 20, skip = 0, sortBy = 'recent', search = '', timeFilter = '', mine = false, authorId = '' } = {}) {
  // support mine flag, author filter, search, time filter, and sort
  const query = new URLSearchParams({ limit: String(limit), skip: String(skip) });
  if (sortBy) query.set('sortBy', sortBy);
  if (search) query.set('search', search);
  if (timeFilter) query.set('timeFilter', timeFilter);
  if (mine) query.set('mine', 'true');
  if (authorId) query.set('authorId', authorId);

  const url = `${API_BASE.replace(/\/$/, '')}/api/journal?${query.toString()}`;
  // Include token when available. For public lists it's harmless; for mine=true it's required.
  const headers = {};
  try {
    const token = await getAccessToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  } catch (err) {
    // ignore token errors and continue without auth
  }

  const res = await fetch(url, { headers });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error || data?.message || `Failed to fetch journals (${res.status})`);
  return data;
}

export async function deleteJournal(id) {
  const token = await getAccessToken();
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE.replace(/\/$/, '')}/api/journal/${id}`, {
    method: 'DELETE',
    headers
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error || data?.message || 'Failed to delete journal');
  return data;
}

export async function fetchJournalById(id) {
  const token = await getAccessToken();
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE.replace(/\/$/, '')}/api/journal/${id}`, { headers });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error || data?.message || 'Failed to fetch journal');
  return data;
}

export async function likeJournal(id) {
  const token = await getAccessToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE.replace(/\/$/, '')}/api/journal/${id}/like`, {
    method: 'POST',
    headers
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error || data?.message || 'Failed to like journal');
  return data;
}

export async function commentJournal(id, text) {
  const token = await getAccessToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE.replace(/\/$/, '')}/api/journal/${id}/comment`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ text })
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error || data?.message || 'Failed to add comment');
  return data;
}

export async function addSticker(id, sticker) {
  const token = await getAccessToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE.replace(/\/$/, '')}/api/journal/${id}/sticker`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ sticker })
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error || data?.message || 'Failed to add sticker');
  return data;
}