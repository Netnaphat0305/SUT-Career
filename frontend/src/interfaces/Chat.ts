export interface ChatHistory {
  id: number
  chatRoomId: number
  message: string
  isOwn: boolean
  sender: string
  time: string
}

export interface ChatRoom {
  id: number
  name: string
  lastMessage?: string
}
