import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from 'react'
import { useImmer } from 'use-immer'
import {
  CameraErrCode,
  closeVideoStream,
  videoAccessErrCode,
} from '../utils/camera'

export { CameraErrCode }

interface ICameraInfo {
  videoAccessError: CameraErrCode;
  facingMode: boolean;
  cameraStream: MediaStream | null;
  cameraType: TCameraType;
  isInitialized: boolean;
}

export interface ICameraContext extends ICameraInfo {
  resolution: {
    width: number;
    height: number;
  };
  getCamera(cameraType: TCameraType): Promise<void>;
  stopCamera(): void;
}

export const CameraContext = createContext<ICameraContext>({} as any)

export type TCameraType = 'selfie' | 'front'

export const CameraProvider = ({ children }: any) => {
  const [{
    videoAccessError,
    facingMode,
    cameraStream,
    cameraType,
    isInitialized,
  }, updateCamera] = useImmer<ICameraInfo>({
    videoAccessError: CameraErrCode.NONE,
    facingMode: false,
    cameraStream: null,
    cameraType: 'front' as TCameraType,
    isInitialized: false,
  })
  /*
    Next 2 lines are required because of
    asynchronous nature of media operations
  */
  const unmountedRef = useRef<boolean | null>(false)
  /*
    see this issue for preserved refs between mounts in StrictMode -
      https://github.com/facebook/react/issues/24670
  */
  const cameraStreamRef = useRef<MediaStream | null>(null)

  const endedEventHandler = useCallback((e: any) => {
    if (unmountedRef.current) return
    updateCamera(draft => { draft.cameraStream = null; draft.videoAccessError = CameraErrCode.Permision })
  }, [])

  useEffect(() => {
    initCamera()
    return () => {
      // NOTE: Only this useEffect returned function will work on unmount!
      unmountedRef.current = true
      const cameraStream = cameraStreamRef.current
      if (cameraStream) {
        closeVideoStream(cameraStream)
      }
    }
  }, [])

  useEffect(() => {
    cameraStreamRef.current = cameraStream

    if (!unmountedRef.current && cameraStream) {
      const currentTrack = cameraStream.getTracks()[0]
      currentTrack.addEventListener('ended', endedEventHandler)
    }
    return () => {/* Worning: This Will Not Run On Unmount! */ }
  }, [cameraStream])

  const getCameraCb = useCallback(getCamera, [
    cameraStream,
    isInitialized,
    videoAccessError,
  ])
  const stopCameraCb = useCallback(() => {
    if (unmountedRef.current) return
    if (cameraStream) {
      closeVideoStream(cameraStream)
      updateCamera(draft => { draft.cameraStream = null })
    }
  }, [cameraStream])

  const contextValue = useMemo(() => ({
    videoAccessError,
    facingMode,
    cameraStream,
    cameraType,
    isInitialized,
    resolution: {
      width: (
        cameraStream
        &&
        cameraStream.getTracks()[0].getSettings().width
      ) || 0,
      height: (
        cameraStream
        &&
        cameraStream.getTracks()[0].getSettings().height
      ) || 0,
    },
    getCamera: getCameraCb,
    stopCamera: stopCameraCb,
  }), [
    videoAccessError,
    facingMode,
    cameraStream,
    cameraType,
    isInitialized,
    getCameraCb,
    stopCameraCb,
  ])

  return (
    <CameraContext.Provider value={contextValue}>
      {children}
    </CameraContext.Provider>
  )

  async function checkVideoAccess() {
    try {
      const mediaStream = await (
        navigator.mediaDevices
          .getUserMedia({
            video: true
          })
      )
      closeVideoStream(mediaStream)
      if (unmountedRef.current) return false
      updateCamera(draft => {
        draft.isInitialized = true;
        draft.cameraStream = null;
        draft.videoAccessError = CameraErrCode.NONE;
      })
      return true
    } catch (err: any) {
      if (unmountedRef.current) return false
      updateCamera(draft => {
        draft.isInitialized = true;
        draft.cameraStream = null;
        draft.videoAccessError = videoAccessErrCode(err);
      })
      return false
    }
  }

  async function getCamera(type: TCameraType) {
    if (!isInitialized) {
      console.warn('Call this function only when isInitialized == true')
      return
    }
    if (videoAccessError !== CameraErrCode.NONE) {
      console.warn('If VideoAccessError occured you Need To check camera permisions on browser and refresh the page.')
      return
    }
    try {
      const cameraInternalType = type === 'front' ? 'environment' : 'user'
      const mediaStream = await (
        navigator.mediaDevices
          .getUserMedia({
            video: {
              facingMode: { exact: cameraInternalType }
            }
          })
      )
      if (unmountedRef.current) return
      if (cameraStream) {
        closeVideoStream(cameraStream)
      }
      updateCamera(draft => { draft.cameraStream = mediaStream })
    } catch (err: any) {
      if (type === 'front') {
        try {
          const mediaStream = await (
            navigator.mediaDevices
              .getUserMedia({
                video: { facingMode: { exact: [] } }
              })
          )
          if (unmountedRef.current) return
          if (cameraStream) {
            closeVideoStream(cameraStream)
          }
          updateCamera(draft => { draft.cameraStream = mediaStream })
          return
        } catch { }
      }
      if (cameraStream) {
        closeVideoStream(cameraStream)
      }
      updateCamera(draft => { draft.cameraStream = null })
    }
  }

  async function initCamera() {
    console.log('init')
    const { facingMode } = (
      navigator.mediaDevices
        .getSupportedConstraints()
    )
    if (facingMode) {
      updateCamera(draft => { draft.facingMode = true })
    }

    await checkVideoAccess()
  }
}

export function useCamera() {
  return useContext(CameraContext)
}
