declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext
    paypal?: any
  }

  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_SUPABASE_URL: string
      NEXT_PUBLIC_SUPABASE_ANON_KEY: string
      SUPABASE_SERVICE_ROLE_KEY: string
      jelly: string
      [key: string]: string | undefined
    }
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
    // Custom three.js elements
  }
}

declare module "*.glsl" {
  const content: string
  export default content
}

declare module "*.vs" {
  const content: string
  export default content
}

declare module "*.fs" {
  const content: string
  export default content
}

declare module "zustand" {
  export interface StoreApi<T> {
    getState: () => T
    setState: (partial: T | Partial<T> | ((state: T) => T | Partial<T>)) => void
    subscribe: (listener: (state: T, prevState: T) => void) => () => void
  }
}

export {}
