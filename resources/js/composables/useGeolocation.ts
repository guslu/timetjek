import { ref } from 'vue'

export function useGeolocation() {
  const error = ref<string | null>(null)

  const getPosition = (): Promise<{ lat: number; lng: number } | null> => {
    error.value = null

    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        error.value = 'Geolocation is not supported by this browser.'
        resolve(null)
        return
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          resolve({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          })
        },
        (err) => {
          error.value = err.message || 'Failed to get location.'
          resolve(null)
        },
        { enableHighAccuracy: true, timeout: 5000 }
      )
    })
  }

  return { getPosition, error }
}
