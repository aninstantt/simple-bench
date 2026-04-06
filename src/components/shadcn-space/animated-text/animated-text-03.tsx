'use client'

import { useEffect, useMemo, useState } from 'react'

type AnimatedTypingMotionProps = {
  words?: string[]
  className?: string
  stepMs?: number
  loop?: boolean
}

const DEFAULT_WORDS = [
  'Hello, World!',
  'Welcome to my website!',
  'This is a typewriter effect.'
]

const AnimatedTypingMotion = ({
  words = DEFAULT_WORDS,
  className,
  stepMs = 50,
  loop = true
}: AnimatedTypingMotionProps) => {
  const safeWords = useMemo(
    () => (words.length ? words : DEFAULT_WORDS),
    [words]
  )
  const [i, setI] = useState(0)
  const [j, setJ] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const [text, setText] = useState('')

  useEffect(() => {
    const currentWord = safeWords[i]

    const timeout = setTimeout(() => {
      if (!loop && !isDeleting && j === currentWord.length) {
        return
      }

      if (isDeleting) {
        setText(currentWord.substring(0, j - 1))
        setJ(j - 1)

        if (j === 0) {
          setIsDeleting(false)
          setI(prev => (prev + 1) % safeWords.length)
        }
      } else {
        setText(currentWord.substring(0, j + 1))
        setJ(j + 1)

        if (j === currentWord.length) {
          if (loop) setIsDeleting(true)
        }
      }
    }, stepMs)

    return () => clearTimeout(timeout)
  }, [j, i, isDeleting, safeWords, stepMs, loop])

  return (
    <div className="flex w-full items-center justify-start">
      <p
        className={
          className ?? 'text-xl font-medium text-foreground sm:text-2xl'
        }
      >
        {text}
      </p>
    </div>
  )
}

export default AnimatedTypingMotion
