import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Ștergere Date Utilizator - Bannerly',
  description: 'Instrucțiuni pentru ștergerea datelor utilizatorului',
}

export default function DataDeletionPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Ștergere Date Utilizator
          </h1>

          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">
              Conform cerințelor Facebook și GDPR, oferim utilizatorilor posibilitatea de a-și șterge datele din aplicația noastră.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
              Ce date stocăm?
            </h2>
            <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
              <li>Informații de profil (nume, email) de la Facebook</li>
              <li>Conturi sociale conectate (Facebook, Instagram, LinkedIn, etc.)</li>
              <li>Postări programate și istoricul postărilor</li>
              <li>Preferințe și setări ale aplicației</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
              Cum să-ți ștergi datele?
            </h2>
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
              <p className="text-gray-700">
                <strong>Opțiunea 1: Prin aplicație (Recomandat)</strong>
              </p>
              <ol className="list-decimal list-inside mt-2 space-y-2 text-gray-600">
                <li>Loghează-te în contul tău</li>
                <li>Mergi la <strong>Dashboard</strong> → <strong>Settings</strong></li>
                <li>Click pe butonul <strong>"Șterge Cont"</strong> sau <strong>"Delete Account"</strong></li>
                <li>Confirmă ștergerea</li>
                <li>Toate datele tale vor fi șterse permanent în termen de 30 de zile</li>
              </ol>
            </div>

            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
              <p className="text-gray-700">
                <strong>Opțiunea 2: Prin email</strong>
              </p>
              <ol className="list-decimal list-inside mt-2 space-y-2 text-gray-600">
                <li>Trimite un email la <a href="mailto:support@yourdomain.com" className="text-blue-600 hover:underline">support@yourdomain.com</a></li>
                <li>Subiect: <strong>"Cerere Ștergere Date - [Numele tău]"</strong></li>
                <li>Include în email:
                  <ul className="list-disc list-inside ml-6 mt-2">
                    <li>Numele complet</li>
                    <li>Adresa de email asociată contului</li>
                    <li>Facebook User ID (opțional, dar recomandat)</li>
                  </ul>
                </li>
                <li>Vom procesa cererea în termen de 30 de zile</li>
              </ol>
            </div>

            <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
              <p className="text-gray-700">
                <strong>Opțiunea 3: Prin Facebook</strong>
              </p>
              <ol className="list-decimal list-inside mt-2 space-y-2 text-gray-600">
                <li>Mergi la <a href="https://www.facebook.com/settings?tab=applications" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Facebook Settings → Apps and Websites</a></li>
                <li>Găsește aplicația noastră în listă</li>
                <li>Click pe <strong>"Remove"</strong> sau <strong>"Șterge"</strong></li>
                <li>Confirmă ștergerea</li>
                <li>Datele tale vor fi șterse din aplicația noastră în termen de 30 de zile</li>
              </ol>
            </div>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
              Ce se întâmplă după ștergere?
            </h2>
            <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
              <li>Toate datele tale personale vor fi șterse permanent</li>
              <li>Conturile sociale conectate vor fi deconectate</li>
              <li>Postările programate vor fi anulate</li>
              <li>Nu vei mai putea accesa contul</li>
              <li>Procesul de ștergere poate dura până la 30 de zile (conform GDPR)</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
              Facebook User ID
            </h2>
            <p className="text-gray-600 mb-4">
              Pentru a identifica rapid contul tău, poți găsi Facebook User ID-ul tău:
            </p>
            <ol className="list-decimal list-inside text-gray-600 mb-6 space-y-2">
              <li>Mergi la <a href="https://www.facebook.com/help/contact/571927962160809" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Facebook Help Center</a></li>
              <li>Sau folosește un tool online pentru a găsi User ID-ul tău</li>
              <li>Include acest ID în cererea ta de ștergere pentru procesare mai rapidă</li>
            </ol>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
              Contact
            </h2>
            <p className="text-gray-600 mb-4">
              Dacă ai întrebări despre procesul de ștergere a datelor, contactează-ne:
            </p>
            <ul className="list-none text-gray-600 space-y-2">
              <li>
                <strong>Email:</strong>{' '}
                <a href="mailto:support@yourdomain.com" className="text-blue-600 hover:underline">
                  support@yourdomain.com
                </a>
              </li>
              <li>
                <strong>Timp de răspuns:</strong> 24-48 ore
              </li>
            </ul>

          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <Link
              href="/privacy"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              ← Înapoi la Politica de Confidențialitate
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
