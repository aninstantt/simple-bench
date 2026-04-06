'use client'

import { motion } from 'motion/react'

type AnimatedTextGradientMotionProps = {
  text: string
  className?: string
}

const AnimatedTextGradientMotion = ({
  text,
  className
}: AnimatedTextGradientMotionProps) => {
  return (
    <>
      <motion.p
        className={`bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text text-start text-xl font-bold text-transparent sm:text-2xl ${className ?? ''}`}
        animate={{
          backgroundImage: [
            'linear-gradient(to right, hsl(172 66% 50%), hsl(27 96% 61%))',
            'linear-gradient(to right, hsl(27 96% 61%), hsl(172 66% 50%))'
          ]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatType: 'reverse',
          ease: 'linear'
        }}
      >
        {text}
      </motion.p>
    </>
  )
}

export default AnimatedTextGradientMotion
