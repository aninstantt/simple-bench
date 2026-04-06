import { useState, memo } from 'react'

let memoizedRenderCount = 0
let nonMemoRenderCount = 0

export function resetCounts() {
  memoizedRenderCount = 0
  nonMemoRenderCount = 0
}
export function getCounts() {
  return { memoizedRenderCount, nonMemoRenderCount }
}

// Component wrapped with React.memo - manually prevents unnecessary rerenders
const MemoizedChild = memo(function MemoizedChild({
  label,
  count2
}: {
  label: string
  count2: number
}) {
  memoizedRenderCount++
  return (
    <div data-testid="memoized">
      Memoized: {label} {count2}
    </div>
  )
})

// Component without memo - React Compiler should optimize this automatically
function NonMemoChild({ label, count2 }: { label: string; count2: number }) {
  nonMemoRenderCount++
  return (
    <div data-testid="nonmemo">
      NonMemo: {label} {count2}
    </div>
  )
}

export default function ReactCompilerTest() {
  const [count, setCount] = useState(0)
  const [count2, setCount2] = useState(0)
  const label = 'Static Label'

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>React Compiler Test (compare with React.memo)</h1>

      <button
        onClick={() => setCount(c => c + 1)}
        style={{ padding: '10px 20px', fontSize: '16px', marginRight: '10px' }}
      >
        Update count: {count}
      </button>

      <button
        onClick={() => setCount2(c => c + 1)}
        style={{ padding: '10px 20px', fontSize: '16px', marginRight: '10px' }}
      >
        Update count2: {count2}
      </button>

      <hr />
      <h2>Component wrapped with React.memo</h2>
      <p style={{ fontSize: '12px', color: '#888' }}>
        Props unchanged → should not rerender
      </p>
      <MemoizedChild label={label} count2={count2} />

      <hr />
      <h2>Component without React.memo</h2>
      <p style={{ fontSize: '12px', color: '#888' }}>
        If React Compiler is effective, this should rerender only when count2
        changes. If not, it will rerender when count changes.
      </p>
      <NonMemoChild label={label} count2={count2} />

      <button onClick={() => console.info(getCounts())}>
        Log Render Counts
      </button>
    </div>
  )
}
