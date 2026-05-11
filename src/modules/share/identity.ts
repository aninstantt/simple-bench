import { fakerZH_CN } from '@faker-js/faker'

const SENDER_ID_STORAGE_KEY = 'simple-bench-pusher-sender-id'
const SENDER_NAME_STORAGE_KEY = 'simple-bench-pusher-sender-name'

export function getDefaultSenderId() {
  const existingSenderId = window.localStorage.getItem(SENDER_ID_STORAGE_KEY)

  if (existingSenderId) {
    return existingSenderId
  }

  const senderId = crypto.randomUUID()
  window.localStorage.setItem(SENDER_ID_STORAGE_KEY, senderId)

  return senderId
}

export function getDefaultSenderName() {
  const existingSenderName = window.localStorage.getItem(
    SENDER_NAME_STORAGE_KEY
  )

  if (existingSenderName) {
    return existingSenderName
  }

  const senderId = getDefaultSenderId()
  const senderName = createDefaultSenderName(senderId)
  window.localStorage.setItem(SENDER_NAME_STORAGE_KEY, senderName)

  return senderName
}

function createDefaultSenderName(senderId: string) {
  const adjective = fakerZH_CN.food.adjective()
  const noun = getRandomFoodNoun()
  const suffix = Number.parseInt(senderId.slice(5, 8), 16).toString(36)

  console.log({ suffix, senderId })

  return `${adjective}${noun}${suffix}`
}

function getRandomFoodNoun() {
  const createNoun = fakerZH_CN.helpers.arrayElement([
    () => fakerZH_CN.food.fruit(),
    () => fakerZH_CN.food.spice(),
    () => fakerZH_CN.food.vegetable()
  ])

  return createNoun()
}
