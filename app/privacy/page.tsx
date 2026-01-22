import type { Metadata } from "next";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: "Politica de Confidențialitate - Bannerly",
  description: "Politica de confidențialitate a platformei Bannerly. Află cum protejăm datele tale personale.",
};

export default async function PrivacyPage() {
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
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Politica de Confidențialitate</h1>
          <p className="text-sm text-gray-600 mb-8">Ultima actualizare: {new Date().toLocaleDateString('ro-RO', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introducere</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              La Bannerly („noi", „nostru", „a noastră"), respectăm confidențialitatea dvs. și ne angajăm să protejăm datele personale pe care ni le furnizați. Această Politică de Confidențialitate explică cum colectăm, utilizăm, dezvăluim și protejăm informațiile dvs. atunci când utilizați platforma noastră („Serviciul").
            </p>
            <p className="text-gray-700 leading-relaxed">
              Utilizând Serviciul, acceptați practicile descrise în această Politică de Confidențialitate. Dacă nu sunteți de acord cu această politică, vă rugăm să nu utilizați Serviciul.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Informații pe care le Colectăm</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">2.1. Informații pe care ni le furnizați direct</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Colectăm informații pe care ni le furnizați direct când:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4 ml-4">
              <li>Vă creați un cont (nume, adresă de email, parolă)</li>
              <li>Completați profilul (nume companie, descriere afacere)</li>
              <li>Configurați brand kit-ul (logo-uri, culori, texte)</li>
              <li>Ne contactați pentru suport (mesaje, întrebări)</li>
              <li>Vă abonați la serviciu (informații de facturare)</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">2.2. Informații colectate automat</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Colectăm automat anumite informații când utilizați Serviciul:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4 ml-4">
              <li><strong>Date de utilizare:</strong> pagini vizitate, timpul petrecut, funcționalități utilizate</li>
              <li><strong>Date tehnice:</strong> adresă IP, tip de browser, sistem de operare, identificatori de dispozitiv</li>
              <li><strong>Cookie-uri și tehnologii similare:</strong> pentru a îmbunătăți experiența și funcționalitatea</li>
              <li><strong>Date de conectare:</strong> timpul și data accesărilor, activități de autentificare</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">2.3. Informații de la terți</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Colectăm informații de la terți când:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4 ml-4">
              <li>Vă conectați conturile de social media (Facebook, Instagram, Twitter, LinkedIn, etc.)</li>
              <li>Utilizați servicii de plată (Stripe, Polar.sh) - procesăm doar informațiile necesare pentru facturare</li>
              <li>Utilizați servicii de autentificare terțe (Google, etc.)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Cum Utilizăm Informațiile</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Utilizăm informațiile colectate pentru:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4 ml-4">
              <li><strong>Furnizarea Serviciului:</strong> generarea de bannere, programarea postărilor, gestionarea contului</li>
              <li><strong>Îmbunătățirea Serviciului:</strong> analiza utilizării, identificarea problemelor, dezvoltarea de funcționalități noi</li>
              <li><strong>Comunicare:</strong> notificări despre serviciu, actualizări importante, răspunsuri la solicitările dvs.</li>
              <li><strong>Facturare:</strong> procesarea plăților, gestionarea abonamentelor</li>
              <li><strong>Securitate:</strong> prevenirea fraudelor, detectarea utilizării neautorizate</li>
              <li><strong>Conformitate legală:</strong> respectarea obligațiilor legale și de reglementare</li>
              <li><strong>Marketing:</strong> trimiterea de comunicări despre funcționalități noi (doar cu consimțământul dvs.)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Partajarea Informațiilor</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Nu vindem datele dvs. personale. Putem partaja informațiile în următoarele situații:
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">4.1. Furnizori de servicii</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Partajăm date cu furnizori terți care ne ajută să operăm Serviciul:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4 ml-4">
              <li><strong>Supabase:</strong> hosting bazei de date și autentificare</li>
              <li><strong>Stripe/Polar.sh:</strong> procesare plăți</li>
              <li><strong>Servicii de cloud computing:</strong> hosting și infrastructură</li>
              <li><strong>Servicii de analiză:</strong> pentru a înțelege utilizarea platformei</li>
              <li><strong>Servicii de email:</strong> pentru trimiterea de notificări</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mb-4">
              Acești furnizori au acces doar la informațiile necesare pentru a-și îndeplini funcțiile și sunt obligați să protejeze datele dvs.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">4.2. Platforme de social media</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Când vă conectați conturile de social media, partajăm doar informațiile necesare pentru a publica conținut în numele dvs., conform permisiunilor acordate.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">4.3. Cerințe legale</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Putem dezvălui informații dacă suntem obligați legal sau dacă credem în bună credință că este necesar pentru:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4 ml-4">
              <li>Respectarea legilor, reglementărilor sau proceselor legale</li>
              <li>Protecția drepturilor, proprietății sau siguranței noastre sau ale utilizatorilor</li>
              <li>Prevenirea sau investigarea activităților frauduloase sau ilegale</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">4.4. Transferuri de afaceri</h3>
            <p className="text-gray-700 leading-relaxed">
              În cazul unei fuziuni, achiziții sau vânzări de active, datele dvs. pot fi transferate ca parte a tranzacției, cu notificare prealabilă.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Securitatea Datelor</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Implementăm măsuri de securitate tehnice și organizaționale pentru a proteja datele dvs.:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4 ml-4">
              <li>Criptare a datelor în tranzit (HTTPS/TLS)</li>
              <li>Criptare a datelor sensibile la repaus</li>
              <li>Autentificare cu parolă securizată și autentificare cu doi factori (2FA) opțională</li>
              <li>Acces restricționat la date doar pentru personalul autorizat</li>
              <li>Monitorizare regulată a securității și actualizări de securitate</li>
              <li>Backup-uri regulate ale datelor</li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              Cu toate acestea, nicio metodă de transmisie sau stocare electronică nu este 100% sigură. Deși ne străduim să protejăm datele dvs., nu putem garanta securitatea absolută.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Drepturile Dvs. (GDPR)</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Conform Regulamentului General privind Protecția Datelor (GDPR), aveți următoarele drepturi:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4 ml-4">
              <li><strong>Dreptul de acces:</strong> puteți solicita o copie a datelor personale pe care le deținem despre dvs.</li>
              <li><strong>Dreptul la rectificare:</strong> puteți solicita corectarea datelor inexacte sau incomplete</li>
              <li><strong>Dreptul la ștergere:</strong> puteți solicita ștergerea datelor dvs. în anumite circumstanțe</li>
              <li><strong>Dreptul la restricționarea procesării:</strong> puteți solicita limitarea utilizării datelor dvs.</li>
              <li><strong>Dreptul la portabilitatea datelor:</strong> puteți solicita transferul datelor dvs. către alt serviciu</li>
              <li><strong>Dreptul de opoziție:</strong> puteți vă opune procesării datelor dvs. în anumite circumstanțe</li>
              <li><strong>Dreptul de a retrage consimțământul:</strong> puteți retrage consimțământul pentru procesarea datelor în orice moment</li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              Pentru a exercita oricare dintre aceste drepturi, vă rugăm să ne contactați la <a href="mailto:privacy@socialpilot.com" className="text-[#8B7CFF] hover:underline">privacy@socialpilot.com</a>. Vom răspunde în termen de 30 de zile.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Cookie-uri și Tehnologii Similare</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Utilizăm cookie-uri și tehnologii similare pentru:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4 ml-4">
              <li>Autentificare și securitate (sesiuni de utilizator)</li>
              <li>Preferințe (setări de limbă, temă)</li>
              <li>Analiză (înțelegerea utilizării platformei)</li>
              <li>Funcționalitate (îmbunătățirea experienței utilizatorului)</li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              Puteți controla cookie-urile prin setările browserului dvs. Rețineți că dezactivarea anumitor cookie-uri poate afecta funcționalitatea Serviciului.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Stocarea Datelor</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Stocăm datele dvs. personale atât timp cât este necesar pentru a vă furniza Serviciul și pentru a ne îndeplini obligațiile legale. Criteriile pentru perioada de păstrare includ:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4 ml-4">
              <li>Durata abonamentului dvs. activ</li>
              <li>Cerințele legale de păstrare (de ex., pentru facturare)</li>
              <li>Necesitatea de a rezolva dispute sau de a aplica acordurile</li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              După ștergerea contului, vom șterge sau anonimiza datele dvs. personale în termen de 30 de zile, cu excepția cazurilor în care legea ne cere să le păstrăm mai mult timp.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Dreptul la Ștergerea Datelor</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Conform GDPR și cerințelor Facebook, aveți dreptul să solicitați ștergerea datelor dvs. personale în orice moment. Vă oferim mai multe modalități de a vă exercita acest drept:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4 ml-4">
              <li>Prin aplicație: Mergi la Dashboard → Settings și click pe "Șterge Cont"</li>
              <li>Prin email: Trimite o cerere la adresa de email de contact</li>
              <li>Prin Facebook: Șterge aplicația din setările Facebook</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mb-4">
              Pentru instrucțiuni detaliate despre cum să vă ștergeți datele, vă rugăm să consultați pagina dedicată:
            </p>
            <p className="text-gray-700 leading-relaxed">
              <Link href="/data-deletion" className="text-[#8B7CFF] hover:underline font-medium">
                → Instrucțiuni pentru ștergerea datelor
              </Link>
            </p>
            <p className="text-gray-700 leading-relaxed mt-4">
              Vom procesa cererea dvs. de ștergere în termen de 30 de zile, cu excepția cazurilor în care legea ne cere să păstrăm anumite date (de ex., pentru facturare sau obligații legale).
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Transferuri Internaționale</h2>
            <p className="text-gray-700 leading-relaxed">
              Datele dvs. pot fi procesate și stocate în țări din afara Zonei Economice Europene (ZEE). În astfel de cazuri, ne asigurăm că există garanții adecvate de protecție a datelor, inclusiv clauze contractuale standard aprobate de Comisia Europeană sau alte mecanisme legale de protecție.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Copii</h2>
            <p className="text-gray-700 leading-relaxed">
              Serviciul nu este destinat persoanelor sub 18 ani. Nu colectăm în mod intenționat date personale de la copii. Dacă descoperim că am colectat date de la un copil fără consimțământul părinților, vom șterge aceste informații imediat.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Modificări ale Politicii</h2>
            <p className="text-gray-700 leading-relaxed">
              Ne rezervăm dreptul de a modifica această Politică de Confidențialitate în orice moment. Vom notifica utilizatorii despre modificări importante prin email sau prin notificare pe platformă. Modificările vor intra în vigoare imediat după publicare. Utilizarea continuă a Serviciului după modificări constituie acceptarea noii Politici.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Autoritatea de Supraveghere</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Dacă considerați că procesarea datelor dvs. personale încalcă GDPR-ul, aveți dreptul de a depune o plângere la autoritatea de supraveghere din țara dvs. de reședință sau la Autoritatea Națională de Supraveghere a Prelucrării Datelor cu Caracter Personal (ANSPDCP) din România.
            </p>
            <p className="text-gray-700 leading-relaxed">
              <strong>ANSPDCP:</strong><br />
              B-dul G-ral. Gheorghe Magheru 28-30<br />
              Sector 1, București, România<br />
              Tel: +40.318.059.211<br />
              Email: <a href="mailto:anspdcp@dataprotection.ro" className="text-[#8B7CFF] hover:underline">anspdcp@dataprotection.ro</a>
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">14. Contact</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Pentru întrebări, solicitări sau preocupări despre această Politică de Confidențialitate sau despre modul în care procesăm datele dvs., vă rugăm să ne contactați:
            </p>
            <p className="text-gray-700 leading-relaxed">
              <strong>Bannerly</strong><br />
              Email: <a href="mailto:privacy@bannerly.com" className="text-[#8B7CFF] hover:underline">privacy@bannerly.com</a><br />
              Responsabil cu protecția datelor: <a href="mailto:dpo@bannerly.com" className="text-[#8B7CFF] hover:underline">dpo@bannerly.com</a>
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
                <li><Link href="/data-deletion" className="hover:text-gray-900">Ștergere Date</Link></li>
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
