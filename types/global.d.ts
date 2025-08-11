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

declare module "react-day-picker" {
  export * from "react-day-picker/dist/index"
}

declare module "cmdk" {
  export * from "cmdk/dist/index"
}

declare module "vaul" {
  export * from "vaul/dist/index"
}

declare module "input-otp" {
  export * from "input-otp/dist/index"
}

declare module "react-resizable-panels" {
  export * from "react-resizable-panels/dist/index"
}

declare module "sonner" {
  export * from "sonner/dist/index"
}

declare module "recharts" {
  export * from "recharts/es6/index"
}

export {}
