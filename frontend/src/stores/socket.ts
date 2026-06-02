import { create } from 'zustand'
import { io, Socket } from 'socket.io-client'

const WS_URL = `${
  window.location.protocol === 'https:' ? 'wss:' : 'ws:'
}//${window.location.host}/ws`

interface SocketState {
  socket: Socket | null
  connected: boolean
  unreadCount: number
  connect: (token: string) => void
  disconnect: () => void
  setUnreadCount: (count: number) => void
}

export const useSocketStore = create<SocketState>((set, get) => ({
  socket: null,
  connected: false,
  unreadCount: 0,

  connect: (token: string) => {
    const existing = get().socket
    if (existing?.connected) return

    const socket = io(WS_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
    })

    socket.on('connect', () => set({ connected: true }))
    socket.on('disconnect', () => set({ connected: false }))
    socket.on('connect_error', () => { /* 后端 WebSocket 未就绪，静默忽略 */ })
    socket.on('error', () => { /* 静默忽略 */ })
    socket.on('notification', () => {
      set((s) => ({ unreadCount: s.unreadCount + 1 }))
    })

    set({ socket })
  },

  disconnect: () => {
    const { socket } = get()
    if (socket) {
      socket.disconnect()
    }
    set({ socket: null, connected: false, unreadCount: 0 })
  },

  setUnreadCount: (count: number) => set({ unreadCount: count }),
}))
