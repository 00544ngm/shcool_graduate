import { describe, it, expect, vi, beforeEach } from 'vitest'
import api from '@/services/api'

describe('API Service', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('request interceptor adds Bearer token when token exists', () => {
    localStorage.setItem('token', 'test-token')
    const config = { headers: {} }
    const handler = api.interceptors.request.handlers[0]
    const result = handler.fulfilled(config as any)
    expect(result.headers.Authorization).toBe('Bearer test-token')
  })

  it('request interceptor skips token when no token', () => {
    const config = { headers: {} }
    const handler = api.interceptors.request.handlers[0]
    const result = handler.fulfilled(config as any)
    expect(result.headers.Authorization).toBeUndefined()
  })

  it('response 401 clears token and user', () => {
    localStorage.setItem('token', 'old-token')
    localStorage.setItem('user', 'test-user')

    const err = { response: { status: 401 } }
    const handler = api.interceptors.response.handlers[0]
    expect(handler.rejected(err)).rejects.toBe(err)
    expect(localStorage.getItem('token')).toBeNull()
    expect(localStorage.getItem('user')).toBeNull()
  })

  it('response error other than 401 does not clear token', () => {
    localStorage.setItem('token', 'valid-token')

    const err = { response: { status: 500 } }
    const handler = api.interceptors.response.handlers[0]
    expect(handler.rejected(err)).rejects.toBe(err)
    expect(localStorage.getItem('token')).toBe('valid-token')
  })
})
