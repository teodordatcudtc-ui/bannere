import type { Metadata } from "next";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/server';
import { useI18n } from '@/lib/i18n/context';

export const metadata: Metadata = {
  title: "FAQ - Bannerly",
  description: "Întrebări frecvente despre Bannerly - generare bannere cu AI și programare social media",
};

export default async function FAQPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const faqs = [
    {
      question: "Ce este Bannerly?",
      answer: "Bannerly este o platformă care te ajută să generezi bannere profesionale folosind AI și să le programezi automat pe platformele de social media. Economisești timp și creezi conținut de calitate pentru rețelele tale sociale."
    },
    {
      question: "Cum funcționează generarea de bannere?",
      answer: "Descrii ce vrei să promovezi, iar AI-ul nostru creează bannere profesionale în secunde, folosind brand kit-ul tău (logo, culori, stil). Poți genera mai multe variante și alege cea care îți place cel mai mult."
    },
    {
      question: "Ce este un brand kit?",
      answer: "Brand kit-ul este setarea identității tale de brand - logo-ul, culorile principale și secundare, și descrierea business-ului tău. Aceste informații sunt folosite automat de AI pentru a crea bannere care se aliniază cu identitatea ta de brand."
    },
    {
      question: "Cum funcționează sistemul de credite?",
      answer: "1 credit = 1 imagine generată cu AI. 5 credite = 1 postare programată pe social media. Creditele se resetează lunar la data de facturare. Creditele nefolosite nu se transferă în luna următoare."
    },
    {
      question: "Pe ce platforme pot programa postări?",
      answer: "Poți programa postări pe Facebook, Instagram, LinkedIn și TikTok. Conectează conturile tale de social media din setări și apoi programează postările direct din aplicație."
    },
    {
      question: "Pot anula abonamentul în orice moment?",
      answer: "Da, poți anula abonamentul în orice moment din setările contului. Vei continua să ai acces la serviciu până la sfârșitul perioadei de facturare curente."
    },
    {
      question: "Ce se întâmplă cu bannerele generate dacă anulez?",
      answer: "Bannerele generate rămân în contul tău și le poți descărca sau folosi oricând. Nu vei mai putea genera bannere noi sau programa postări după expirarea abonamentului."
    },
    {
      question: "Sunt bannerele generate unice?",
      answer: "Da, fiecare banner generat este unic. AI-ul creează variante originale bazate pe descrierea ta și brand kit-ul tău. Poți genera mai multe variante pentru a alege cea mai potrivită."
    },
    {
      question: "Pot folosi bannerele generate comercial?",
      answer: "Da, ai toate drepturile de proprietate intelectuală asupra bannerelelor generate. Poți le folosi în scopuri comerciale și necomerciale fără restricții."
    },
    {
      question: "Cum pot contacta suportul?",
      answer: "Poți ne contacta la adresa de email: teodordatcu.dtc@gmail.com. Răspundem la toate întrebările în cel mai scurt timp posibil."
    }
  ];

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
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Întrebări Frecvente (FAQ)</h1>
          <p className="text-lg text-gray-600 mb-12">
            Găsește răspunsuri la cele mai comune întrebări despre Bannerly
          </p>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-6 hover:border-[#8B7CFF] transition-colors">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">
                  {faq.question}
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-12 p-6 bg-gradient-to-br from-[#F0F4FF] to-[#E8EDFF] rounded-lg border border-[#8B7CFF]/20">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Nu ai găsit răspunsul căutat?
            </h2>
            <p className="text-gray-700 mb-4">
              Contactează-ne și îți vom răspunde cât mai curând posibil.
            </p>
            <a 
              href="mailto:teodordatcu.dtc@gmail.com" 
              className="text-[#8B7CFF] hover:underline font-medium"
            >
              teodordatcu.dtc@gmail.com
            </a>
          </div>
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
                <li>Despre noi</li>
                <li>Blog</li>
                <li>Contact</li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-4">Suport</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="/faq" className="hover:text-gray-900">FAQ</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 pt-8 text-center text-sm text-gray-600">
            <p>&copy; 2026 Bannerly. Toate drepturile rezervate.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
