import { useCallback, useState } from "react"

function useForceRerender(): [force: number, rerender: () => void] {
  const [force, setForce] = useState(0.123)

  const rerender = useCallback(() => {
    let rand = 0
    while (rand === 0) {
      rand = Math.random()
    }
    setForce(rand)
  }, [])

  return [force, rerender]

}

export default useForceRerender
