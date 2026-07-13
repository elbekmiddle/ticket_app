import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { UploadCloud, Check } from 'lucide-react'
import { api, ApiError, uploadFileToPresignedUrl } from '../../lib/api'
import { Field, Input, Textarea, Button, ErrorText } from '../../components/ui'

export default function AdminMovieForm() {
	const { id } = useParams<{ id: string }>()
	const isNew = !id || id === 'new'
	const navigate = useNavigate()

	const [title, setTitle] = useState('')
	const [description, setDescription] = useState('')
	const [isPremiere, setIsPremiere] = useState(false)
	const [premiereDate, setPremiereDate] = useState('')
	const [price, setPrice] = useState('')
	const [posterUrl, setPosterUrl] = useState('')
	const [videoUrl, setVideoUrl] = useState('')
	const [downloadUnlockAt, setDownloadUnlockAt] = useState('')
	const [downloadUnlockMonths, setDownloadUnlockMonths] = useState('')

	const [uploadingPoster, setUploadingPoster] = useState(false)
	const [uploadingVideo, setUploadingVideo] = useState(false)
	const [error, setError] = useState('')
	const [loading, setLoading] = useState(false)

	useEffect(() => {
		if (isNew || !id) return
		api.movies.get(id).then(({ movie }) => {
			setTitle(movie.title)
			setDescription(movie.description || '')
			setIsPremiere(movie.is_premiere)
			setPremiereDate(movie.premiere_date ? movie.premiere_date.slice(0, 16) : '')
			setPrice(movie.price != null ? String(movie.price) : '')
			setPosterUrl(movie.poster_url || '')
			setVideoUrl(movie.video_url || '')
		})
	}, [id, isNew])

	async function handleUpload(file: File, type: 'video' | 'poster') {
		const setUploading = type === 'video' ? setUploadingVideo : setUploadingPoster
		setUploading(true)
		setError('')
		try {
			const { uploadUrl, cdnUrl } = await api.media.getUploadUrl({
				type,
				fileName: file.name,
				contentType: file.type,
			})
			await uploadFileToPresignedUrl(uploadUrl, file)
			if (type === 'video') setVideoUrl(cdnUrl)
			else setPosterUrl(cdnUrl)
		} catch (err) {
			setError(err instanceof ApiError ? err.message : "Yuklashda xatolik — AWS sozlanganini tekshiring")
		} finally {
			setUploading(false)
		}
	}

	async function onSubmit(e: React.FormEvent) {
		e.preventDefault()
		setError('')
		setLoading(true)

		const payload: Record<string, unknown> = {
			title,
			description: description || undefined,
			isPremiere,
			premiereDate: premiereDate ? new Date(premiereDate).toISOString() : undefined,
			price: price ? Number(price) : undefined,
			posterUrl: posterUrl || undefined,
			videoUrl: videoUrl || undefined,
			downloadUnlockAt: downloadUnlockAt ? new Date(downloadUnlockAt).toISOString() : undefined,
			downloadUnlockMonths: downloadUnlockMonths ? Number(downloadUnlockMonths) : undefined,
		}

		try {
			if (isNew) {
				await api.movies.create(payload)
			} else if (id) {
				await api.movies.update(id, payload)
			}
			navigate('/admin/movies')
		} catch (err) {
			setError(err instanceof ApiError ? err.message : 'Xatolik yuz berdi')
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className="p-8 max-w-2xl">
			<h1 className="font-display text-3xl text-paper mb-8">{isNew ? 'Yangi kino' : 'Kinoni tahrirlash'}</h1>

			<form onSubmit={onSubmit} className="space-y-5">
				<Field label="Nomi">
					<Input value={title} onChange={(e) => setTitle(e.target.value)} required />
				</Field>

				<Field label="Tavsif">
					<Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
				</Field>

				<label className="flex items-center gap-2.5 text-sm text-paper">
					<input
						type="checkbox"
						checked={isPremiere}
						onChange={(e) => setIsPremiere(e.target.checked)}
						className="w-4 h-4 accent-gold"
					/>
					Premyera (Pay-Per-View)
				</label>

				{isPremiere && (
					<>
						<Field label="Premyera sanasi">
							<Input type="datetime-local" value={premiereDate} onChange={(e) => setPremiereDate(e.target.value)} />
						</Field>
						<Field label="Narxi (so'm)">
							<Input type="number" min={0} value={price} onChange={(e) => setPrice(e.target.value)} required />
						</Field>

						<div className="grid grid-cols-2 gap-4">
							<Field label="Yuklab olish — aniq sana (ixtiyoriy, ustunlik shu)">
								<Input type="datetime-local" value={downloadUnlockAt} onChange={(e) => setDownloadUnlockAt(e.target.value)} />
							</Field>
							<Field label="...yoki N oydan keyin (premyeradan)">
								<Input type="number" min={1} max={24} value={downloadUnlockMonths} onChange={(e) => setDownloadUnlockMonths(e.target.value)} />
							</Field>
						</div>
					</>
				)}

				<MediaUploadField
					label="Poster"
					url={posterUrl}
					accept="image/*"
					uploading={uploadingPoster}
					onFile={(f) => handleUpload(f, 'poster')}
				/>

				<MediaUploadField
					label="Video fayl"
					url={videoUrl}
					accept="video/*"
					uploading={uploadingVideo}
					onFile={(f) => handleUpload(f, 'video')}
				/>

				<ErrorText>{error}</ErrorText>

				<div className="flex items-center gap-3 pt-2">
					<Button type="submit" loading={loading}>
						{isNew ? 'Yaratish' : 'Saqlash'}
					</Button>
					<Button type="button" variant="ghost" onClick={() => navigate('/admin/movies')}>
						Bekor qilish
					</Button>
				</div>
			</form>
		</div>
	)
}

function MediaUploadField({
	label,
	url,
	accept,
	uploading,
	onFile,
}: {
	label: string
	url: string
	accept: string
	uploading: boolean
	onFile: (file: File) => void
}) {
	return (
		<Field label={label}>
			<label className="flex items-center gap-3 rounded-lg border border-dashed border-border bg-curtain px-4 py-3 cursor-pointer hover:border-gold-dim transition-colors">
				<input
					type="file"
					accept={accept}
					className="hidden"
					onChange={(e) => {
						const file = e.target.files?.[0]
						if (file) onFile(file)
					}}
				/>
				{uploading ? (
					<span className="w-4 h-4 rounded-full border-2 border-gold border-t-transparent animate-spin" />
				) : url ? (
					<Check className="w-4 h-4 text-gold shrink-0" />
				) : (
					<UploadCloud className="w-4 h-4 text-muted-dim shrink-0" />
				)}
				<span className="text-sm text-muted truncate">
					{uploading ? 'Yuklanmoqda...' : url ? url : 'Fayl tanlash uchun bosing'}
				</span>
			</label>
		</Field>
	)
}
