import { Link } from "react-router-dom"
import { Compass } from "lucide-react"

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 text-center">
      <Compass size={48} className="mb-4 text-ocean-950/20" />
      <h1 className="font-display text-4xl font-bold text-ocean-950">404</h1>
      <p className="mt-2 text-sm text-ocean-950/60">Looks like this trail doesn't exist. Let's get you back on route.</p>
      <Link to="/" className="mt-6 rounded-full bg-ocean-600 px-6 py-3 text-sm font-bold text-white hover:bg-ocean-700">
        Back to Home
      </Link>
    </div>
  )
}
