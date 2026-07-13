import { useEffect, useState, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Lock, Sparkles, Download, Trash2, Pin, PinOff } from 'lucide-react'
import { api, ApiError, type Movie, type Review } from '../lib/api'
import { useAuth } from '../lib/auth-context'
import VideoPlayer from '../components/VideoPlayer'
import { Button, Textarea, ErrorText } from '../components/ui'
import { StarsDisplay, StarsInput } from '../components/Stars'

export default function MovieDetail() {
	const { id } = useParams<{ id: string }>()
	const { user } = useAuth()

	const [movie, setMovie] = useState<Movie | null>(null)
	const [reviews, setReviews] = useState<Review[]>([])
	const [hasAccess, setHasAccess] = useState(false)
	const [resumeAt, setResumeAt] = useState(0)
	const [loading, setLoading] = useState(true)
	const [purchasing, setPurchasing] = useState(false)
	const [purchaseMsg, setPurchaseMsg] = useState('')
	const [purchaseErr, setPurchaseErr] = useState('')

	const load = useCallback(async () => {
		if (!id) return
		setLoading(true)
		try {
			const [movieRes, reviewsRes] = await Promise.all([api.movies.get(id), api.reviews.byMovie(id)])
			setMovie(movieRes.movie)
			setReviews(reviewsRes.items)

			if (user) {
				try {
					const access = await api.tickets.checkAccess(id)
					setHasAccess(access.hasAccess)
					if (access.hasAccess) {
						const progress = await api.progress.get(id)
						setResumeAt(progress.positionSeconds)
					}
				} catch {
					setHasAccess(false)
				}
			}
		} finally {
			setLoading(false)
		}
	}, [id, user])

	useEffect(() => {
		load()
	}, [load])

	const saveProgress = useCallback(
		(seconds: number) => {
			if (id) api.progress.save(id, seconds).catch(() => {})
		},
		[id],
	)

	async function onPurchase() {
		if (!id) return
		setPurchasing(true)
		setPurchaseErr('')
		setPurchaseMsg('')
		try {
			const res = await api.tickets.purchase(id)
			setPurchaseMsg(
				res.tierUpgraded
					? "Chipta sotib olindi! Tabriklaymiz — endi siz Sodiq mijoz (10% chegirma)"
					: 'Chipta muvaffaqiyatli sotib olindi'
			)
			setHasAccess(true)
		} catch (err) {
			setPurchaseErr(err instanceof ApiError ? err.message : 'Xatolik yuz berdi')
		} finally {
			setPurchasing(false)
		}
	}

	if (loading) {
		return <div className="mx-auto max-w-6xl px-5 py-20 text-center text-muted">Yuklanmoqda...</div>
	}

	if (!movie) {
		return <div className="mx-auto max-w-6xl px-5 py-20 text-center text-muted">Kino topilmadi.</div>
	}

	return (
		<div className="mx-auto max-w-5xl px-5 py-10">
			<div className="grid md:grid-cols-[280px_1fr] gap-8">
				<div className="aspect-[2/3] rounded-xl overflow-hidden bg-curtain border border-border shrink-0">
					{movie.poster_url && <img src={movie.poster_url} alt={movie.title} className="w-full h-full object-cover" />}
				</div>

				<div>
					{movie.is_premiere && (
						<div className="inline-flex items-center gap-1.5 rounded-full bg-velvet/90 px-2.5 py-1 text-[11px] font-medium text-paper mb-3">
							<Sparkles className="w-3 h-3" />
							Premyera
						</div>
					)}
					<h1 className="font-display text-3xl text-paper mb-3">{movie.title}</h1>
					{movie.description && <p className="text-muted leading-relaxed mb-6">{movie.description}</p>}

					{/* Access area */}
					{!user ? (
						<div className="ticket-stub p-5 flex items-center justify-between gap-4">
							<p className="text-sm text-muted">Tomosha qilish uchun tizimga kiring</p>
							<Link to="/login">
								<Button variant="primary">Kirish</Button>
							</Link>
						</div>
					) : hasAccess ? null : movie.is_premiere ? (
						<div className="ticket-stub p-5">
							<div className="flex items-center gap-2 mb-3 text-muted text-sm">
								<Lock className="w-4 h-4" />
								Bu premyera — tomosha qilish uchun abadiy chipta kerak
							</div>
							<div className="flex items-center gap-4">
								<Button onClick={onPurchase} loading={purchasing}>
									{movie.price != null ? `${Number(movie.price).toLocaleString('uz-UZ')} so'mga chipta olish` : 'Chipta olish'}
								</Button>
								{(user.tier ?? 1) >= 2 && <span className="font-mono text-xs text-gold">Sizga 10% chegirma qo'llanadi</span>}
							</div>
							<ErrorText>{purchaseErr}</ErrorText>
							{purchaseMsg && <p className="mt-2 text-sm text-gold">{purchaseMsg}</p>}
						</div>
					) : (
						<div className="ticket-stub p-5 flex items-center justify-between gap-4">
							<p className="text-sm text-muted">Bu kinoni ko'rish uchun faol obuna kerak</p>
							<Link to="/subscription">
								<Button variant="secondary">Obunani ko'rish</Button>
							</Link>
						</div>
					)}
				</div>
			</div>

			{/* Player */}
			{hasAccess && movie.video_url && (
				<div className="mt-8">
					<VideoPlayer src={movie.video_url} startAt={resumeAt} onProgress={saveProgress} />
					{movie.is_premiere && (
						<p className="mt-2 flex items-center gap-1.5 text-xs text-muted-dim">
							<Download className="w-3.5 h-3.5" />
							{movie.download_unlocked_at
								? `Yuklab olish ${new Date(movie.download_unlocked_at).toLocaleDateString('uz-UZ')} sanasida ochiladi`
								: 'Yuklab olish hozircha yopiq'}
						</p>
					)}
				</div>
			)}

			{/* Reviews */}
			<div className="mt-14">
				<h2 className="font-display text-xl text-paper mb-5">Sharhlar</h2>
				{user && <ReviewForm movieId={id!} onCreated={load} />}
				<div className="mt-6 space-y-4">
					{reviews.length === 0 ? (
						<p className="text-sm text-muted-dim">Hali sharhlar yo'q — birinchi bo'ling.</p>
					) : (
						reviews.map((r) => <ReviewItem key={r.id} review={r} isAdmin={!!user?.isAdmin} onChanged={load} />)
					)}
				</div>
			</div>
		</div>
	)
}

function ReviewForm({ movieId, onCreated }: { movieId: string; onCreated: () => void }) {
	const [rating, setRating] = useState(5)
	const [comment, setComment] = useState('')
	const [error, setError] = useState('')
	const [loading, setLoading] = useState(false)

	async function onSubmit(e: React.FormEvent) {
		e.preventDefault()
		setError('')
		setLoading(true)
		try {
			await api.reviews.create({ movieId, rating, comment })
			setComment('')
			onCreated()
		} catch (err) {
			setError(err instanceof ApiError ? err.message : 'Xatolik yuz berdi')
		} finally {
			setLoading(false)
		}
	}

	return (
		<form onSubmit={onSubmit} className="ticket-stub p-5">
			<StarsInput value={rating} onChange={setRating} />
			<Textarea
				value={comment}
				onChange={(e) => setComment(e.target.value)}
				required
				rows={3}
				placeholder="Fikringizni yozing..."
				className="mt-3"
			/>
			<ErrorText>{error}</ErrorText>
			<Button type="submit" loading={loading} className="mt-3">
				Sharh qoldirish
			</Button>
		</form>
	)
}

function ReviewItem({ review, isAdmin, onChanged }: { review: Review; isAdmin: boolean; onChanged: () => void }) {
	async function togglePin() {
		if (review.is_pinned) await api.reviews.unpin(review.id)
		else await api.reviews.pin(review.id)
		onChanged()
	}

	async function remove() {
		await api.reviews.remove(review.id)
		onChanged()
	}

	return (
		<div className={`rounded-lg border p-4 ${review.is_pinned ? 'border-gold-dim/50 bg-gold/5' : 'border-border bg-curtain'}`}>
			<div className="flex items-center justify-between mb-1.5">
				<div className="flex items-center gap-2">
					<span className="text-sm font-medium text-paper">{review.user_name}</span>
					{review.user_tier === 3 && <span className="font-mono text-[10px] text-gold border border-gold-dim/40 rounded px-1.5 py-0.5">VIP</span>}
					{review.is_pinned && <Pin className="w-3 h-3 text-gold" />}
				</div>
				<StarsDisplay value={review.rating} />
			</div>
			<p className="text-sm text-muted leading-relaxed">{review.comment}</p>
			{isAdmin && (
				<div className="mt-2 flex items-center gap-3">
					<button onClick={togglePin} className="flex items-center gap-1 text-xs text-muted hover:text-gold transition-colors">
						{review.is_pinned ? <PinOff className="w-3 h-3" /> : <Pin className="w-3 h-3" />}
						{review.is_pinned ? 'Unpin' : 'Pin'}
					</button>
					<button onClick={remove} className="flex items-center gap-1 text-xs text-muted hover:text-velvet-light transition-colors">
						<Trash2 className="w-3 h-3" />
						O'chirish
					</button>
				</div>
			)}
		</div>
	)
}
