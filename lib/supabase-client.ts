import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

export const supabase = (() => {
  try {
    if (supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith("http")) {
      return createClient(supabaseUrl, supabaseAnonKey)
    }
    return null
  } catch (error) {
    console.error("Error creating Supabase client:", error)
    return null
  }
})()

export const isSupabaseConfigured = () => {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.NEXT_PUBLIC_SUPABASE_URL.startsWith("http")
  )
}

export const getSupabaseClient = () => {
  if (!supabase) {
    console.warn("Supabase client not configured. Please check environment variables.")
    return null
  }
  return supabase
}
