import { useEffect, useRef } from 'react'
import Hls from 'hls.js'

interface VideoPlayerProps {
	src: string
	startAt?: number
	onProgress?: (seconds: number) => void
}

export default function VideoPlayer({ src, startAt = 0, onProgress }: VideoPlayerProps) {
	const videoRef = useRef<HTMLVideoElement>(null)
	const hlsRef = useRef<Hls | null>(null)

	useEffect(() => {
		const video = videoRef.current
		if (!video) return

		const isHls = src.endsWith('.m3u8')

		if (isHls && Hls.isSupported()) {
			const hls = new Hls()
			hls.loadSource(src)
			hls.attachMedia(video)
			hlsRef.current = hls
		} else {
			// Safari native HLS qo'llab-quvvatlaydi, yoki oddiy mp4 fayl
			video.src = src
		}

		function onLoadedMetadata() {
			if (video && startAt > 0 && startAt < video.duration) {
				video.currentTime = startAt
			}
		}
		video.addEventListener('loadedmetadata', onLoadedMetadata)

		return () => {
			video.removeEventListener('loadedmetadata', onLoadedMetadata)
			hlsRef.current?.destroy()
			hlsRef.current = null
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [src])

	useEffect(() => {
		const video = videoRef.current
		if (!video || !onProgress) return

		// Har 8 soniyada backend'ga pozitsiyani yozamiz (backend Redis'ga yozadi,
		// har 1 daqiqada Postgres'ga flush qiladi — shu yerda tez-tez chaqirsak ham arzon).
		const interval = setInterval(() => {
			if (!video.paused) onProgress(Math.floor(video.currentTime))
		}, 8000)

		return () => clearInterval(interval)
	}, [onProgress])

	return (
		<video
			ref={videoRef}
			controls
			className="w-full aspect-video rounded-xl bg-black"
			playsInline
		/>
	)
}
