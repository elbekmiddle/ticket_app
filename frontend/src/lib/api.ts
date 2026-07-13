const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1'

// ---- Token storage ----
// Sodda yondashuv: ikkala token ham localStorage'da. Production uchun access
// tokenni xotirada (React state), refresh tokenni httpOnly cookie'da saqlash
// ancha xavfsizroq bo'lardi — lekin backend hozircha ikkalasini ham JSON body'da
// qaytaradi (cookie emas), shuning uchun bu yerda soddalik tanlandi.
const ACCESS_KEY = 'ott_access_token'
const REFRESH_KEY = 'ott_refresh_token'

export const tokenStore = {
	getAccess: () => localStorage.getItem(ACCESS_KEY),
	getRefresh: () => localStorage.getItem(REFRESH_KEY),
	set: (access: string, refresh: string) => {
		localStorage.setItem(ACCESS_KEY, access)
		localStorage.setItem(REFRESH_KEY, refresh)
	},
	clear: () => {
		localStorage.removeItem(ACCESS_KEY)
		localStorage.removeItem(REFRESH_KEY)
	},
}

export class ApiError extends Error {
	status: number
	constructor(status: number, message: string) {
		super(message)
		this.status = status
	}
}

let refreshPromise: Promise<boolean> | null = null

async function tryRefresh(): Promise<boolean> {
	const refreshToken = tokenStore.getRefresh()
	if (!refreshToken) return false

	// Bir vaqtda bir nechta so'rov 401 olsa, refresh faqat BIR marta chaqirilsin —
	// aks holda parallel so'rovlar bir-birining refresh tokenini "eskirtirib" qo'yishi mumkin.
	if (!refreshPromise) {
		refreshPromise = fetch(`${API_URL}/auth/refresh`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ refreshToken }),
		})
			.then(async (res) => {
				if (!res.ok) return false
				const data = await res.json()
				tokenStore.set(data.accessToken, data.refreshToken)
				return true
			})
			.catch(() => false)
			.finally(() => {
				refreshPromise = null
			})
	}

	return refreshPromise
}

interface RequestOptions {
	method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
	body?: unknown
	auth?: boolean
	query?: Record<string, string | number | boolean | undefined>
}

async function request<T>(path: string, options: RequestOptions = {}, isRetry = false): Promise<T> {
	const { method = 'GET', body, auth = true, query } = options

	let url = `${API_URL}${path}`
	if (query) {
		const params = new URLSearchParams()
		for (const [key, value] of Object.entries(query)) {
			if (value !== undefined) params.set(key, String(value))
		}
		const qs = params.toString()
		if (qs) url += `?${qs}`
	}

	const headers: Record<string, string> = { 'Content-Type': 'application/json' }
	if (auth) {
		const token = tokenStore.getAccess()
		if (token) headers.Authorization = `Bearer ${token}`
	}

	const res = await fetch(url, {
		method,
		headers,
		body: body ? JSON.stringify(body) : undefined,
	})

	if (res.status === 401 && auth && !isRetry) {
		const refreshed = await tryRefresh()
		if (refreshed) {
			return request<T>(path, options, true)
		}
		tokenStore.clear()
		window.dispatchEvent(new CustomEvent('ott:unauthorized'))
	}

	const data = await res.json().catch(() => null)

	if (!res.ok) {
		const message = data?.message || data?.error || `Xatolik (${res.status})`
		throw new ApiError(res.status, Array.isArray(message) ? message[0] : message)
	}

	return data as T
}

// ---- Types ----
export interface User {
	id: string
	name: string
	email: string
	is_verified?: boolean
	isVerified?: boolean
	tier: number
	tierLabel?: string
	is_admin?: boolean
	isAdmin?: boolean
	created_at?: string
}

export interface Movie {
	id: string
	title: string
	description?: string | null
	is_premiere: boolean
	premiere_date?: string | null
	price?: number | null
	poster_url?: string | null
	video_url?: string | null
	download_unlocked_at?: string | null
	created_at?: string
}

export interface Review {
	id: string
	rating: number
	comment: string
	is_pinned: boolean
	created_at: string
	user_id: string
	user_name: string
	user_tier: number
}

export interface Paginated<T> {
	items: T[]
	total: number
	page: number
	limit: number
}

