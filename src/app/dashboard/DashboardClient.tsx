'use client'

import { useState } from 'react'

export default function DashboardClient({ tweets }: { tweets: any[] }) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')
  const [toast, setToast] = useState<{ type: 'success' | 'error', message: string } | null>(null)

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 4000)
  }

  const handleEdit = (draftId: string, currentText: string) => {
    setEditingId(draftId)
    setEditText(currentText)
  }

  const handleSaveEdit = async (draftId: string) => {
    const res = await fetch('/api/drafts/edit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ draftId, newText: editText }),
    })
    if (res.ok) {
      showToast('success', 'Draft saved')
      setEditingId(null)
      window.location.reload()
    } else {
      showToast('error', 'Failed to save draft')
    }
  }

  const handleDiscard = async (draftId: string) => {
    const res = await fetch('/api/drafts/discard', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ draftId }),
    })
    if (res.ok) {
      showToast('success', 'Draft discarded')
      window.location.reload()
    } else {
      showToast('error', 'Failed to discard draft')
    }
  }

  const handlePost = async (draftId: string, tweetId: string, draftText: string) => {
    const res = await fetch('/api/tweets/post', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ draftId, tweetId, draftText }),
    })
    if (res.ok) {
      showToast('success', 'Posted to X!')
      window.location.reload()
    } else {
      showToast('error', 'Failed to post to X')
    }
  }

  const pendingTweets = tweets.filter(t => t.drafts?.some((d: any) => d.status === 'Pending'))

  const personaColors: Record<string, string> = {
    'Value-Adder': '#22c55e',
    'Challenger': '#f59e0b',
    'Wit': '#a855f7',
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0a', color: '#fff', fontFamily: 'sans-serif' }}>
      {toast && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 1000,
          backgroundColor: toast.type === 'success' ? '#22c55e' : '#ef4444',
          color: '#fff', padding: '12px 20px', borderRadius: 8, fontWeight: 600
        }}>
          {toast.message}
        </div>
      )}

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 20px' }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>EchoX Dashboard</h1>
        <p style={{ color: '#888', marginBottom: 40 }}>{pendingTweets.length} tweets with pending drafts</p>

        {pendingTweets.length === 0 && (
          <div style={{ textAlign: 'center', color: '#555', marginTop: 80 }}>
            <p style={{ fontSize: 18 }}>No pending drafts yet.</p>
            <p style={{ fontSize: 14, marginTop: 8 }}>The cron job will populate this feed every 40 minutes.</p>
          </div>
        )}

        {pendingTweets.map((tweet: any) => (
          <div key={tweet.id} style={{
            backgroundColor: '#111', border: '1px solid #222',
            borderRadius: 12, padding: 24, marginBottom: 24
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <div>
                <span style={{ fontWeight: 600 }}>@{tweet.author_username}</span>
                <span style={{ color: '#555', marginLeft: 8, fontSize: 13 }}>{tweet.niche_name}</span>
              </div>
              <div style={{ display: 'flex', gap: 16, fontSize: 13, color: '#555' }}>
                <span>❤️ {tweet.like_count}</span>
                <span>💬 {tweet.reply_count}</span>
                <span>👁️ {tweet.view_count}</span>
              </div>
            </div>

            <p style={{ color: '#ccc', marginBottom: 20, lineHeight: 1.6 }}>{tweet.content}</p>

            {tweet.tweet_url && (
              <a href={tweet.tweet_url} target="_blank" rel="noopener noreferrer"
                style={{ fontSize: 12, color: '#1d9bf0', marginBottom: 20, display: 'block' }}>
                View on X →
              </a>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {tweet.drafts?.filter((d: any) => d.status === 'Pending').map((draft: any) => (
                <div key={draft.id} style={{
                  backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a',
                  borderRadius: 8, padding: 16
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{
                      fontSize: 12, fontWeight: 600, color: personaColors[draft.persona_type],
                      backgroundColor: personaColors[draft.persona_type] + '20',
                      padding: '2px 8px', borderRadius: 4
                    }}>
                      {draft.persona_type}
                    </span>
                    <span style={{ fontSize: 12, color: '#555' }}>{draft.draft_text.length}/240</span>
                  </div>

                  {editingId === draft.id ? (
                    <div>
                      <textarea
                        value={editText}
                        onChange={e => setEditText(e.target.value)}
                        maxLength={240}
                        style={{
                          width: '100%', backgroundColor: '#222', color: '#fff',
                          border: '1px solid #444', borderRadius: 6, padding: 10,
                          fontSize: 14, resize: 'vertical', minHeight: 80
                        }}
                      />
                      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                        <button onClick={() => handleSaveEdit(draft.id)} style={{
                          backgroundColor: '#22c55e', color: '#fff', border: 'none',
                          borderRadius: 6, padding: '6px 14px', cursor: 'pointer', fontSize: 13
                        }}>Save</button>
                        <button onClick={() => setEditingId(null)} style={{
                          backgroundColor: '#333', color: '#fff', border: 'none',
                          borderRadius: 6, padding: '6px 14px', cursor: 'pointer', fontSize: 13
                        }}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p style={{ color: '#ddd', fontSize: 14, lineHeight: 1.6, marginBottom: 12 }}>
                        {draft.draft_text}
                      </p>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => handleEdit(draft.id, draft.draft_text)} style={{
                          backgroundColor: '#222', color: '#fff', border: '1px solid #444',
                          borderRadius: 6, padding: '6px 14px', cursor: 'pointer', fontSize: 13
                        }}>Edit</button>
                        <button onClick={() => handlePost(draft.id, tweet.tweet_id, draft.draft_text)} style={{
                          backgroundColor: '#1d9bf0', color: '#fff', border: 'none',
                          borderRadius: 6, padding: '6px 14px', cursor: 'pointer', fontSize: 13
                        }}>Post to X</button>
                        <button onClick={() => handleDiscard(draft.id)} style={{
                          backgroundColor: '#222', color: '#ef4444', border: '1px solid #ef4444',
                          borderRadius: 6, padding: '6px 14px', cursor: 'pointer', fontSize: 13
                        }}>Discard</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
