export type FormErrorBag = Record<string, string>

interface ApplyAxiosFormErrorsOptions {
  /**
   * Key used for generic, non-field-specific errors.
   * Defaults to "general".
   */
  generalKey?: string

  /**
   * Fallback message when the response does not contain a helpful message.
   */
  defaultMessage: string
}

/**
 * Clears the given field error keys plus the generic error key.
 */
export function resetFormErrors(
  errorBag: FormErrorBag,
  fieldKeys: string[],
  options: { generalKey?: string } = {},
): void {
  const generalKey = options.generalKey ?? 'general'

  for (const key of fieldKeys) {
    errorBag[key] = ''
  }

  if (generalKey) {
    errorBag[generalKey] = ''
  }
}

/**
 * Maps a typical Laravel / Axios validation error response onto a local error bag.
 */
export function applyAxiosFormErrors(
  errorBag: FormErrorBag,
  error: unknown,
  options: ApplyAxiosFormErrorsOptions,
): void {
  const generalKey = options.generalKey ?? 'general'

  const axiosLike = error as {
    response?: {
      data?: {
        errors?: Record<string, string[]>
        message?: string
      }
    }
  }

  const data = axiosLike.response?.data
  const validationErrors = data?.errors

  if (validationErrors && Object.keys(validationErrors).length > 0) {
    for (const [field, messages] of Object.entries(validationErrors)) {
      if (messages && messages.length > 0) {
        errorBag[field] = messages[0]
      }
    }
    return
  }

  if (data?.message) {
    errorBag[generalKey] = data.message
  } else {
    errorBag[generalKey] = options.defaultMessage
  }
}

