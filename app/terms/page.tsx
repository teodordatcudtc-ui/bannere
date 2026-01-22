import type { Metadata } from "next";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: "Termeni și Condiții - Bannerly",
  description: "Termenii și condițiile de utilizare ale platformei Bannerly",
};

export default async function TermsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/">
            <h1 className="text-xl font-bold text-gray-900">Bannerly</h1>
          </Link>
          <div className="flex gap-3">
            {user ? (
              <Link href="/dashboard">
                <Button className="bg-gray-900 hover:bg-gray-800 text-white">
                  Mergi la Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost" className="text-gray-700 hover:text-gray-900">
                    Autentificare
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button className="bg-gray-900 hover:bg-gray-800 text-white">
                    Începe acum
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="container mx-auto px-6 py-12 max-w-4xl">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Termeni și Condiții</h1>
          <p className="text-sm text-gray-600 mb-8">Ultima actualizare: {new Date().toLocaleDateString('ro-RO', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptarea Termenilor</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Prin accesarea și utilizarea platformei Bannerly („Serviciul"), acceptați să fiți legați de acești Termeni și Condiții („Termeni"). Dacă nu sunteți de acord cu oricare dintre acești termeni, nu aveți permisiunea de a accesa sau utiliza Serviciul.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Bannerly este o platformă SaaS care oferă servicii de generare de bannere cu AI și programare automată pe platformele de social media. Utilizând Serviciul, confirmați că aveți cel puțin 18 ani sau că aveți consimțământul unui părinte sau tutore legal.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Descrierea Serviciului</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Bannerly oferă următoarele servicii:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4 ml-4">
              <li>Generare de bannere publicitare folosind tehnologie AI</li>
              <li>Configurare și gestionare a brand kit-ului (logo, culori, descriere)</li>
              <li>Programare automată a postărilor pe platformele de social media conectate</li>
              <li>Gestionare a conturilor de social media conectate</li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              Ne rezervăm dreptul de a modifica, suspenda sau întrerupe orice aspect al Serviciului în orice moment, cu sau fără notificare prealabilă.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Conturi și Înregistrare</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Pentru a utiliza anumite funcționalități ale Serviciului, trebuie să vă creați un cont. Vă angajați să:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4 ml-4">
              <li>Furnizați informații exacte, complete și actualizate</li>
              <li>Mențineți și actualizați prompt informațiile contului</li>
              <li>Mențineți securitatea contului și parolei</li>
              <li>Notificați-ne imediat despre orice utilizare neautorizată a contului</li>
              <li>Acceptați responsabilitatea pentru toate activitățile care au loc sub contul dvs.</li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              Vă rezervăm dreptul de a suspenda sau închide contul dvs. dacă descoperim că informațiile furnizate sunt false, incomplete sau înșelătoare.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Sistemul de Credite</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Serviciul funcționează pe baza unui sistem de credite:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4 ml-4">
              <li>1 credit = 1 imagine generată cu AI</li>
              <li>5 credite = 1 postare programată</li>
              <li>Creditele se resetează lunar la data de facturare</li>
              <li>Creditele nefolosite nu se transferă în luna următoare</li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              Ne rezervăm dreptul de a modifica sistemul de credite sau prețurile în orice moment, cu notificare prealabilă de cel puțin 30 de zile.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Abonamente și Plăți</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Serviciul este oferit prin abonamente lunare. Prin înregistrarea pentru un abonament, acceptați să plătiți taxele asociate planului ales. Plățile sunt procesate prin servicii terțe (Stripe, Polar.sh).
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              <strong>Politica de rambursare:</strong> Toate plățile sunt finale și nu sunt rambursabile, cu excepția cazurilor prevăzute de lege. Dacă anulați abonamentul, veți continua să aveți acces la Serviciu până la sfârșitul perioadei de facturare curente.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Vă rezervăm dreptul de a modifica prețurile abonamentelor cu notificare prealabilă de cel puțin 30 de zile. Modificările de preț vor intra în vigoare la următoarea perioadă de facturare.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Proprietate Intelectuală</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              <strong>Conținut generat:</strong> Vă acordăm toate drepturile de proprietate intelectuală asupra bannerelelor și imaginilor generate prin intermediul Serviciului. Puteți utiliza acest conținut în scopuri comerciale și necomerciale.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              <strong>Platforma Bannerly:</strong> Toate drepturile de proprietate intelectuală asupra platformei, inclusiv designul, codul, logo-urile și marca Bannerly, rămân proprietatea noastră sau a licențiatorilor noștri.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Nu aveți permisiunea de a copia, modifica, distribui, vinde sau licenția orice parte a Serviciului fără consimțământul nostru scris prealabil.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Conținut Utilizator</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Prin încărcarea sau furnizarea de conținut (inclusiv logo-uri, imagini, texte) pe platformă, ne acordați o licență neexclusivă, mondială, gratuită și transferabilă de a utiliza, stoca și procesa acest conținut în scopul furnizării Serviciului.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              Vă angajați că:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4 ml-4">
              <li>Aveți toate drepturile necesare pentru a ne acorda această licență</li>
              <li>Conținutul nu încalcă drepturile de proprietate intelectuală ale terților</li>
              <li>Conținutul nu este ilegal, ofensator sau înșelător</li>
              <li>Conținutul nu conține malware sau cod malițios</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Conectarea Conturilor de Social Media</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Serviciul permite conectarea conturilor dvs. de social media pentru programarea automată a postărilor. Prin conectarea unui cont, acordați permisiunea Bannerly de a:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4 ml-4">
              <li>Publica conținut în numele dvs. pe platformele conectate</li>
              <li>Accesa informații de bază despre contul dvs.</li>
              <li>Gestiona postările programate</li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              Vă puteți deconecta de la orice platformă de social media în orice moment din setările contului. Ne angajăm să respectăm politicile și termenii platformelor de social media cu care ne integrăm.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Utilizare Acceptabilă</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Vă angajați să NU utilizați Serviciul pentru:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4 ml-4">
              <li>Orice activitate ilegală sau frauduloasă</li>
              <li>Transmiterea de spam sau mesaje neautorizate</li>
              <li>Încălcarea drepturilor de proprietate intelectuală</li>
              <li>Distribuirea de conținut malițios, virusi sau cod dăunător</li>
              <li>Încercarea de a accesa neautorizat sistemele noastre sau ale terților</li>
              <li>Utilizarea Serviciului într-un mod care ar putea deteriora, suprasolicita sau afecta funcționarea platformei</li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              Încălcarea acestor reguli poate duce la suspendarea sau închiderea imediată a contului dvs., fără rambursare.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Limitarea Răspunderii</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              SERVICIUL ESTE FURNIZAT „AȘA CUM ESTE" ȘI „CONFORM DISPONIBILITĂȚII", FĂRĂ GARANȚII DE ORICE FEL, EXPRIMATE SAU IMPLICITE. NU GARANTĂM CĂ:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4 ml-4">
              <li>Serviciul va fi neîntrerupt, sigur sau lipsit de erori</li>
              <li>Rezultatele obținute prin utilizarea Serviciului vor îndeplini așteptările dvs.</li>
              <li>Erorile vor fi corectate</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mb-4">
              În măsura permisă de lege, NU VOM FI RĂSPUNZĂTORI PENTRU:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4 ml-4">
              <li>Pierderi indirecte, incidentale, speciale, consecvente sau punitive</li>
              <li>Pierderea de profituri, date, utilizare, bunăvoință sau alte pierderi intangibile</li>
              <li>Daune rezultate din utilizarea sau imposibilitatea utilizării Serviciului</li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              Răspunderea noastră totală nu va depăși suma plătită de dvs. în ultimele 12 luni pentru Serviciu.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Rezilierea</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Puteți anula abonamentul dvs. în orice moment din setările contului. După anulare, veți continua să aveți acces la Serviciu până la sfârșitul perioadei de facturare curente.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              Ne rezervăm dreptul de a suspenda sau închide contul dvs. imediat, fără notificare prealabilă, dacă:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4 ml-4">
              <li>Încălcați oricare dintre acești Termeni</li>
              <li>Utilizați Serviciul într-un mod ilegal sau fraudulos</li>
              <li>Nu plătiți taxele datorate</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Modificări ale Termenilor</h2>
            <p className="text-gray-700 leading-relaxed">
              Ne rezervăm dreptul de a modifica acești Termeni în orice moment. Vom notifica utilizatorii despre modificări importante prin email sau prin notificare pe platformă. Utilizarea continuă a Serviciului după modificări constituie acceptarea noilor Termeni.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Legea Aplicabilă</h2>
            <p className="text-gray-700 leading-relaxed">
              Acești Termeni sunt guvernați de și interpretați în conformitate cu legile României. Orice dispute vor fi rezolvate exclusiv de instanțele competente din România.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">14. Contact</h2>
            <p className="text-gray-700 leading-relaxed">
              Pentru întrebări despre acești Termeni, vă rugăm să ne contactați la:
            </p>
            <p className="text-gray-700 leading-relaxed mt-2">
              Email: <a href="mailto:legal@socialpilot.com" className="text-[#8B7CFF] hover:underline">legal@socialpilot.com</a>
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Bannerly</h3>
              <p className="text-sm text-gray-600">
                Soluția completă pentru generarea și programarea bannerelor de social media.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="/terms" className="hover:text-gray-900">Termeni și Condiții</Link></li>
                <li><Link href="/privacy" className="hover:text-gray-900">Politica de Confidențialitate</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-4">Companie</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="#" className="hover:text-gray-900">Despre noi</Link></li>
                <li><Link href="#" className="hover:text-gray-900">Blog</Link></li>
                <li><Link href="#contact" className="hover:text-gray-900">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-4">Suport</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="#" className="hover:text-gray-900">Documentație</Link></li>
                <li><Link href="#" className="hover:text-gray-900">FAQ</Link></li>
                <li><Link href="#" className="hover:text-gray-900">Asistență</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 pt-8 text-center text-sm text-gray-600">
            <p>&copy; 2024 Bannerly. Toate drepturile rezervate.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
