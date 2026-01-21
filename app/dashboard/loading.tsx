export default function DashboardLoading() {
  return (
    <div className="space-y-7 animate-pulse">
      {/* Header skeleton */}
      <div>
        <div className="h-9 w-64 bg-gray-200 rounded-lg mb-2"></div>
        <div className="h-5 w-96 bg-gray-200 rounded-lg"></div>
      </div>

      {/* Statistics cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="border-0 bg-white rounded-2xl shadow-sm p-5">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="h-4 w-32 bg-gray-200 rounded mb-3"></div>
                <div className="h-8 w-20 bg-gray-200 rounded"></div>
              </div>
              <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick actions skeleton */}
      <div className="grid md:grid-cols-2 gap-5">
        {[1, 2].map((i) => (
          <div key={i} className="border-0 bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="w-16 h-16 bg-gray-200 rounded-xl"></div>
              <div className="w-5 h-5 bg-gray-200 rounded"></div>
            </div>
            <div className="h-6 w-48 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 w-64 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>

      {/* Content skeleton */}
      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-1 border-0 bg-white rounded-2xl shadow-sm p-6">
          <div className="h-6 w-40 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                  <div className="h-4 w-24 bg-gray-200 rounded"></div>
                </div>
                <div className="h-5 w-8 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
        <div className="lg:col-span-2 border-0 bg-white rounded-2xl shadow-sm p-6">
          <div className="h-6 w-40 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4 p-3">
                <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-4 w-48 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 w-32 bg-gray-200 rounded"></div>
                </div>
                <div className="flex gap-1.5">
                  <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
                  <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
