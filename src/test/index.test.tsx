import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it, beforeEach } from 'vitest'

import ReactCompilerTest, {
  getCounts,
  resetCounts
} from './react-compiler-test'

beforeEach(() => resetCounts())

describe('Test babel-plugin-react-compiler behavior', () => {
  it('both memoized and non-memoized child should NOT rerender when unrelated state updates', () => {
    render(<ReactCompilerTest />)

    const updateCountButton = screen.getByRole('button', {
      name: /Update count:/i
    })
    fireEvent.click(updateCountButton)

    const { memoizedRenderCount, nonMemoRenderCount } = getCounts()
    expect(memoizedRenderCount).toBe(1)
    expect(nonMemoRenderCount).toBe(1)
  })

  it('both memoized and non-memoized child should rerender when dependent state updates', () => {
    render(<ReactCompilerTest />)

    const updateCount2Button = screen.getByRole('button', {
      name: /Update count2:/i
    })
    fireEvent.click(updateCount2Button)

    const { memoizedRenderCount, nonMemoRenderCount } = getCounts()
    expect(memoizedRenderCount).toBe(2)
    expect(nonMemoRenderCount).toBe(2)
  })
})
