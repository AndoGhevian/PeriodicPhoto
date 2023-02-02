import { RefObject } from "react"
import useClientRect from "../../hooks/useClientRect"

function useCameraView(objectiveRef: RefObject<HTMLElement>, videoRef: RefObject<HTMLElement>, deps?: any[]) {
  const videoRect = useClientRect(videoRef, deps)
  const objectiveRect = useClientRect(objectiveRef, deps)

  let captureRect: DOMRect | null = null
  if (videoRect && objectiveRect) {
    const left = Math.max(videoRect.x, objectiveRect.x)
    const top = Math.max(videoRect.y, objectiveRect.y)
    const right = Math.min((videoRect.x + videoRect.width), (objectiveRect.x + objectiveRect.width))
    const bottom = Math.min((videoRect.y + videoRect.height), (objectiveRect.y + objectiveRect.height))

    const width = right - left
    const height = bottom - top
    if(width > 0 && height > 0) {
      return new DOMRect(left - videoRect.x, top - videoRect.y, width, height)
    }
  }

  return captureRect
}

export default useCameraView
