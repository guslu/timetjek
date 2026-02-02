export interface User {
  id: number
  name: string
  email: string | null
  personal_number: string
}

export interface TimeEntry {
  id: number
  user_id: number
  started_at: string
  ended_at: string | null
  start_lat: number | null
  start_lng: number | null
  end_lat: number | null
  end_lng: number | null
  created_at: string
  updated_at: string
}

export interface TimeEntryListResponse {
  data: TimeEntry[]
  links: { first: string; last: string; prev: string | null; next: string | null }
  meta: { current_page: number; last_page: number; per_page: number; total: number }
}
