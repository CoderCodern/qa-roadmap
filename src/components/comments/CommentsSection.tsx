'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { MessageSquare, Trash2, CornerDownRight, ChevronDown } from 'lucide-react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface CommentAuthor {
  id: string
  name: string | null
  image: string | null
}

interface CommentEntry {
  id: string
  dayId: number
  parentId: string | null
  body: string
  status: string
  createdAt: string
  author: CommentAuthor
  replyCount: number
}

interface CommentPage {
  comments: CommentEntry[]
  nextOffset: number | null
}

interface CommentsSectionProps {
  dayId: number
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 30) return `${days}d ago`
  return new Date(iso).toLocaleDateString()
}

function Avatar({ author }: { author: CommentAuthor }) {
  if (author.image) {
    return (
      <div className="relative h-7 w-7 shrink-0 overflow-hidden rounded-full">
        <Image
          src={author.image}
          alt={author.name ?? 'User'}
          fill
          className="object-cover"
          sizes="28px"
        />
      </div>
    )
  }
  const initial = (author.name ?? '?')[0].toUpperCase()
  return (
    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
      {initial}
    </div>
  )
}

interface CommentItemProps {
  comment: CommentEntry
  currentUserId?: string
  isAdmin: boolean
  dayId: number
  onDeleted: (id: string) => void
}

