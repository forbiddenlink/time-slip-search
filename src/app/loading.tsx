/**
 * Root loading state for the application.
 * Displayed during initial page load and route transitions.
 */
export default function Loading() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="ed-sheet ed-printing w-full max-w-md px-5 py-10 text-center" role="status" aria-label="Loading">
        <p className="ed-label text-faded">Going to press</p>
        <h1 className="mt-2 font-display text-3xl italic">Loading</h1>
        <div className="ed-roller mt-4" aria-hidden="true" />
      </div>
    </main>
  )
}
