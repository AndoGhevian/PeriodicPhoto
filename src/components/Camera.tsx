import React, { useEffect, useRef } from 'react';
import { useImmer } from 'use-immer'
import {
  CameraErrCode,
  closeVideoStream,
  videoAccessErrCode,
} from '../utils/camera'
import './Camera.css';

type TCameraType = 'selfie' | 'front'

function Camera() {
  const [{
    videoAccess,
    facingMode,
    frontCameraId,
    selfieCameraId,
    currentCameraType,
  }, updateCamera] = useImmer({
    videoAccess: CameraErrCode.NONE,
    facingMode: false,
    frontCameraId: "",
    selfieCameraId: "",
    currentCameraType: 'front' as TCameraType,
  })

  const mainVideoRef = useRef<HTMLVideoElement>(null)
  const secondaryVideoRef = useRef<HTMLVideoElement>(null)
  const cameraStreamsRef = useRef<(MediaStream | null)[] | null>([null, null])

  const checkVideoAccess = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true
      })
      closeVideoStream(mediaStream)
      updateCamera(draft => { draft.videoAccess = CameraErrCode.NONE })
      return true
    } catch (err: any) {
      updateCamera(draft => { draft.videoAccess = videoAccessErrCode(err) })
      return false
    }
  }

  const getCamera = async (type: TCameraType) => {
    const cameraStreamIndex = type === 'front' ? 1 : 0
    const cameraStreams = cameraStreamsRef.current!

    try {
      const cameraInternalType = type === 'front' ? 'environment' : 'user'
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { exact: cameraInternalType }
        }
      })
      if (cameraStreams[cameraStreamIndex]) {
        closeVideoStream(cameraStreams[cameraStreamIndex]!)
      }
      cameraStreams[cameraStreamIndex] = mediaStream
      updateCamera(draft => { draft[`${type}CameraId`] = mediaStream.id })
    } catch (err: any) {
      if (type === 'front') {
        try {
          const mediaStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: { exact: [] } }
          })
          if (cameraStreams[cameraStreamIndex]) {
            closeVideoStream(cameraStreams[cameraStreamIndex]!)
          }
          cameraStreams[cameraStreamIndex] = mediaStream
          updateCamera(draft => { draft[`${type}CameraId`] = mediaStream.id })
          return
        } catch { }
      }
      if (cameraStreams[cameraStreamIndex]) {
        closeVideoStream(cameraStreams[cameraStreamIndex]!)
      }
      cameraStreams[cameraStreamIndex] = null
      updateCamera(draft => { draft[`${type}CameraId`] = "" })
    }
  }

  const initCameras = async () => {
    const { facingMode } = navigator.mediaDevices.getSupportedConstraints()
    if (facingMode) {
      updateCamera(draft => { draft.facingMode = true })
    }

    const hasAccess = await checkVideoAccess()
    if (hasAccess) {
      return Promise.race([
        getCamera('front'),
        getCamera('selfie'),
      ])
    }
  }

  useEffect(() => {
    const initPromise = initCameras()
    return () => {
      initPromise.then(() => {
        const cameraStreams = cameraStreamsRef.current!
        cameraStreams.forEach((stream) => {
          if (stream) {
            closeVideoStream(stream)
          }
        })
      })
    }
  }, [])

  useEffect(() => {
    const cameraStreams = cameraStreamsRef.current!
    const currentCameraIndex = currentCameraType === 'front' ? 1 : 0
    const secondaryCameraIndex = currentCameraIndex ? 0 : 1
    if (mainVideoRef.current) {
      mainVideoRef.current.srcObject = cameraStreams[currentCameraIndex]
    }
    if (secondaryVideoRef.current) {
      // line under is not working because of inability to show both front and back cameras simultaneously
      secondaryVideoRef.current.srcObject = cameraStreams[secondaryCameraIndex] // try this - cameraStreams[currentCameraIndex] - its work
    }
  }, [frontCameraId, selfieCameraId, currentCameraType])

  const isPermisionDenied = videoAccess === CameraErrCode.Permision
  const isNotHttps = videoAccess === CameraErrCode.Security
  const isUnknownError = videoAccess === CameraErrCode.UnknownError

  return (
    <div className="Camera">
      <video className="MainCamera" ref={mainVideoRef} autoPlay muted />
      <div className="CameraMenu">
        {isPermisionDenied && <p>Error: Please Allow Camera Permision!</p>}
        {isNotHttps && <p>Error: Please Visit site with HTTPS!</p>}
        {isUnknownError && <p>Error: Please Allow Camera Permision</p>}
        {!facingMode && <p>Worning: Please Configure Your frontal and selfie cameras on Your own</p>}
        <p>Camera Menu</p>
        <video className="SecondaryCamera" ref={secondaryVideoRef} autoPlay muted />
      </div>
    </div>
  );
}

export default Camera;
