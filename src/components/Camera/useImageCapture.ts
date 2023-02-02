import { RefObject, useCallback, useEffect, useRef } from "react"
import useClientRect from "../../hooks/useClientRect"
import useCameraView from "./useCameraView"

function useImageCapture(config: {
  objectiveRef: RefObject<HTMLElement>;
  videoRef: RefObject<HTMLElement>;
  mediaStream: MediaStream | null;
}, deps?: any[]) {
  const {
    objectiveRef,
    videoRef,
    mediaStream,
  } = config
  const cameraViewRect = useCameraView(objectiveRef, videoRef, deps)
  const videoRect = useClientRect(videoRef, deps)
  const imageCaptureRef = useRef<ImageCapture | null>(null)

  useEffect(() => {
    imageCaptureRef.current = mediaStream
      ? new ImageCapture(mediaStream.getTracks()[0])
      : null
  }, [mediaStream])

  const captureImageBitmap = useCallback(async () => {
    if (!mediaStream || !cameraViewRect || !videoRect) {
      return null
    }
    const imageCapture = imageCaptureRef.current!
    const imageBitmap = await imageCapture.grabFrame()
    return {
      imageBitmap,
      x: cameraViewRect.x * imageBitmap.width / videoRect.width,
      y: cameraViewRect.y * imageBitmap.height / videoRect.height,
      width: imageBitmap.width * cameraViewRect.width / videoRect.width,
      height: imageBitmap.height * cameraViewRect.height / videoRect.height,
    }
  }, [mediaStream, cameraViewRect, videoRect])

  const canCapture = !!mediaStream && !!cameraViewRect && !!videoRect

  return [canCapture, captureImageBitmap] as const

}

export default useImageCapture
