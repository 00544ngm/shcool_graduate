import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'

// Mock auth store
const mockLogin = vi.fn()
vi.mock('@/stores/auth', () => ({
  useAuthStore: () => ({ login: mockLogin }),
}))

import Login from '@/pages/auth/Login'

function renderLogin() {
  return render(
    <BrowserRouter>
      <Login />
    </BrowserRouter>,
  )
}

describe('Login Page', () => {
  it('renders login form', () => {
    renderLogin()
    expect(screen.getByText('欢迎回来')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('输入用户名')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('输入密码')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /登录/ })).toBeInTheDocument()
  })

  it('shows error on empty submit', async () => {
    renderLogin()
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /登录/ }))
    expect(screen.getByText('请输入用户名和密码')).toBeInTheDocument()
  })

  it('renders register link', () => {
    renderLogin()
    expect(screen.getByText('立即注册')).toBeInTheDocument()
  })
})
