import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockGet = vi.fn()
let interceptorErrorHandler: ((error: unknown) => unknown) | null = null

vi.mock('axios', () => ({
  default: {
    create: () => ({
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      interceptors: {
        response: {
          use: (_onSuccess: unknown, onError: (error: unknown) => unknown) => {
            interceptorErrorHandler = onError
            return 0
          },
        },
      },
    }),
    get: (...args: unknown[]) => {
      mockGet(...args)
      return Promise.resolve({})
    },
  },
}))

beforeEach(() => {
  vi.resetModules()
  mockGet.mockClear()
  interceptorErrorHandler = null
})

describe('setUnauthorizedHandler', () => {
  it('accepts and clears handler', async () => {
    const { setUnauthorizedHandler } = await import('./client')
    const handler = vi.fn()
    setUnauthorizedHandler(handler)
    setUnauthorizedHandler(null)
  })

  it('calls handler when 401 response is received', async () => {
    const { setUnauthorizedHandler } = await import('./client')
    const handler = vi.fn()
    setUnauthorizedHandler(handler)

    // Simulate a 401 error through the interceptor
    const error = { response: { status: 401 } }
    expect(interceptorErrorHandler).not.toBeNull()
    try {
      await interceptorErrorHandler!(error)
    } catch {
      // Expected rejection
    }

    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('does not call handler for non-401 errors', async () => {
    const { setUnauthorizedHandler } = await import('./client')
    const handler = vi.fn()
    setUnauthorizedHandler(handler)

    const error = { response: { status: 500 } }
    try {
      await interceptorErrorHandler!(error)
    } catch {
      // Expected rejection
    }

    expect(handler).not.toHaveBeenCalled()
  })
})

describe('ensureCsrf', () => {
  it('calls axios.get with sanctum csrf-cookie url', async () => {
    const { ensureCsrf } = await import('./client')
    await ensureCsrf()
    expect(mockGet).toHaveBeenCalledWith(
      expect.stringMatching(/\/sanctum\/csrf-cookie$/),
      expect.objectContaining({ withCredentials: true })
    )
  })
})
