import React, { useEffect, useRef } from 'react'
import { useCamera, CameraErrCode } from '../../context/camera.context'
import useImageCapture from './useImageCapture'
import useForceRerender from '../../hooks/useForceRerender'
import CameraError from '../CameraError/CameraError'
import { ReactComponent as CircularArrows } from '../../assets/circular-arrows.svg'
import './Camera.css'

function Camera() {
  const {
    cameraStream,
    videoAccessError,
    isInitialized,
    getCamera,
  } = useCamera()
  const [force, rerender] = useForceRerender()
  // const camptureImageRef = 

  const videoRef = useRef<HTMLVideoElement>(null)
  const videoContainerRef = useRef<HTMLDivElement>(null)

  const previewRef = useRef<HTMLCanvasElement>(null)
  const preview2DContextRef = useRef<CanvasRenderingContext2D | null>(null)

  const [canCapture, camptureImage] = useImageCapture({
    objectiveRef: videoContainerRef,
    videoRef,
    mediaStream: cameraStream,
  }, [force])

  useEffect(() => {
    if (previewRef.current) {
      preview2DContextRef.current = previewRef.current.getContext('2d')
    }
  }, [])

  useEffect(() => {
    if (isInitialized && videoAccessError === CameraErrCode.NONE) {
      console.log(isInitialized)
      getCamera('front')
    }
  }, [isInitialized])

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = cameraStream
    }
  }, [cameraStream])

  return (
    <div className="Camera">
      <div className="MainCameraContainer" ref={videoContainerRef}>
        <video className="MainCamera" ref={videoRef}
          autoPlay
          muted
          onLoadedMetadata={rerender}
        />
      </div>
      <div className="CameraMenu">
        <CameraError />
        <div className="CameraControls">
          <div
            className="Gallery CameraControlCircle"
            onClick={() => { }}
          >
            <canvas ref={previewRef}></canvas>
          </div>
          <div
            className="PhotoShot CameraControlCircle"
            onClick={async () => {
              const preview = previewRef.current
              if (preview && canCapture) {
                const preview2DContext = preview2DContextRef.current!
                const captureResult = await camptureImage()
                if (captureResult) {
                  const {
                    imageBitmap,
                    x, y, width, height,
                  } = captureResult
                  preview.width = imageBitmap.width
                  preview.height = imageBitmap.height
                  preview2DContext.drawImage(
                    imageBitmap,
                    x, y, width, height,
                    0, 0, preview.width, preview.height,
                  )
                }
              }
            }}
          ></div>
          <div
            className="SwitchCamera CameraControlCircle"
            onClick={() => { }}
          >
            <CircularArrows />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Camera
