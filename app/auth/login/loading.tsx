import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-gray-900 p-4">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-black dark:text-white" />
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-black dark:text-white">Signing you in</h2>
          <p className="text-gray-600 dark:text-gray-400">Please wait while we prepare your account...</p>
        </div>
      </div>
    </div>
  )
}