function CommentItem({ comment, currentUserId, isAdmin, dayId, onDeleted }: CommentItemProps) {
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [showReplies, setShowReplies] = useState(false)
  const [replies, setReplies] = useState<CommentEntry[]>([])
  const [loadingReplies, setLoadingReplies] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [posting, setPosting] = useState(false)
  const [replyCount, setReplyCount] = useState(comment.replyCount)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const canDelete = currentUserId === comment.author.id || isAdmin

  const loadReplies = async () => {
    if (loadingReplies) return
    setLoadingReplies(true)
    try {
      const res = await fetch(`/api/v1/lessons/${dayId}/comments?parentId=${comment.id}`)
      if (res.ok) {
        const data: CommentPage = await res.json()
        setReplies(data.comments)
      }
    } finally {
      setLoadingReplies(false)
    }
  }

  const toggleReplies = async () => {
    if (!showReplies && replies.length === 0) await loadReplies()
    setShowReplies((v) => !v)
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const res = await fetch(`/api/v1/comments/${comment.id}`, { method: 'DELETE' })
      if (res.ok) onDeleted(comment.id)
    } finally {
      setDeleting(false)
      setConfirmDelete(false)
    }
  }

  const handleDeleteReply = (id: string) => {
    setReplies((prev) => prev.filter((r) => r.id !== id))
    setReplyCount((c) => Math.max(0, c - 1))
  }

  const submitReply = async () => {
    if (!replyText.trim() || posting) return
    setPosting(true)
    try {
      const res = await fetch(`/api/v1/lessons/${dayId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: replyText, parentId: comment.id }),
      })
      if (res.ok) {
        const newReply: CommentEntry = await res.json()
        setReplies((prev) => [...prev, newReply])
        setReplyCount((c) => c + 1)
        setReplyText('')
        setShowReplyForm(false)
        setShowReplies(true)
      }
    } finally {
      setPosting(false)
    }
  }

  return (
    <div className="flex gap-3">
      <Avatar author={comment.author} />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {comment.author.name ?? 'Anonymous'}
          </span>
          <span className="text-xs text-gray-400">{timeAgo(comment.createdAt)}</span>
        </div>
        <p className="mt-0.5 text-sm leading-relaxed text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words">
          {comment.body}
        </p>

        {/* Actions */}
        {confirmDelete ? (
          <div className="mt-1.5 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 dark:border-red-900/50 dark:bg-red-950/30">
            <span className="flex-1 text-xs text-red-600 dark:text-red-400">
              <span className="lang-en">Delete this comment?</span>
              <span className="lang-vi">Xóa bình luận này?</span>
            </span>
            <button
              onClick={() => setConfirmDelete(false)}
              className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <span className="lang-en">Cancel</span>
              <span className="lang-vi">Hủy</span>
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="rounded-md bg-red-500 px-2 py-0.5 text-xs font-semibold text-white hover:bg-red-600 disabled:opacity-50 transition-colors"
            >
              <span className="lang-en">{deleting ? 'Deleting…' : 'Delete'}</span>
              <span className="lang-vi">{deleting ? 'Đang xóa…' : 'Xóa'}</span>
            </button>
          </div>
        ) : (
          <div className="mt-1.5 flex items-center gap-3">
            {currentUserId && (
              <button
                onClick={() => setShowReplyForm((v) => !v)}
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
              >
                <CornerDownRight className="h-3 w-3" />
                <span className="lang-en">Reply</span>
                <span className="lang-vi">Trả lời</span>
              </button>
            )}
            {replyCount > 0 && (
              <button
                onClick={toggleReplies}
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <ChevronDown className={cn('h-3 w-3 transition-transform', showReplies && 'rotate-180')} />
                <span>{replyCount} {replyCount === 1 ? 'reply' : 'replies'}</span>
              </button>
            )}
            {canDelete && (
              <button
                onClick={() => setConfirmDelete(true)}
                className="ml-auto flex items-center gap-1 text-xs text-gray-300 hover:text-red-500 dark:text-gray-600 dark:hover:text-red-400 transition-colors"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            )}
          </div>
        )}

        {/* Reply form */}
        {showReplyForm && (
          <div className="mt-2 flex gap-2">
            <textarea
              autoFocus
              value={replyText}
              onChange={(e) => setReplyText(e.target.value.slice(0, 2000))}
              placeholder="Write a reply…"
              rows={2}
              className="flex-1 resize-none rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-400 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
            />
            <div className="flex flex-col gap-1">
              <button
                onClick={submitReply}
                disabled={posting || !replyText.trim()}
                className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700 disabled:opacity-50 transition-colors"
              >
                <span className="lang-en">Post</span>
                <span className="lang-vi">Gửi</span>
              </button>
              <button
                onClick={() => { setShowReplyForm(false); setReplyText('') }}
                className="rounded-lg px-3 py-1.5 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <span className="lang-en">Cancel</span>
                <span className="lang-vi">Hủy</span>
              </button>
            </div>
          </div>
        )}

        {/* Replies */}
        {showReplies && (
          <div className="mt-3 space-y-3 border-l-2 border-gray-100 pl-4 dark:border-gray-800">
            {loadingReplies && (
              <p className="text-xs text-gray-400">
                <span className="lang-en">Loading…</span>
                <span className="lang-vi">Đang tải…</span>
              </p>
            )}
            {replies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                currentUserId={currentUserId}
                isAdmin={isAdmin}
                dayId={dayId}
                onDeleted={handleDeleteReply}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export function CommentsSection({ dayId }: CommentsSectionProps) {
  const { data: session } = useSession()
  const [page, setPage] = useState<CommentPage | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [posting, setPosting] = useState(false)

  const isAdmin = session?.user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL

  const fetchComments = useCallback(async () => {
    try {
      const res = await fetch(`/api/v1/lessons/${dayId}/comments`)
      if (res.ok) setPage(await res.json())
    } finally {
      setLoading(false)
    }
  }, [dayId])

  useEffect(() => {
    fetchComments()
  }, [fetchComments])

  const loadMore = async () => {
    if (!page?.nextOffset || loadingMore) return
    setLoadingMore(true)
    try {
      const res = await fetch(`/api/v1/lessons/${dayId}/comments?offset=${page.nextOffset}`)
      if (res.ok) {
        const next: CommentPage = await res.json()
        setPage((prev) => prev ? {
          comments: [...prev.comments, ...next.comments],
          nextOffset: next.nextOffset,
        } : next)
      }
    } finally {
      setLoadingMore(false)
    }
  }

  const handlePost = async () => {
    if (!commentText.trim() || posting) return
    setPosting(true)
    try {
      const res = await fetch(`/api/v1/lessons/${dayId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: commentText }),
      })
      if (res.ok) {
        const newComment: CommentEntry = await res.json()
        setPage((prev) => prev ? {
          ...prev,
          comments: [newComment, ...prev.comments],
        } : { comments: [newComment], nextOffset: null })
        setCommentText('')
      }
    } finally {
      setPosting(false)
    }
  }

  const handleDeleted = (id: string) => {
    setPage((prev) => prev ? {
      ...prev,
      comments: prev.comments.filter((c) => c.id !== id),
    } : prev)
  }

  const count = page?.comments.length ?? 0

  return (
    <section className="mt-12 border-t border-gray-200 pt-8 dark:border-gray-800">
      <h2 className="mb-6 flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-gray-100">
        <MessageSquare className="h-5 w-5 text-brand-500" />
        <span className="lang-en">Discussion {count > 0 ? `(${count})` : ''}</span>
        <span className="lang-vi">Thảo luận {count > 0 ? `(${count})` : ''}</span>
      </h2>

      {/* Comment form */}
      {session?.user ? (
        <div className="mb-6 flex gap-3">
          <Avatar author={{
            id: (session.user as { id?: string }).id ?? '',
            name: session.user.name ?? null,
            image: session.user.image ?? null,
          }} />
          <div className="flex-1">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value.slice(0, 2000))}
              placeholder="Share a thought about this lesson…"
              rows={3}
              className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-400 focus:outline-none dark:border-gray-700 dark:bg-gray-800/60 dark:text-gray-200"
            />
            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs text-gray-400">{commentText.length}/2000</span>
              <button
                onClick={handlePost}
                disabled={posting || !commentText.trim()}
                className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50 transition-colors"
              >
                <span className="lang-en">{posting ? 'Posting…' : 'Post comment'}</span>
                <span className="lang-vi">{posting ? 'Đang đăng…' : 'Đăng bình luận'}</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-6 rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-5 text-center text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-900/40 dark:text-gray-400">
          <span className="lang-en">Sign in to join the discussion</span>
          <span className="lang-vi">Đăng nhập để tham gia thảo luận</span>
        </div>
      )}

      {/* Comment list */}
      {loading ? (
        <p className="text-sm text-gray-400">
          <span className="lang-en">Loading comments…</span>
          <span className="lang-vi">Đang tải bình luận…</span>
        </p>
      ) : count === 0 ? (
        <p className="text-sm text-gray-400">
          <span className="lang-en">No comments yet. Be the first!</span>
          <span className="lang-vi">Chưa có bình luận nào. Hãy là người đầu tiên!</span>
        </p>
      ) : (
        <div className="space-y-6">
          {page!.comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              currentUserId={(session?.user as { id?: string } | undefined)?.id}
              isAdmin={isAdmin}
              dayId={dayId}
              onDeleted={handleDeleted}
            />
          ))}
          {page?.nextOffset !== null && (
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="w-full rounded-xl border border-gray-200 py-2 text-sm text-gray-500 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:hover:bg-gray-800 transition-colors"
            >
              <span className="lang-en">{loadingMore ? 'Loading…' : 'Load more comments'}</span>
              <span className="lang-vi">{loadingMore ? 'Đang tải…' : 'Xem thêm bình luận'}</span>
            </button>
          )}
        </div>
      )}
    </section>
  )
}
