import axios from 'axios'
import { navigate } from './navigate'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      if (window.location.pathname !== '/login') {
        navigate('/login')
      }
    }
    return Promise.reject(err)
  },
)

export default api

/* ─── Auth ─── */
export const authApi = {
  register: (data: { username: string; email: string; nickname: string; password: string }) =>
    api.post('/auth/register', data),
  login: (data: { username: string; password: string }) =>
    api.post('/auth/login', data),
}

/* ─── Photos ─── */
export const photoApi = {
  findAll: (page = 1, limit = 20) => api.get('/photos', { params: { page, limit } }),
  findOne: (id: string) => api.get(`/photos/${id}`),
  search: (q: string, page = 1, limit = 20) => api.get('/photos/search', { params: { q, page, limit } }),
  create: (data: FormData) => api.post('/photos', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id: string) => api.delete(`/photos/${id}`),
}

/* ─── Videos ─── */
export const videoApi = {
  findAll: (page = 1, limit = 20) => api.get('/videos', { params: { page, limit } }),
  findOne: (id: string) => api.get(`/videos/${id}`),
  create: (data: FormData) => api.post('/videos', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id: string) => api.delete(`/videos/${id}`),
}

/* ─── Comments ─── */
export const commentApi = {
  create: (data: { targetType: string; targetId: string; content: string; parentId?: string }) =>
    api.post('/comments', data),
  findByTarget: (targetType: string, targetId: string) =>
    api.get('/comments', { params: { targetType, targetId } }),
  delete: (id: string) => api.delete(`/comments/${id}`),
}

/* ─── Moments ─── */
export const momentApi = {
  findAll: (page = 1, limit = 20) => api.get('/moments', { params: { page, limit } }),
  create: (data: { content: string; images?: string[] }) => api.post('/moments', data),
  delete: (id: string) => api.delete(`/moments/${id}`),
}

/* ─── Timeline ─── */
export const timelineApi = {
  get: () => api.get('/timeline'),
}

/* ─── Like ─── */
export const likeApi = {
  toggle: (data: { targetType: string; targetId: string }) => api.post('/likes/toggle', data),
  getLikes: (targetType: string, targetId: string) => api.get(`/likes/${targetType}/${targetId}`),
}

/* ─── Notification ─── */
export const notificationApi = {
  findMy: (page = 1, limit = 20) => api.get('/notifications', { params: { page, limit } }),
  markRead: (id: string) => api.post(`/notifications/${id}/read`),
  markAllRead: () => api.post('/notifications/read-all'),
  broadcast: (content: string) => api.post('/notifications/broadcast', { content }),
}

/* ─── User ─── */
export const userApi = {
  findAll: (page = 1, limit = 20) => api.get('/user', { params: { page, limit } }),
  getProfile: () => api.get('/user/profile'),
  getUserById: (id: string) => api.get(`/user/${id}`),
  updateProfile: (data: { nickname?: string; bio?: string; city?: string; dormitory?: string }) =>
    api.put('/user/profile', data),
  getCityMap: () => api.get('/user/map'),
  getDormitoryGroups: () => api.get('/user/dormitory-groups'),
}

/* ─── Mailbox ─── */
export const mailboxApi = {
  create: (data: { title: string; content: string; unlockType: string; unlockDate?: string }) =>
    api.post('/mailbox', data),
  findMy: () => api.get('/mailbox'),
  findOpened: () => api.get('/mailbox/opened'),
  openLetter: (id: string) => api.post(`/mailbox/${id}/open`),
}

/* ─── AI ─── */
export const aiApi = {
  search: (query: string) => api.post('/ai/search', { query }),
  chat: (message: string) => api.post('/ai/chat', { message }),
}

/* ─── Favorite ─── */
export const favoriteApi = {
  toggle: (data: { targetType: string; targetId: string }) => api.post('/favorites/toggle', data),
  findMy: () => api.get('/favorites'),
}

/* ─── Admin ─── */
export const adminApi = {
  stats: () => api.get('/admin/stats'),
  users: () => api.get('/admin/users'),
  deleteUser: (id: string) => api.delete(`/admin/users/${id}`),
  updateRole: (id: string, role: string) => api.patch(`/admin/users/${id}/role`, { role }),
}

/* ─── Health ─── */
export const healthApi = {
  check: () => api.get('/health'),
}

/* ─── Home Messages ─── */
export const homeMessageApi = {
  findAll: (limit = 50) => api.get('/home-messages', { params: { limit } }),
  create: (content: string) => api.post('/home-messages', { content }),
  delete: (id: string) => api.delete(`/home-messages/${id}`),
}

/* ─── Upload ─── */
export const uploadApi = {
  images: (files: File[]) => {
    const fd = new FormData()
    files.forEach((f) => fd.append('files', f))
    return api.post('/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
  },
}
