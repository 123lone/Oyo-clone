export const config = {
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
  },
  paypal: {
    clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "",
  },
}

export const isPayPalConfigured = () => {
  return config.paypal.clientId && config.paypal.clientId !== "YOUR_PAYPAL_CLIENT_ID"
}

export const isSupabaseConfigured = () => {
  return config.supabase.url && config.supabase.anonKey
}
