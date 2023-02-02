import React, { useEffect, useRef } from 'react'
import { useImmer } from 'use-immer'
import fscreen from 'fscreen'
import { CameraProvider } from './context/camera.context'
import Camera from './components/Camera/Camera'
import './App.css'

function App() {
  const [state, updateState] = useImmer({
    error: "",
    isRunning: false,
  })
  const appRef = useRef<HTMLDivElement>(null)

  const tryFullscreen = () => {
    const appDiv = appRef.current
    if (appDiv) {
      (fscreen.requestFullscreen(appDiv) as unknown as Promise<any>)
        .catch((err) => updateState({
          error: err.message,
          isRunning: false,
        }))
    }
  }

  const fullscreenerrorHandler = () => { }

  const fullscreenchangeHandler = () => {
    if (fscreen.fullscreenElement === null) {
      updateState({
        error: "",
        isRunning: false,
      })
    } else if (fscreen.fullscreenElement) {
      updateState({
        error: "",
        isRunning: true,
      })
    }
  }

  useEffect(() => {
    if (!fscreen.fullscreenEnabled) {
      updateState(draft => {
        draft.error = "ErrNotSupproted: App Is Require Fullscreen Feature!"
      })
    }
  }, [])

  useEffect(() => {
    if (fscreen.fullscreenEnabled) {
      fscreen.addEventListener('fullscreenerror', fullscreenerrorHandler)
      fscreen.addEventListener('fullscreenchange', fullscreenchangeHandler)
    }
    return () => {
      fscreen.removeEventListener('fullscreenerror', fullscreenchangeHandler)
      fscreen.removeEventListener('fullscreenchange', fullscreenchangeHandler)
    }
  })

  const {
    error,
    isRunning,
  } = state

  return (
    <div ref={appRef} className="App">
      {!isRunning ? (
        <>
          {error ? (
            <h3>{error}</h3>
          ) : (
            <button
              onClick={tryFullscreen}
            >Fullscreen(F11)</button>
          )}
        </>
      ) : (
        <CameraProvider>
          <Camera />
        </CameraProvider>
      )}
    </div>
  )
}

export default App