// ---- API surface ----
export const api = {
	auth: {
		register: (data: { name: string; email: string; password: string }) =>
			request<{ success: boolean; emailSent: boolean; verificationToken: string; user: User }>('/auth/register', { method: 'POST', body: data, auth: false }),
		login: (data: { email: string; password: string }) =>
			request<{ success: boolean; accessToken: string; refreshToken: string; user: User }>('/auth/login', { method: 'POST', body: data, auth: false }),
		verifyEmail: (data: { verificationToken: string; otp: string }) =>
			request<{ success: boolean; accessToken: string; refreshToken: string; user: User }>('/auth/verify-email', { method: 'POST', body: data, auth: false }),
		resendOtp: (data: { email: string }) =>
			request<{ success: boolean; emailSent: boolean; verificationToken?: string; message: string }>('/auth/resend-otp', { method: 'POST', body: data, auth: false }),
		forgotPassword: (data: { email: string }) =>
			request<{ success: boolean; emailSent: boolean; message: string }>('/auth/forgot-password', { method: 'POST', body: data, auth: false }),
		resetPassword: (data: { email: string; otp: string; newPassword: string }) =>
			request<{ success: boolean; message: string }>('/auth/reset-password', { method: 'POST', body: data, auth: false }),
	},

	users: {
		me: () => request<{ success: boolean; user: User }>('/users/me'),
		updateMe: (data: { name: string }) => request<{ success: boolean; user: User }>('/users/me', { method: 'PATCH', body: data }),
		list: (page: number, limit = 20) => request<{ success: boolean } & Paginated<User>>('/users', { query: { page, limit } }),
		updateTier: (id: string, tier: number) => request<{ success: boolean; user: User }>(`/users/${id}/tier`, { method: 'PATCH', body: { tier } }),
		remove: (id: string) => request<{ success: boolean }>(`/users/${id}`, { method: 'DELETE' }),
	},

	movies: {
		list: (params: { page?: number; limit?: number; search?: string; isPremiere?: boolean } = {}) =>
			request<{ success: boolean } & Paginated<Movie>>('/movies', { query: params, auth: false }),
		get: (id: string) => request<{ success: boolean; movie: Movie }>(`/movies/${id}`, { auth: false }),
		create: (data: Record<string, unknown>) => request<{ success: boolean; movie: Movie }>('/movies', { method: 'POST', body: data }),
		update: (id: string, data: Record<string, unknown>) => request<{ success: boolean; movie: Movie }>(`/movies/${id}`, { method: 'PATCH', body: data }),
		remove: (id: string) => request<{ success: boolean }>(`/movies/${id}`, { method: 'DELETE' }),
	},

	tickets: {
		purchase: (movieId: string) => request<{ success: boolean; ticket: unknown; pricing: { basePrice: number | null; finalPrice: number | null; discountApplied: boolean }; tierUpgraded: boolean }>('/tickets', { method: 'POST', body: { movieId } }),
		mine: () => request<{ success: boolean; items: (Movie & { id: string; purchased_at: string; can_download: boolean; movie_id: string })[] }>('/tickets/my'),
		checkAccess: (movieId: string) => request<{ success: boolean; hasAccess: boolean; reason: string; canDownload: boolean }>(`/tickets/access/${movieId}`),
	},

	subscriptions: {
		subscribe: () => request<{ success: boolean; subscription: unknown }>('/subscriptions', { method: 'POST', body: { plan: 'monthly' } }),
		me: () => request<{ success: boolean; isActive: boolean; subscription: { expires_at: string; status: string } | null }>('/subscriptions/me'),
		cancel: () => request<{ success: boolean }>('/subscriptions/cancel', { method: 'POST' }),
	},

	reviews: {
		create: (data: { movieId: string; rating: number; comment: string }) => request<{ success: boolean; review: Review }>('/reviews', { method: 'POST', body: data }),
		byMovie: (movieId: string) => request<{ success: boolean; items: Review[] }>(`/reviews/movie/${movieId}`, { auth: false }),
		pin: (id: string) => request<{ success: boolean }>(`/reviews/${id}/pin`, { method: 'PATCH' }),
		unpin: (id: string) => request<{ success: boolean }>(`/reviews/${id}/unpin`, { method: 'PATCH' }),
		remove: (id: string) => request<{ success: boolean }>(`/reviews/${id}`, { method: 'DELETE' }),
	},

	progress: {
		save: (movieId: string, positionSeconds: number) => request<{ success: boolean }>('/progress', { method: 'POST', body: { movieId, positionSeconds } }),
		get: (movieId: string) => request<{ success: boolean; positionSeconds: number; resumeUrl: string | null }>(`/progress/${movieId}`),
	},

	media: {
		getUploadUrl: (data: { type: 'video' | 'poster'; fileName: string; contentType: string }) =>
			request<{ uploadUrl: string; cdnUrl: string; key: string }>('/admin/media/upload-url', { method: 'POST', body: data }),
	},
}

export async function uploadFileToPresignedUrl(uploadUrl: string, file: File) {
	const res = await fetch(uploadUrl, {
		method: 'PUT',
		headers: { 'Content-Type': file.type },
		body: file,
	})
	if (!res.ok) throw new Error('Faylni yuklab bo\'lmadi')
}
