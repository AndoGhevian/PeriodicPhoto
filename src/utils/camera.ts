export enum CameraErrCode {
    NONE,
    UnknownError,
    Permision,
    Security,
}

export function videoAccessErrCode(err: any) {
    if (!err) {
        return CameraErrCode.NONE
    }
    switch (err.name) {
        case 'NotAllowedError':
            return CameraErrCode.Permision
        case 'TypeError':
            return CameraErrCode.Security
        default:
            return CameraErrCode.UnknownError
    }
}

export function closeVideoStream(stream: MediaStream) {
    stream.getTracks().forEach(function (track) {
        track.stop()
    })
}
