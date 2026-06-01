import { atom } from 'jotai'

export const shareInputAtom = atom('')
export const shareReceivedItemsAtom = atom<Share.ListItem[]>([])
export const shareItemsAtom = atom<Share.ListItem[]>([])
export const shareShowMembersAtom = atom(false)
export const shareShowMessagesAtom = atom(true)
export const shareShowReceivedListAtom = atom(false)
export const shareShowShareListAtom = atom(false)
export const shareMessagesAtom = atom<Share.PusherMessage[]>([])
