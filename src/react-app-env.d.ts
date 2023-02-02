/// <reference types="react-scripts" />

declare module globalThis {
  class ImageCapture {
    constructor(trakc: MediaStreamTrack)
    // ... any properties
    grabFrame: () => Promise<ImageBitmap>
  }
}
