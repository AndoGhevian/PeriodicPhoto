import './react-app-env'

// See Answere to question: [Using globalThis in Typescript](https://stackoverflow.com/a/68452689)
declare global {
  interface Window {
    new (): Window;
    prototype: Window;
    ImageCapture: typeof ImageCapture;
    /**
     * This Property added for demonstrarional purposes:
     * Window
     */
    declaringWindowProperty: number;
  }

  /**
   * This Property added for demonstrarional purposes:
   * globalThis
   */
  var declaringGlobalThisProperty: number;
}

export {}
