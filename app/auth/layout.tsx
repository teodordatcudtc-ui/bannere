// Force dynamic rendering for all auth pages to prevent build-time pre-rendering
export const dynamic = 'force-dynamic'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
