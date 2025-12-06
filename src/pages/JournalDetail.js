// client/src/pages/JournalDetail.js
import React, { useEffect, useState } from 'react';
import { fetchJournalById, deleteJournal, likeJournal, commentJournal, addSticker } from '../apiJournal';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Send, ArrowLeft } from 'lucide-react';
import useAuth from '../lib/useAuth';
import RainingStickers from '../components/RainingStickers';
import './JournalDetail.css';

const STICKER_OPTIONS = ['❤️', '👍', '🎉', '🔥', '💯', '✨'];

export default function JournalDetail() {
  const { id } = useParams();
  const [journal, setJournal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [showRain, setShowRain] = useState(false);
  const [showLikeNotice, setShowLikeNotice] = useState(false);
  const [showCommentNotice, setShowCommentNotice] = useState(false);
  const [showStickerNotice, setShowStickerNotice] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const loadJournal = async () => {
      try {
        const data = await fetchJournalById(id);
        setJournal(data.journal);
        setError(null);
      } catch (err) {
        console.error('fetch journal detail err', err);
        setError(err.message || 'Failed to load journal');
      } finally {
        setLoading(false);
      }
    };

    loadJournal();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  // Trigger rain animation on page load if there are stickers or likes
  useEffect(() => {
    if (journal && !loading) {
      const likesArray = Array.isArray(journal.likes) ? journal.likes : [];
      const commentsArray = Array.isArray(journal.comments) ? journal.comments : [];
      const stickersMap = journal.stickers 
        ? (journal.stickers instanceof Map 
            ? Object.fromEntries(journal.stickers) 
            : (typeof journal.stickers === 'object' ? journal.stickers : {}))
        : {};
      
      const hasEngagement = likesArray.length > 0 || commentsArray.length > 0 || Object.keys(stickersMap).length > 0;
      if (hasEngagement) {
        // Trigger animation after a short delay
        const timer = setTimeout(() => {
          setShowRain(true);
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [journal, loading]);

  const reloadJournal = async () => {
    try {
      const data = await fetchJournalById(id);
      setJournal(data.journal);
    } catch (err) {
      console.error('reload journal error', err);
    }
  };

  const handleLike = async () => {
    if (!user) {
      setShowLikeNotice(true);
      setTimeout(() => setShowLikeNotice(false), 2000);
      return;
    }
    try {
      await likeJournal(id);
      await reloadJournal();
    } catch (err) {
      console.error('like error', err);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!user) {
      setShowCommentNotice(true);
      setTimeout(() => setShowCommentNotice(false), 2000);
      return;
    }
    if (!commentText.trim()) return;

    try {
      setSubmittingComment(true);
      await commentJournal(id, commentText);
      setCommentText('');
      await reloadJournal();
    } catch (err) {
      console.error('comment error', err);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleSticker = async (sticker) => {
    if (!user) {
      setShowStickerNotice(true);
      setTimeout(() => setShowStickerNotice(false), 2000);
      return;
    }
    try {
      await addSticker(id, sticker);
      await reloadJournal();
    } catch (err) {
      console.error('sticker error', err);
    }
  };

  if (loading) {
    return (
      <div className="journal-detail-page">
        <div className="detail-container">
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <div className="spinner" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !journal) {
    return (
      <div className="journal-detail-page">
        <div className="detail-container">
          <div className="error-state">
            <h3>{error || 'Journal not found'}</h3>
            <Link to="/journal" className="back-link">
              <ArrowLeft size={18} />
              Back to Journals
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Safely handle likes array
  const likesArray = Array.isArray(journal.likes) ? journal.likes : [];
  const isLiked = user && likesArray.includes(user.id);
  const likesCount = likesArray.length;
  
  // Safely handle comments array
  const commentsArray = Array.isArray(journal.comments) ? journal.comments : [];
  const commentsCount = commentsArray.length;
  
  // Handle stickers - it might be a Map or plain object
  const stickersMap = journal.stickers 
    ? (journal.stickers instanceof Map 
        ? Object.fromEntries(journal.stickers) 
        : (typeof journal.stickers === 'object' ? journal.stickers : {}))
    : {};

  return (
    <div className="journal-detail-page">
      <RainingStickers 
        stickers={stickersMap} 
        likes={likesCount}
        trigger={showRain} 
      />
      
      <div className="detail-container">
        <Link to="/journal" className="back-link">
          <ArrowLeft size={18} />
          Back to Journals
        </Link>

        <article className="journal-article">
          <header className="article-header">
            <h1 className="article-title" style={{ color: journal.color }}>
              {journal.title}
            </h1>
            <div className="article-meta">
              <Link 
                to={`/journal/author/${journal.authorSupabaseId}`}
                className="author-name"
              >
                {journal.authorName || journal.authorEmail}
              </Link>
              <span className="separator">•</span>
              <time className="publish-date">
                {new Date(journal.publishedAt || journal.createdAt).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </time>
            </div>

            {user && user.id === journal.authorSupabaseId && (
              <div className="author-actions">
                <Link to={`/journal/edit/${journal._id}`} className="btn-edit">
                  Edit
                </Link>
                <button 
                  className="btn-delete"
                  onClick={async () => {
                    if (!window.confirm('Delete this journal? This action cannot be undone.')) return;
                    try {
                      await deleteJournal(journal._id);
                      navigate('/journal');
                    } catch (err) {
                      console.error('delete failed', err);
                    }
                  }}
                >
                  Delete
                </button>
              </div>
            )}
          </header>

          <div 
            className="article-content"
            style={{ fontFamily: journal.fontFamily }}
            dangerouslySetInnerHTML={{ __html: journal.bodyHtml }}
          />
        </article>

        {/* Engagement Section */}
        <div className="engagement-section">
          <div className="engagement-actions">
            <button 
              className={`engagement-btn like-btn ${isLiked ? 'liked' : ''} ${showLikeNotice ? 'login-notice' : ''}`}
              onClick={handleLike}
              title={user ? (isLiked ? 'Unlike' : 'Like') : 'Login to like'}
              disabled={showLikeNotice}
            >
              {showLikeNotice ? (
                <span>⚠️ Login First</span>
              ) : (
                <>
                  <Heart size={20} fill={isLiked ? 'currentColor' : 'none'} />
                  <span>{likesCount}</span>
                </>
              )}
            </button>

            <div className="engagement-btn comment-btn">
              <MessageCircle size={20} />
              <span>{commentsCount}</span>
            </div>
          </div>

          <div className="stickers-section">
            <h4>React with stickers</h4>
            <div className="stickers-grid">
              {STICKER_OPTIONS.map(sticker => (
                <button
                  key={sticker}
                  className={`sticker-btn ${showStickerNotice ? 'login-notice' : ''}`}
                  onClick={() => handleSticker(sticker)}
                  title={user ? 'Add sticker' : 'Login to add stickers'}
                  disabled={showStickerNotice}
                >
                  {showStickerNotice ? (
                    <span className="sticker-emoji">⚠️</span>
                  ) : (
                    <>
                      <span className="sticker-emoji">{sticker}</span>
                      {stickersMap[sticker] && (
                        <span className="sticker-count">{stickersMap[sticker]}</span>
                      )}
                    </>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="comments-section">
          <h3 className="comments-title">
            Comments ({commentsCount})
          </h3>

          {user && (
            <form className="comment-form" onSubmit={handleComment}>
              <textarea
                className="comment-input"
                placeholder="Write a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                rows={3}
                disabled={submittingComment}
              />
              <button 
                type="submit" 
                className={`comment-submit ${showCommentNotice ? 'login-notice' : ''}`}
                disabled={submittingComment || !commentText.trim() || showCommentNotice}
              >
                {showCommentNotice ? (
                  '⚠️ Login First'
                ) : (
                  <>
                    <Send size={18} />
                    {submittingComment ? 'Posting...' : 'Post Comment'}
                  </>
                )}
              </button>
            </form>
          )}

          {!user && (
            <div className="login-prompt">
              <Link to="/login">Login</Link> to leave a comment
            </div>
          )}

          <div className="comments-list">
            {commentsArray.length > 0 ? (
              commentsArray.map((comment, index) => (
                <div key={index} className="comment-item">
                  <div className="comment-header">
                    <span className="comment-author">{comment.userName || 'Anonymous'}</span>
                    <span className="comment-date">
                      {new Date(comment.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  <p className="comment-text">{comment.text}</p>
                </div>
              ))
            ) : (
              <p className="no-comments">No comments yet. Be the first to comment!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}