declare global {
  interface Window {
    // Add any window properties that might be used
    webkitAudioContext?: typeof AudioContext
  }
}

// Three.js module augmentation
declare module "three" {
  interface Object3D {
    userData: any
  }
}

// React Three Fiber types
declare module "@react-three/fiber" {
  interface ThreeElements {
    // Add any custom three.js elements if needed
  }
}

export {}
