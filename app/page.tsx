import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-6xl font-bold text-gray-900 mb-6">
            Tramisu
          </h1>
          <p className="text-2xl text-gray-600 mb-4">
            Your startup command center
          </p>
          <p className="text-lg text-gray-500 mb-12 max-w-2xl mx-auto">
            Manage your entire growth journey from pre-launch checklists to post-launch metrics,
            all in one beautiful dashboard.
          </p>
          
          <div className="flex gap-4 justify-center">
            <Link
              href="/signup"
              className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
            >
              Get Started
            </Link>
            <Link
              href="/login"
              className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:border-gray-400 transition-colors"
            >
              Sign In
            </Link>
          </div>

          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="text-3xl mb-3">📋</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Pre-Launch</h3>
              <p className="text-gray-600 text-sm">
                Track readiness with checklists and action items
              </p>
            </div>
            
            <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="text-3xl mb-3">📊</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Metrics</h3>
              <p className="text-gray-600 text-sm">
                Monitor DAU, MRR, retention, and activation funnels
              </p>
            </div>
            
            <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="text-3xl mb-3">🚀</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Growth</h3>
              <p className="text-gray-600 text-sm">
                Set goals and track weekly progress routines
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
