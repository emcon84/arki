export default function AdminLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fafafa] dark:bg-black">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#0070f3] border-t-transparent" />
        <p className="text-sm text-[#888888]">Loading admin…</p>
      </div>
    </div>
  )
}
