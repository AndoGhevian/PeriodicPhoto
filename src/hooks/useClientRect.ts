import {
  useState,
  useEffect,
  RefObject,
} from "react"
import { useWindowSize } from '@react-hook/window-size'

function useClientRect(elemRef: RefObject<HTMLElement>, deps?: any[]) {
  const [rect, setRect] = useState<DOMRect | null>(null)
  const [width, height] = useWindowSize()

  useEffect(() => {
    if (elemRef.current) {
      setRect(elemRef.current.getBoundingClientRect())
    }
  }, [])

  useEffect(() => {
    if (deps && deps.length) {
      if (elemRef.current) {
        setRect(elemRef.current.getBoundingClientRect())
      }
    }
  }, deps)

  // Unfortunately npm rooks/useOnWindowResize not works!
  useEffect(() => {
    if (elemRef.current) {
      setRect(elemRef.current.getBoundingClientRect())
    }
  }, [width, height])
  
  return rect
}

export default useClientRect
