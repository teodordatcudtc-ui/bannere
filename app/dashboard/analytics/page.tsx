import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

const MOCK_ENGAGEMENT = [
  { label: 'Post 1', likes: 120, comments: 34, shares: 12, clicks: 80 },
  { label: 'Post 2', likes: 95, comments: 20, shares: 8, clicks: 60 },
  { label: 'Post 3', likes: 180, comments: 56, shares: 24, clicks: 130 },
  { label: 'Post 4', likes: 60, comments: 10, shares: 4, clicks: 40 },
  { label: 'Post 5', likes: 140, comments: 42, shares: 16, clicks: 100 },
  { label: 'Post 6', likes: 210, comments: 70, shares: 30, clicks: 160 },
  { label: 'Post 7', likes: 80, comments: 18, shares: 6, clicks: 55 },
]

export default function AnalyticsPage() {
  const totals = MOCK_ENGAGEMENT.reduce(
    (acc, item) => {
      acc.likes += item.likes
      acc.comments += item.comments
      acc.shares += item.shares
      acc.clicks += item.clicks
      return acc
    },
    { likes: 0, comments: 0, shares: 0, clicks: 0 }
  )

  const maxTotalForScale = Math.max(
    ...MOCK_ENGAGEMENT.map((d) => d.likes + d.comments + d.shares + d.clicks)
  )

  return (
    <div className="space-y-6 md:space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Statistici &amp; engagement Facebook
        </h1>
        <p className="mt-2 text-sm md:text-base text-gray-600 max-w-2xl">
          Pagina de statistici arată performanța postărilor tale de Facebook: reacții, comentarii,
          distribuiri, click-uri și evoluția engagement‑ului în timp. Datele reale vor fi
          încărcate folosind permisiunea <code className="bg-gray-100 px-1 rounded">pages_read_engagement</code>.
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
        <Card className="border-0 bg-white rounded-2xl shadow-sm">
          <CardContent className="p-4 md:p-5">
            <p className="text-xs md:text-sm text-gray-600 mb-1">Total reacții</p>
            <p className="text-2xl md:text-3xl font-bold text-gray-900">{totals.likes}</p>
            <p className="mt-1 text-[11px] md:text-xs text-gray-500">
              👍 Like / ❤️ Love / 😮 Wow etc.
            </p>
          </CardContent>
        </Card>
        <Card className="border-0 bg-white rounded-2xl shadow-sm">
          <CardContent className="p-4 md:p-5">
            <p className="text-xs md:text-sm text-gray-600 mb-1">Comentarii</p>
            <p className="text-2xl md:text-3xl font-bold text-gray-900">{totals.comments}</p>
            <p className="mt-1 text-[11px] md:text-xs text-gray-500">
              Conversații generate de postări
            </p>
          </CardContent>
        </Card>
        <Card className="border-0 bg-white rounded-2xl shadow-sm">
          <CardContent className="p-4 md:p-5">
            <p className="text-xs md:text-sm text-gray-600 mb-1">Distribuiri</p>
            <p className="text-2xl md:text-3xl font-bold text-gray-900">{totals.shares}</p>
            <p className="mt-1 text-[11px] md:text-xs text-gray-500">
              Cât de mult este amplificat conținutul
            </p>
          </CardContent>
        </Card>
        <Card className="border-0 bg-white rounded-2xl shadow-sm">
          <CardContent className="p-4 md:p-5">
            <p className="text-xs md:text-sm text-gray-600 mb-1">Click‑uri pe link / banner</p>
            <p className="text-2xl md:text-3xl font-bold text-gray-900">{totals.clicks}</p>
            <p className="mt-1 text-[11px] md:text-xs text-gray-500">
              Măsoară traficul generat de postări
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Engagement chart */}
      <Card className="border-0 bg-white rounded-2xl shadow-sm">
        <CardHeader className="pb-3 md:pb-4">
          <CardTitle className="text-lg md:text-xl font-bold text-gray-900">
            Evoluția engagement‑ului pe ultimele postări
          </CardTitle>
          <CardDescription className="text-xs md:text-sm text-gray-600">
            Fiecare bară reprezintă o postare de Facebook. Datele reale vor veni din
            <span className="font-semibold"> pages_read_engagement</span> (reach, reactions,
            comments, shares, clicks).
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2 md:pt-4">
          <div className="w-full overflow-x-auto">
            <div className="min-w-[600px]">
              <div className="flex items-end gap-4 md:gap-6 h-56 md:h-64 border-b border-gray-100 pb-6">
                {MOCK_ENGAGEMENT.map((item) => {
                  const total = item.likes + item.comments + item.shares + item.clicks
                  const height = (total / maxTotalForScale) * 100
                  const likesHeight = (item.likes / total) * height
                  const commentsHeight = (item.comments / total) * height
                  const sharesHeight = (item.shares / total) * height
                  const clicksHeight = (item.clicks / total) * height

                  return (
                    <div key={item.label} className="flex flex-col items-center flex-1">
                      <div className="flex flex-col justify-end w-10 md:w-12 h-full gap-0.5">
                        <div
                          className="w-full rounded-t-md bg-blue-500/80"
                          style={{ height: `${likesHeight || 0}%` }}
                          title={`Reacții: ${item.likes}`}
                        />
                        <div
                          className="w-full bg-emerald-500/80"
                          style={{ height: `${commentsHeight || 0}%` }}
                          title={`Comentarii: ${item.comments}`}
                        />
                        <div
                          className="w-full bg-violet-500/80"
                          style={{ height: `${sharesHeight || 0}%` }}
                          title={`Distribuiri: ${item.shares}`}
                        />
                        <div
                          className="w-full rounded-b-md bg-amber-500/80"
                          style={{ height: `${clicksHeight || 0}%` }}
                          title={`Click‑uri: ${item.clicks}`}
                        />
                      </div>
                      <span className="mt-2 text-[11px] md:text-xs text-gray-600 rotate-0">
                        {item.label}
                      </span>
                    </div>
                  )
                })}
              </div>
              <div className="mt-4 flex flex-wrap gap-4 text-[11px] md:text-xs text-gray-600">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-blue-500/80" />
                  <span>Reacții (likes &amp; reactions)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-emerald-500/80" />
                  <span>Comentarii</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-violet-500/80" />
                  <span>Distribuiri</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-amber-500/80" />
                  <span>Click‑uri pe link / banner</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Per-post breakdown table */}
      <Card className="border-0 bg-white rounded-2xl shadow-sm">
        <CardHeader className="pb-3 md:pb-4">
          <CardTitle className="text-lg md:text-xl font-bold text-gray-900">
            Detaliu pe postare
          </CardTitle>
          <CardDescription className="text-xs md:text-sm text-gray-600">
            Aici vei vedea, pentru fiecare postare, statistici exacte venite din API‑ul Facebook:
            număr de reacții, comentarii, distribuiri, click‑uri și reach.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0 md:pt-2">
          <div className="w-full overflow-x-auto">
            <table className="min-w-full text-left text-xs md:text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-gray-500">
                  <th className="py-2 pr-4 font-medium">Postare</th>
                  <th className="py-2 pr-4 font-medium">Reacții</th>
                  <th className="py-2 pr-4 font-medium">Comentarii</th>
                  <th className="py-2 pr-4 font-medium">Distribuiri</th>
                  <th className="py-2 pr-4 font-medium">Click‑uri</th>
                  <th className="py-2 pr-4 font-medium">Engagement total</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_ENGAGEMENT.map((item) => {
                  const total = item.likes + item.comments + item.shares + item.clicks
                  return (
                    <tr key={item.label} className="border-b border-gray-50 hover:bg-gray-50/60">
                      <td className="py-2 pr-4 text-gray-900 font-medium">{item.label}</td>
                      <td className="py-2 pr-4 text-gray-800">{item.likes}</td>
                      <td className="py-2 pr-4 text-gray-800">{item.comments}</td>
                      <td className="py-2 pr-4 text-gray-800">{item.shares}</td>
                      <td className="py-2 pr-4 text-gray-800">{item.clicks}</td>
                      <td className="py-2 pr-4 text-gray-900 font-semibold">{total}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

