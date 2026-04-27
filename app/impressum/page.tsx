import Link from "next/link";
import { Navbar } from "@/components/shared/navbar";

export default function ImpressumPage() {
  return (
    <div className="min-h-screen bg-dark-bg">
      <Navbar />
      <div className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-3xl font-bold text-cream">Impressum</h1>
        <p className="mt-2 text-sm text-gray-text">
          Angaben gem&auml;&szlig; &sect;5 TMG
        </p>

        <div className="mt-10 space-y-8 text-sm leading-relaxed text-cream/80">
          {/* Anbieter */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-cream">Diensteanbieter</h2>
            <p>
              Robin Jost<br />
              Ziegeleigrund 10<br />
              03051 Cottbus<br />
              Deutschland
            </p>
          </section>

          {/* Kontakt */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-cream">Kontakt</h2>
            <p>
              Telefon: +49 176 22789264<br />
              E-Mail:{" "}
              <a href="mailto:jost@ikigai-dynamics.com" className="text-primary hover:text-primary-hover">
                jost@ikigai-dynamics.com
              </a>
            </p>
          </section>

          {/* Berufsbezeichnung */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-cream">Berufsbezeichnung</h2>
            <p>
              Webentwickler<br />
              verliehen in: Deutschland
            </p>
          </section>

          {/* Steuerliche Angaben */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-cream">Steuerliche Angaben</h2>
            <p>
              Robin Jost ist als Freiberufler im Sinne von &sect;18 EStG t&auml;tig.
              Es gilt die Kleinunternehmerregelung nach &sect;19 UStG; es wird keine
              Umsatzsteuer ausgewiesen.
            </p>
          </section>

          {/* Aufsichtsbehörde */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-cream">Aufsichtsbeh&ouml;rde Datenschutz</h2>
            <p>
              Die Landesbeauftragte f&uuml;r den Datenschutz und f&uuml;r das Recht auf Akteneinsicht
              Brandenburg (LDA Brandenburg)<br />
              Stahnsdorfer Damm 77, 14532 Kleinmachnow<br />
              <a href="https://www.lda.brandenburg.de" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary-hover">
                www.lda.brandenburg.de
              </a>
            </p>
          </section>

          {/* Streitschlichtung */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-cream">Streitschlichtung</h2>
            <p>
              Die Europ&auml;ische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{" "}
              <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary-hover">
                https://ec.europa.eu/consumers/odr/
              </a>
            </p>
            <p className="mt-2">Unsere E-Mail-Adresse finden Sie oben im Impressum.</p>
            <p className="mt-2">
              Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer
              Verbraucherschlichtungsstelle teilzunehmen.
            </p>
          </section>

          {/* Haftung für Inhalte */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-cream">Haftung f&uuml;r Inhalte</h2>
            <p>
              Als Diensteanbieter sind wir gem&auml;&szlig; &sect;7 Abs. 1 TMG f&uuml;r eigene Inhalte auf
              diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach &sect;&sect;8 bis 10 TMG sind
              wir als Diensteanbieter jedoch nicht verpflichtet, &uuml;bermittelte oder gespeicherte fremde
              Informationen zu &uuml;berwachen oder nach Umst&auml;nden zu forschen, die auf eine
              rechtswidrige T&auml;tigkeit hinweisen.
            </p>
            <p className="mt-2">
              Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den
              allgemeinen Gesetzen bleiben hiervon unber&uuml;hrt. Eine diesbez&uuml;gliche Haftung ist
              jedoch erst ab dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung m&ouml;glich.
              Bei Bekanntwerden von entsprechenden Rechtsverletzungen werden wir diese Inhalte umgehend
              entfernen.
            </p>
          </section>

          {/* Haftung für Links */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-cream">Haftung f&uuml;r Links</h2>
            <p>
              Unser Angebot enth&auml;lt Links zu externen Websites Dritter, auf deren Inhalte wir keinen
              Einfluss haben. Deshalb k&ouml;nnen wir f&uuml;r diese fremden Inhalte auch keine
              Gew&auml;hr &uuml;bernehmen. F&uuml;r die Inhalte der verlinkten Seiten ist stets der
              jeweilige Anbieter oder Betreiber der Seiten verantwortlich.
            </p>
          </section>

          {/* Urheberrecht */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-cream">Urheberrecht</h2>
            <p>
              Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen
              dem deutschen Urheberrecht. Die Vervielf&auml;ltigung, Bearbeitung, Verbreitung und jede
              Art der Verwertung au&szlig;erhalb der Grenzen des Urheberrechtes bed&uuml;rfen der
              schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
            </p>
          </section>
        </div>

        <div className="mt-12 border-t border-white/[0.06] pt-6 text-xs text-gray-text/40">
          <p>TubeVault &middot; Robin Jost &middot; Cottbus, Deutschland</p>
        </div>

        <div className="mt-4">
          <Link href="/" className="text-sm text-gray-text transition-colors hover:text-cream">
            &larr; Zur&uuml;ck zur Startseite
          </Link>
        </div>
      </div>
    </div>
  );
}
