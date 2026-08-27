export interface User {
  id: string              // Firebase UID — primary key everywhere
  email: string
  displayName: string | null
  createdAt: string       // ISO 8601
  updatedAt: string       // ISO 8601
}
