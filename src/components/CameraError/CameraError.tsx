import React from "react"
import { CameraErrCode, useCamera } from "../../context/camera.context"
import "./CameraError.css"

function CameraError() {
  const {
    videoAccessError,
    facingMode,
  } = useCamera()


  const isPermisionDenied = videoAccessError === CameraErrCode.Permision
  const isNotHttps = videoAccessError === CameraErrCode.Security
  const isUnknownError = videoAccessError === CameraErrCode.UnknownError

  const hasError = videoAccessError !== CameraErrCode.NONE || !facingMode


  let errorSection = null
  if (hasError) {
    errorSection = (
      <section
        className="CameraErrorSection"
      >
        {isPermisionDenied && <p>Error: Please Allow Camera Permision!</p>}
        {isNotHttps && <p>Error: Please Visit site with HTTPS!</p>}
        {isUnknownError && <p>Error: Please Allow Camera Permision</p>}
        {!facingMode && <p>Worning: Please Configure Your frontal and selfie cameras on Your own</p>}
      </section>
    )
  }

  return (
    errorSection
  )
}

export default CameraError