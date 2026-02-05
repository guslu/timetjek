import type { Ref } from 'vue'

export type FormErrorBag = Record<string, string>

function applyAxiosFormErrors(
  errorBag: FormErrorBag,
  error: unknown,
  options: { generalKey?: string; defaultMessage: string },
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

export function getFirstValidationMessage(
  error: unknown,
  field: string,
  fallback: string
): string {
  const axiosLike = error as {
    response?: { data?: { errors?: Record<string, string[]> } }
  }
  const messages = axiosLike.response?.data?.errors?.[field]
  if (messages && messages.length > 0) {
    return messages[0]
  }
  return fallback
}

export async function submitWithFormErrors(
  errorBag: FormErrorBag,
  options: { fieldKeys: string[]; defaultMessage: string },
  isSubmitting: Ref<boolean>,
  submitFn: () => Promise<void>
): Promise<void> {
  for (const key of options.fieldKeys) {
    errorBag[key] = ''
  }
  errorBag['general'] = ''
  isSubmitting.value = true
  try {
    await submitFn()
  } catch (error: unknown) {
    applyAxiosFormErrors(errorBag, error, { defaultMessage: options.defaultMessage })
  } finally {
    isSubmitting.value = false
  }
}

