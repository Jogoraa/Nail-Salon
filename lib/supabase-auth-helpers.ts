import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function createClient() {
  try {
    const cookieStore = await cookies()

    // Verify environment variables exist
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("Missing Supabase environment variables:", {
        url: !!supabaseUrl,
        key: !!supabaseAnonKey,
      })
      throw new Error("Missing Supabase environment variables")
    }

    // Add logging for cookies being read
    const allCookies = cookieStore.getAll()
    console.log(
      "Server-side cookies being read:",
      allCookies.map((c) => ({ name: c.name, value: c.value.substring(0, 10) + "..." })),
    ) // Log first 10 chars of value

    const client = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return allCookies // Use the already fetched cookies
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options: CookieOptions }>) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch (error) {
            // The `cookies().set()` method can only be called in a Server Action or Route Handler
            // This error is safe to ignore if you're only setting cookies in a Server Action or Route Handler
            console.warn("Could not set cookie in server component:", error)
          }
        },
      },
    })

    return client
  } catch (error) {
    console.error("Error creating Supabase client:", error)
    throw error
  }
}
