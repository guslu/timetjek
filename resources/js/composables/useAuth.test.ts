import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useAuth, initAuth, login, logout, clearAuthState, resetAuthState } from './useAuth'

const mockGet = vi.fn()
const mockPost = vi.fn()
const mockEnsureCsrf = vi.fn()

vi.mock('@/api/client', () => ({
  api: {
    get: (...args: unknown[]) => mockGet(...args),
    post: (...args: unknown[]) => mockPost(...args),
  },
  ensureCsrf: () => mockEnsureCsrf(),
}))

beforeEach(() => {
  vi.clearAllMocks()
  resetAuthState()
})

describe('useAuth', () => {
  it('returns user, loading, initialized, isAuthenticated, fetchUser', () => {
    const auth = useAuth()
    expect(auth).toHaveProperty('user')
    expect(auth).toHaveProperty('loading')
    expect(auth).toHaveProperty('initialized')
    expect(auth).toHaveProperty('isAuthenticated')
    expect(auth).toHaveProperty('fetchUser')
    expect(auth.user.value).toBeNull()
    expect(auth.isAuthenticated.value).toBe(false)
  })

  it('isAuthenticated is true when user has id', async () => {
    const user = { id: 1, name: 'Test', email: null, personal_number: '123' }
    mockGet.mockResolvedValueOnce({ data: user })
    const auth = useAuth()
    await auth.fetchUser()
    expect(auth.user.value).toEqual(expect.objectContaining({ id: 1 }))
    expect(auth.isAuthenticated.value).toBe(true)
  })

  it('fetchUser sets user to null on error', async () => {
    mockGet.mockRejectedValueOnce(new Error('401'))
    const auth = useAuth()
    await auth.fetchUser()
    expect(auth.user.value).toBeNull()
  })
})

describe('initAuth', () => {
  it('calls fetchUser when not yet initialized', async () => {
    resetAuthState()
    mockGet.mockResolvedValueOnce({ data: null })
    await initAuth()
    expect(mockGet).toHaveBeenCalledWith('/api/user')
  })
})

describe('login', () => {
  it('calls ensureCsrf then post then fetchUser', async () => {
    mockEnsureCsrf.mockResolvedValue(undefined)
    mockPost.mockResolvedValue({})
    mockGet.mockResolvedValue({
      data: { id: 1, name: 'U', email: null, personal_number: '1' },
    })
    await login('123', 'pass')
    expect(mockEnsureCsrf).toHaveBeenCalled()
    expect(mockPost).toHaveBeenCalledWith('/login', {
      personal_number: '123',
      password: 'pass',
    })
    expect(mockGet).toHaveBeenCalledWith('/api/user')
  })
})

describe('logout', () => {
  it('calls post and clears user', async () => {
    mockPost.mockResolvedValue({})
    const auth = useAuth()
    auth.user.value = { id: 1, name: 'U', email: null, personal_number: '1' }
    await logout()
    expect(mockPost).toHaveBeenCalledWith('/logout')
    expect(auth.user.value).toBeNull()
  })
})

describe('clearAuthState', () => {
  it('sets user to null without calling API', () => {
    const auth = useAuth()
    auth.user.value = { id: 1, name: 'U', email: null, personal_number: '1' }
    clearAuthState()
    expect(auth.user.value).toBeNull()
    expect(auth.initialized.value).toBe(true)
  })
})

describe('login failure', () => {
  it('throws error and does not fetch user on login failure', async () => {
    const error = { response: { status: 422, data: { errors: { personal_number: ['Invalid'] } } } }
    mockEnsureCsrf.mockResolvedValue(undefined)
    mockPost.mockRejectedValue(error)

    await expect(login('invalid', 'pass')).rejects.toEqual(error)
    // fetchUser should not have been called because login threw
    expect(mockGet).not.toHaveBeenCalled()
  })
})

describe('logout failure', () => {
  it('throws error and preserves user state on logout failure', async () => {
    const error = new Error('Network error')
    mockPost.mockRejectedValue(error)
    const auth = useAuth()
    auth.user.value = { id: 1, name: 'U', email: null, personal_number: '1' }

    await expect(logout()).rejects.toThrow('Network error')
    // User should still be set because logout failed before clearing
    expect(auth.user.value).toEqual({ id: 1, name: 'U', email: null, personal_number: '1' })
  })
})
