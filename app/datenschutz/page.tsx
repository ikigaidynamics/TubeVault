import Link from "next/link";
import { Navbar } from "@/components/shared/navbar";

export default function DatenschutzPage() {
  return (
    <div className="min-h-screen bg-dark-bg">
      <Navbar />
      <div className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-3xl font-bold text-cream">Datenschutzerkl&auml;rung</h1>
        <p className="mt-2 text-sm text-gray-text">
          TubeVault &middot; tubevault.io
          <br />
          Letzte Aktualisierung: 3. Mai 2026 &middot; Betreiber: Robin Jost, Cottbus, Deutschland
        </p>

        <p className="mt-4 flex gap-4 text-sm text-gray-text">
          <Link href="/privacy" className="text-primary hover:text-primary-hover">
            English version &rarr;
          </Link>
          <Link href="/impressum" className="text-primary hover:text-primary-hover">
            Impressum &rarr;
          </Link>
        </p>

        <div className="mt-10 space-y-8 text-sm leading-relaxed text-cream/80">
          {/* 1 */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-cream">1. Verantwortlicher</h2>
            <p>
              Verantwortlicher im Sinne von Art. 4 Nr. 7 DSGVO:
            </p>
            <p className="mt-2">
              Robin Jost<br />
              Ziegeleigrund 10, 03051 Cottbus, Deutschland<br />
              Telefon: +49 176 22789264<br />
              E-Mail:{" "}
              <a href="mailto:jost@ikigai-dynamics.com" className="text-primary hover:text-primary-hover">
                jost@ikigai-dynamics.com
              </a><br />
              Website:{" "}
              <a href="https://tubevault.io" className="text-primary hover:text-primary-hover">
                https://tubevault.io
              </a>
            </p>
            <p className="mt-2">
              Hinweis: Robin Jost ist als Freiberufler im Sinne von &sect;18 EStG t&auml;tig und beim
              Finanzamt Cottbus gemeldet. Es gilt die Kleinunternehmerregelung gem&auml;&szlig; &sect;19 UStG;
              es wird keine Umsatzsteuer ausgewiesen. Eine Gewerbeanmeldung ist f&uuml;r freiberufliche
              T&auml;tigkeit nach deutschem Recht nicht erforderlich. Die Bestellung eines
              Datenschutzbeauftragten nach Art. 37 DSGVO ist aufgrund der Art und des Umfangs der
              Verarbeitungst&auml;tigkeiten nicht erforderlich.
            </p>
          </section>

          {/* 2 */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-cream">2. &Uuml;bersicht der verarbeiteten Daten</h2>
            <p>Bei der Nutzung von TubeVault verarbeiten wir folgende Kategorien personenbezogener Daten:</p>
            <ul className="ml-4 mt-2 list-disc space-y-1.5">
              <li><strong className="text-cream">Kontaktdaten:</strong> E-Mail-Adresse (bei Registrierung)</li>
              <li><strong className="text-cream">Profildaten:</strong> Name und Profilbild (bei Anmeldung &uuml;ber Google OAuth)</li>
              <li><strong className="text-cream">Konversationsdaten:</strong> Chatverlauf einschlie&szlig;lich Ihrer Fragen, KI-generierter Antworten, Quellenverweise und Zeitstempel (siehe Abschnitt 5a)</li>
              <li><strong className="text-cream">Nutzungsdaten:</strong> Suchanfragen, Kanal-Interaktionen, Feature-Nutzung, Conversion-Events</li>
              <li><strong className="text-cream">Technische Daten:</strong> IP-Adresse (in Server-Logs), Browser-Informationen</li>
              <li><strong className="text-cream">Zahlungsdaten:</strong> Werden ausschlie&szlig;lich von Stripe verarbeitet &mdash; wir erhalten oder speichern keine Zahlungskartendaten</li>
              <li><strong className="text-cream">Technische Kennungen:</strong> Gehashte Ger&auml;temerkmale f&uuml;r anonyme Nutzer (kein persistentes Tracking)</li>
              <li><strong className="text-cream">Attributionsdaten:</strong> UTM-Parameter, Referrer-URL, Landingpage-Variante (nur mit Einwilligung)</li>
              <li><strong className="text-cream">Persistente Session-Kennung:</strong> tv_session_id f&uuml;r Attribution (nur mit Einwilligung)</li>
              <li><strong className="text-cream">Einwilligungsprotokolle:</strong> Welche Kategorien akzeptiert wurden, Zeitstempel, IP-gehasht (f&uuml;r DSGVO Art. 7 Nachweispflicht)</li>
            </ul>
          </section>

          {/* 3 */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-cream">3. Rechtsgrundlagen der Verarbeitung</h2>
            <p>Wir verarbeiten personenbezogene Daten auf folgenden Rechtsgrundlagen:</p>
            <ul className="ml-4 mt-2 list-disc space-y-1.5">
              <li><strong className="text-cream">Art. 6 Abs. 1 lit. b DSGVO</strong> &mdash; Verarbeitung zur Vertragserf&uuml;llung (Bereitstellung der Plattform, Verwaltung von Abonnements)</li>
              <li><strong className="text-cream">Art. 6 Abs. 1 lit. c DSGVO</strong> &mdash; Verarbeitung zur Erf&uuml;llung rechtlicher Verpflichtungen (Aufbewahrungspflichten nach Handels- und Steuerrecht)</li>
              <li><strong className="text-cream">Art. 6 Abs. 1 lit. f DSGVO</strong> &mdash; Verarbeitung auf Grundlage berechtigter Interessen (IT-Sicherheit, Missbrauchspr&auml;vention, Produktanalyse, Server-Logs)</li>
              <li><strong className="text-cream">Art. 6 Abs. 1 lit. a DSGVO</strong> &mdash; Einwilligung (soweit ausdr&uuml;cklich erteilt, z.&thinsp;B. Marketing-E-Mails)</li>
            </ul>
          </section>

          {/* 4 */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-cream">4. Registrierung und Nutzerkonto</h2>

            <h3 className="mb-2 mt-4 text-base font-medium text-cream">4.1 E-Mail-Registrierung</h3>
            <p>
              Zur Erstellung eines Kontos erheben wir Ihre E-Mail-Adresse und ein von Ihnen gew&auml;hltes
              Passwort. Diese Daten werden &uuml;ber Supabase Auth verarbeitet und gespeichert (siehe Abschnitt 12).
            </p>
            <p className="mt-1">Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO</p>
            <p>Speicherdauer: F&uuml;r die Dauer des Vertragsverh&auml;ltnisses; jederzeit l&ouml;schbar auf Anfrage (Abschnitt 15).</p>

            <h3 className="mb-2 mt-4 text-base font-medium text-cream">4.2 Google OAuth (Single Sign-On)</h3>
            <p>
              Alternativ k&ouml;nnen Sie sich mit Ihrem Google-Konto anmelden. Google &uuml;bermittelt uns
              dabei: E-Mail-Adresse, Anzeigename, Profilbild-URL und eine anonymisierte Google-Nutzer-ID.
              Wir erhalten weder Ihr Google-Passwort noch Zugang zu weiteren Google-Daten &uuml;ber das
              f&uuml;r die Authentifizierung Notwendige hinaus.
            </p>
            <p className="mt-1">
              Google-Datenschutzerkl&auml;rung:{" "}
              <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary-hover">
                https://policies.google.com/privacy
              </a>
            </p>
            <p>Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO</p>
          </section>

          {/* 5 */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-cream">5. Suchanfragen und KI-Antwortgenerierung</h2>
            <p>
              TubeVault erm&ouml;glicht die semantische Suche in indexierten YouTube-Kanal-Archiven. Jede
              Suchanfrage wird verarbeitet, um eine KI-gest&uuml;tzte Antwort mit Quellenangaben zu erzeugen.
            </p>

            <h3 className="mb-2 mt-4 text-base font-medium text-cream">5.1 Verarbeitungsschritte</h3>
            <ul className="ml-4 list-disc space-y-1.5">
              <li>Ihre Sucheingabe wird als Vektorabfrage gegen unsere lokale Qdrant-Datenbank (Hetzner-Server, Deutschland) verwendet</li>
              <li>Die relevantesten Transkript-Ausschnitte werden identifiziert</li>
              <li>Ihre Suchanfrage und die relevanten Transkript-Ausschnitte werden von unserem Server an die OpenAI-API &uuml;bermittelt (internationale &Uuml;bermittlung &mdash; siehe Abschnitt 12), um eine zusammengefasste Antwort zu generieren. Ihr Browser kommuniziert nicht direkt mit OpenAI.</li>
              <li>Die Antwort wird Ihnen mit Zeitstempel-Links zu den Quellvideos auf YouTube angezeigt</li>
            </ul>

            <h3 className="mb-2 mt-4 text-base font-medium text-cream">5.2 Zweck und Rechtsgrundlage</h3>
            <p>Zweck: Vertragserf&uuml;llung (Bereitstellung der Kernfunktionalit&auml;t der Plattform)</p>
            <p>Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO</p>

            <h3 className="mb-2 mt-4 text-base font-medium text-cream">5.3 Speicherung von Suchanfragen</h3>
            <p>
              Suchanfragen k&ouml;nnen f&uuml;r maximal 30 Tage in unseren Server-Logs gespeichert werden,
              zur Missbrauchspr&auml;vention und IT-Sicherheit. Eine personalisierte Auswertung einzelner
              Anfragen findet nicht statt.
            </p>
          </section>

          {/* 5a */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-cream">5a. Chatverlauf und Konversationsdaten</h2>
            <p>
              Wenn Sie TubeVault eingeloggt nutzen, werden Ihre Konversationen (Fragen und
              KI-generierte Antworten) in Ihrem Konto gespeichert, damit Sie sp&auml;ter darauf
              zugreifen k&ouml;nnen &mdash; sitzungs- und ger&auml;te&uuml;bergreifend.
            </p>

            <h3 className="mb-2 mt-4 text-base font-medium text-cream">5a.1 Was wir speichern</h3>
            <ul className="ml-4 list-disc space-y-1.5">
              <li>Ihre Suchfragen (Klartext)</li>
              <li>KI-generierte Antworten (Klartext)</li>
              <li>Quellenverweise (Videotitel, URLs, Zeitstempel)</li>
              <li>Konversations-Metadaten: Titel, zugeordneter Kanal, Erstellungs- und Aktualisierungszeitstempel</li>
              <li>Bei kanal&uuml;bergreifenden Suchen: welche Kan&auml;le abgefragt wurden</li>
            </ul>

            <h3 className="mb-2 mt-4 text-base font-medium text-cream">5a.2 Zweck und Rechtsgrundlage</h3>
            <p>
              Zweck: Bereitstellung der Chatverlauf-Funktion als Teil der Kernfunktionalit&auml;t der
              Plattform, die es Ihnen erm&ouml;glicht, Konversationen fortzusetzen und fr&uuml;here
              Antworten einzusehen.
            </p>
            <p className="mt-1">Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO (Vertragserf&uuml;llung)</p>

            <h3 className="mb-2 mt-4 text-base font-medium text-cream">5a.3 Speicherdauer und L&ouml;schung</h3>
            <p>
              Konversationen werden gespeichert, solange Ihr Konto besteht. Sie k&ouml;nnen einzelne
              Konversationen jederzeit &uuml;ber Ihr Dashboard l&ouml;schen. Bei L&ouml;schung Ihres
              Kontos werden alle Konversationen und Nachrichten unwiderruflich gel&ouml;scht.
            </p>

            <h3 className="mb-2 mt-4 text-base font-medium text-cream">5a.4 KI-Titelgenerierung</h3>
            <p>
              Um Ihnen die Identifizierung von Konversationen zu erleichtern, wird f&uuml;r jede
              Konversation automatisch ein kurzer Thementitel mithilfe der OpenAI-API generiert
              (derselbe Anbieter wie f&uuml;r die Antwortgenerierung; siehe Abschnitt 12.3). Die
              erste Frage und Antwort einer Konversation werden hierf&uuml;r an OpenAI &uuml;bermittelt.
              Sie k&ouml;nnen Konversationen jederzeit umbenennen.
            </p>
          </section>

          {/* 6 */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-cream">6. Nutzungsanalyse</h2>
            <p>
              Zur Verbesserung von TubeVault und zum Verst&auml;ndnis der Nutzerinteraktion erheben wir
              pseudonymisierte Produktanalysen. Alle Analysedaten werden ausschlie&szlig;lich auf unseren
              eigenen Servern gespeichert (Hetzner, Deutschland). Wir verwenden keine Drittanbieter-Analysedienste
              wie Google Analytics oder Mixpanel.
            </p>

            <h3 className="mb-2 mt-4 text-base font-medium text-cream">6.1 Was wir erheben</h3>
            <ul className="ml-4 list-disc space-y-1.5">
              <li><strong className="text-cream">Suchanfragen</strong> &mdash; gespeichert als kryptographischer SHA-256-Hash; lesbarer Anfragetext wird maximal 7 Tage gespeichert und dann automatisch gel&ouml;scht</li>
              <li><strong className="text-cream">Kanal-Interaktionen</strong> &mdash; welche Kan&auml;le angesehen und durchsucht werden</li>
              <li><strong className="text-cream">Feature-Nutzung</strong> &mdash; welche Plattformfunktionen genutzt werden (z.&thinsp;B. Transkript-Ansicht, kanal&uuml;bergreifende Suche)</li>
              <li><strong className="text-cream">Conversion-Events</strong> &mdash; Upgrade-Button-Klicks, Abonnement-Starts, Neuanmeldungen</li>
            </ul>

            <h3 className="mb-2 mt-4 text-base font-medium text-cream">6.2 Datenschutzma&szlig;nahmen</h3>
            <ul className="ml-4 list-disc space-y-1.5">
              <li><strong className="text-cream">Nicht authentifizierte Nutzer:</strong> Es werden nur gehashte Daten gespeichert, niemals Klartext-Anfragen</li>
              <li><strong className="text-cream">Authentifizierte Nutzer:</strong> Klartext-Anfragen werden maximal 7 Tage gespeichert und dann automatisch durch einen geplanten Bereinigungsjob entfernt</li>
              <li>Aggregierte Statistiken (ohne Personenbezug) werden zeitlich unbegrenzt f&uuml;r die Produktentwicklung aufbewahrt</li>
            </ul>
            <p className="mt-3">TubeVault verwendet zwei unterschiedliche Tracking-Systeme:</p>
            <ul className="ml-4 mt-2 list-disc space-y-1.5">
              <li><strong className="text-cream">Analytics-Tracking (anonym):</strong> Session-Kennungen werden aus einem t&auml;glich rotierenden Hash von Browser-Merkmalen abgeleitet. Diese Kennungen bestehen nicht &uuml;ber Tage hinweg und k&ouml;nnen Sie nicht pers&ouml;nlich identifizieren.</li>
              <li><strong className="text-cream">Attributions-Tracking (einwilligungsbasiert):</strong> Eine persistente UUID (tv_session_id) wird im localStorage Ihres Browsers gespeichert, um Marketing-Kampagnenbesuche mit sp&auml;teren Anmeldungen zu korrelieren. Diese Kennung besteht, bis Sie Ihre Browserdaten l&ouml;schen oder die Attributions-Einwilligung widerrufen. Sie wird erst nach Erteilung der Attributions-Einwilligung erstellt.</li>
            </ul>

            <p className="mt-3">Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO &mdash; berechtigtes Interesse an der Verbesserung des Produkts und dem Verst&auml;ndnis der Nutzerbed&uuml;rfnisse</p>
            <p>Speicherdauer: Klartext-Anfragen: 7 Tage. Event-Logs: 30 Tage. Aggregate: zeitlich unbegrenzt (keine personenbezogenen Daten).</p>
          </section>

          {/* 7 */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-cream">7. Technische Kennungen f&uuml;r anonyme Nutzer</h2>
            <p>
              Zur Begrenzung der kostenlosen Nutzung auf 5 Anfragen pro Tag f&uuml;r nicht authentifizierte
              Nutzer erzeugen wir einen nicht persistenten gehashten Fingerabdruck aus folgenden Informationen:
            </p>
            <ul className="ml-4 mt-2 list-disc space-y-1.5">
              <li>Browsertyp und -version (User-Agent-String)</li>
              <li>Bildschirmaufl&ouml;sung</li>
              <li>Bevorzugte Browsersprache</li>
            </ul>
            <p className="mt-2">
              Dieser Fingerabdruck wird als kryptographischer Hashwert gespeichert. Er erm&ouml;glicht keine
              Identifizierung Ihrer Person, wird nicht persistent gespeichert und ist auf den aktuellen
              Kalendertag beschr&auml;nkt. Es werden hierf&uuml;r keine Cookies gesetzt.
            </p>
            <p className="mt-1">Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an der Verhinderung von Missbrauch des kostenlosen Angebots)</p>
          </section>

          {/* 8 */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-cream">8. Cookies &amp; lokaler Speicher</h2>
            <p>TubeVault verwendet folgende clientseitige Speichermechanismen:</p>

            <h3 className="mb-2 mt-4 text-base font-medium text-cream">Unbedingt erforderlich (keine Einwilligung n&ouml;tig)</h3>
            <ul className="ml-4 list-disc space-y-1.5">
              <li><strong className="text-cream">Authentifizierungs-Cookies</strong> (Supabase Auth) &mdash; f&uuml;r die Login-Session</li>
              <li><strong className="text-cream">tv_consent</strong> &mdash; Ihre Cookie-Einwilligungspr&auml;ferenzen</li>
              <li><strong className="text-cream">tv_audit_session_id</strong> &mdash; anonyme Kennung f&uuml;r den Einwilligungs-Audit-Trail (DSGVO Art. 7 Nachweispflicht)</li>
            </ul>

            <h3 className="mb-2 mt-4 text-base font-medium text-cream">Analytics (Einwilligung erforderlich)</h3>
            <ul className="ml-4 list-disc space-y-1.5">
              <li><strong className="text-cream">T&auml;glich rotierender Session-Hash</strong> (serverseitig) &mdash; f&uuml;r Nutzungsstatistiken</li>
            </ul>

            <h3 className="mb-2 mt-4 text-base font-medium text-cream">Attribution (Einwilligung erforderlich)</h3>
            <ul className="ml-4 list-disc space-y-1.5">
              <li><strong className="text-cream">tv_session_id</strong> (localStorage) &mdash; persistente UUID zur Verkn&uuml;pfung von Sessions f&uuml;r Conversion-Tracking</li>
              <li><strong className="text-cream">tv_attribution</strong> (localStorage) &mdash; erfasste UTM-Parameter und Referrer (90 Tage Aufbewahrung)</li>
            </ul>

            <p className="mt-3">
              Sie k&ouml;nnen Ihre Einwilligung jederzeit &uuml;ber den Link &bdquo;Cookie settings&ldquo; in unserer Fu&szlig;zeile verwalten.
            </p>
          </section>

          {/* 9 */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-cream">9. Attributions-Tracking</h2>
            <p>Beim Besuch unserer Landingpages k&ouml;nnen wir folgende Daten erfassen:</p>
            <ul className="ml-4 mt-2 list-disc space-y-1.5">
              <li>UTM-Parameter (utm_source, utm_medium, utm_campaign, utm_content, utm_term) aus der URL</li>
              <li>Referrer (die Website, die auf uns verlinkt hat)</li>
              <li>Landingpage-Variante (welche Version unserer Landingpage Sie gesehen haben)</li>
              <li>Persistente Session-Kennung (UUID in Ihrem Browser gespeichert)</li>
            </ul>
            <p className="mt-2">
              Diese Daten werden nur nach Erteilung Ihrer Attributions-Einwilligung &uuml;ber unseren
              Cookie-Banner erhoben. Ohne Einwilligung werden keine Attributionsdaten erfasst.
            </p>
            <p className="mt-1">
              Speicherdauer: Attributionsdatens&auml;tze werden nach 90 Tagen automatisch gel&ouml;scht.
              Einwilligungsprotokolle (consent_log) werden f&uuml;r die Dauer unserer gesetzlichen
              Rechenschaftspflicht nach Art. 7 Abs. 1 DSGVO aufbewahrt.
            </p>
          </section>

          {/* 10 */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-cream">10. Cookie-Einwilligung (TTDSG)</h2>
            <p>
              In &Uuml;bereinstimmung mit &sect;25 TTDSG und Art. 6 Abs. 1 lit. a DSGVO holen wir Ihre
              ausdr&uuml;ckliche Einwilligung ein, bevor nicht-essentielle Informationen auf Ihrem
              Endger&auml;t gespeichert werden. Unser Cookie-Banner bietet drei Optionen:
            </p>
            <ul className="ml-4 mt-2 list-disc space-y-1.5">
              <li><strong className="text-cream">Alle akzeptieren:</strong> Alle Kategorien aktiviert (Analytics + Attribution)</li>
              <li><strong className="text-cream">Nur Notwendige:</strong> Nur unbedingt erforderliche Cookies werden gespeichert</li>
              <li><strong className="text-cream">Einstellungen:</strong> Granulare Kontrolle &uuml;ber jede Kategorie</li>
            </ul>
            <p className="mt-2">
              Ihre Einwilligungswahl wird im localStorage (tv_consent) und einem Cookie (tv_consent) f&uuml;r
              die serverseitige Durchsetzung gespeichert. Beides l&auml;uft nach 12 Monaten ab, danach werden
              Sie erneut gefragt.
            </p>
            <p className="mt-1">
              Sie k&ouml;nnen Ihre Einwilligung jederzeit &uuml;ber den Link &bdquo;Cookie settings&ldquo;
              in der Fu&szlig;zeile unserer Website widerrufen oder &auml;ndern.
            </p>
          </section>

          {/* 11 */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-cream">11. Zahlungsabwicklung</h2>
            <p>
              Abonnement-Zahlungen werden von Stripe Payments Europe Ltd., Irland, abgewickelt. Wir speichern
              weder Kreditkartennummern noch vollst&auml;ndige Zahlungsdetails. Stripe handelt als
              Auftragsverarbeiter gem&auml;&szlig; Art. 28 DSGVO; ein Auftragsverarbeitungsvertrag (AVV) liegt vor.
              F&uuml;r Zahlungen, die &uuml;ber US-basierte Stripe-Einheiten abgewickelt werden, gew&auml;hrleisten
              Standardvertragsklauseln einen angemessenen Schutz.
            </p>
            <p className="mt-2">
              Stripe-Datenschutzerkl&auml;rung:{" "}
              <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary-hover">
                https://stripe.com/privacy
              </a>
            </p>
            <p>Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO</p>
            <p>
              Speicherdauer: Stripe bewahrt Zahlungsdaten gem&auml;&szlig; den geltenden Aufbewahrungspflichten
              f&uuml;r Finanzdaten auf (Deutschland: 10 Jahre nach HGB). Eine vollst&auml;ndige L&ouml;schung von
              Stripe-Zahlungsdaten nach Kontoschlie&szlig;ung ist daher nicht immer m&ouml;glich; solche Daten
              werden anonymisiert, wenn eine L&ouml;schung rechtlich nicht zul&auml;ssig ist.
            </p>
          </section>

          {/* 12 */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-cream">12. Auftragsverarbeiter und internationale &Uuml;bermittlungen</h2>
            <p>
              Wir setzen folgende Dienstleister ein, jeweils auf Grundlage eines Auftragsverarbeitungsvertrags (AVV)
              gem&auml;&szlig; Art. 28 DSGVO:
            </p>

            <h3 className="mb-2 mt-4 text-base font-medium text-cream">12.1 Supabase</h3>
            <p>
              Supabase wird als Authentifizierungsanbieter und Nutzerdatenbank verwendet, konfiguriert mit
              einem EU-Serverstandort (Frankfurt). Ein AVV gem&auml;&szlig; Art. 28 DSGVO liegt vor.
            </p>
            <p className="mt-1">
              Datenschutzinformationen:{" "}
              <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary-hover">
                https://supabase.com/privacy
              </a>
            </p>

            <h3 className="mb-2 mt-4 text-base font-medium text-cream">12.2 Hetzner Online GmbH</h3>
            <p>
              Unsere Server (Anwendung, Vektordatenbank, Embeddings, Analysen) befinden sich ausschlie&szlig;lich
              in Hetzner-Rechenzentren in Deutschland. Ein AVV liegt mit Hetzner vor.
            </p>
            <p className="mt-1">
              Datenschutzinformationen:{" "}
              <a href="https://www.hetzner.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary-hover">
                https://www.hetzner.com/legal/privacy-policy
              </a>
            </p>

            <h3 className="mb-2 mt-4 text-base font-medium text-cream">12.3 OpenAI (internationale &Uuml;bermittlung in die USA)</h3>
            <p>
              Ihre Suchanfragen werden zur KI-Antwortgenerierung an OpenAI &uuml;bermittelt. OpenAI verarbeitet
              diese Daten in den USA. Die &Uuml;bermittlung basiert auf EU-Standardvertragsklauseln
              (Art. 46 Abs. 2 lit. c DSGVO) und einem Auftragsverarbeitungsvertrag. Gem&auml;&szlig; den
              API-Bedingungen von OpenAI (Stand 2024) werden &uuml;ber die API &uuml;bermittelte Daten
              standardm&auml;&szlig;ig nicht zum Training von KI-Modellen verwendet; wir haben dies
              vertraglich sichergestellt.
            </p>
            <p className="mt-1">
              Datenschutzinformationen:{" "}
              <a href="https://openai.com/policies/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary-hover">
                https://openai.com/policies/privacy-policy
              </a>
            </p>

            <h3 className="mb-2 mt-4 text-base font-medium text-cream">12.4 Stripe Payments Europe Ltd.</h3>
            <p>
              Die Zahlungsabwicklung erfolgt &uuml;ber Stripe Payments Europe Ltd., 1 Grand Canal Street Lower,
              Grand Canal Dock, Dublin, D02 H210, Irland. Stripe verarbeitet:
            </p>
            <ul className="ml-4 mt-2 list-disc space-y-1.5">
              <li>E-Mail-Adresse (f&uuml;r Quittungen und Kundendatensatz)</li>
              <li>Abonnement-Stufe und Preis-ID</li>
              <li>Zahlungskartendaten (werden direkt von Stripe verarbeitet; TubeVault sieht diese nicht)</li>
              <li>Supabase-Nutzer-ID (als Metadaten zur Abonnement-Zuordnung)</li>
            </ul>
            <p className="mt-2">Rechtsgrundlage: Vertragserf&uuml;llung (Art. 6 Abs. 1 lit. b DSGVO).</p>
            <p>Datenstandort: EU (Stripe Payments Europe Ltd., Irland).</p>
            <p>
              F&uuml;r Zahlungen, die &uuml;ber US-basierte Stripe-Einheiten abgewickelt werden, unterhält Stripe
              Standardvertragsklauseln f&uuml;r einen angemessenen Schutz.
            </p>
            <p className="mt-1">
              Datenschutzinformationen:{" "}
              <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary-hover">
                https://stripe.com/privacy
              </a>
            </p>
          </section>

          {/* 13 */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-cream">13. Server-Logs und technische Daten</h2>
            <p>Beim Zugriff auf unsere Plattform werden automatisch technische Informationen in Server-Logdateien erfasst:</p>
            <ul className="ml-4 mt-2 list-disc space-y-1.5">
              <li>IP-Adresse (nach 24 Stunden gek&uuml;rzt)</li>
              <li>Datum und Uhrzeit des Zugriffs</li>
              <li>Aufgerufene URL</li>
              <li>HTTP-Statuscode</li>
              <li>&Uuml;bertragenes Datenvolumen</li>
              <li>Browsertyp und Betriebssystem</li>
            </ul>
            <p className="mt-2">
              Diese Daten dienen ausschlie&szlig;lich der Gew&auml;hrleistung des technischen Betriebs,
              der IT-Sicherheit und der Missbrauchspr&auml;vention. Eine Zusammenf&uuml;hrung mit
              anderen Daten findet nicht statt.
            </p>
            <p>Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse)</p>
            <p>Speicherdauer: Maximal 30 Tage, danach automatische L&ouml;schung</p>
          </section>

          {/* 14 */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-cream">14. Datensicherheit</h2>
            <p>Wir setzen angemessene technische und organisatorische Sicherheitsma&szlig;nahmen ein, darunter:</p>
            <ul className="ml-4 mt-2 list-disc space-y-1.5">
              <li>Verschl&uuml;sselte &Uuml;bertragung via HTTPS/TLS (Let&apos;s-Encrypt-Zertifikat &uuml;ber Caddy)</li>
              <li>Produktionsdatenbank nur &uuml;ber gesicherte SSH-Verbindungen zug&auml;nglich</li>
              <li>Qdrant-Vektordatenbank ausschlie&szlig;lich an localhost gebunden (kein externer Zugriff)</li>
              <li>CORS-Einschr&auml;nkungen auf autorisierte Domains beschr&auml;nkt</li>
              <li>API-Key-Schutz f&uuml;r administrative Endpunkte</li>
              <li>SSH-Passwort-Authentifizierung deaktiviert (nur schl&uuml;sselbasierter Zugang)</li>
            </ul>
            <p className="mt-2">Bitte beachten Sie, dass keine Daten&uuml;bertragung &uuml;ber das Internet vollst&auml;ndig sicher ist.</p>
          </section>

          {/* 15 */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-cream">15. Ihre Rechte als betroffene Person</h2>
            <p>Nach der DSGVO haben Sie folgende Rechte bez&uuml;glich Ihrer personenbezogenen Daten:</p>

            <h3 className="mb-1 mt-3 text-base font-medium text-cream">Auskunftsrecht (Art. 15 DSGVO)</h3>
            <p>Sie haben das Recht, Best&auml;tigung dar&uuml;ber zu erhalten, ob wir personenbezogene Daten &uuml;ber Sie verarbeiten und, falls ja, eine Kopie dieser Daten kostenlos zu erhalten.</p>

            <h3 className="mb-1 mt-3 text-base font-medium text-cream">Recht auf Berichtigung (Art. 16 DSGVO)</h3>
            <p>Sie haben das Recht, die Korrektur unrichtiger oder unvollst&auml;ndiger personenbezogener Daten zu verlangen.</p>

            <h3 className="mb-1 mt-3 text-base font-medium text-cream">Recht auf L&ouml;schung (Art. 17 DSGVO)</h3>
            <p>
              Sie haben das Recht, die L&ouml;schung Ihrer Daten zu verlangen, sofern keine gesetzlichen
              Aufbewahrungspflichten entgegenstehen. Sie k&ouml;nnen Ihr Konto direkt in Ihren
              Kontoeinstellungen unter &bdquo;Delete Account&ldquo; l&ouml;schen. Bei L&ouml;schung entfernen wir:
            </p>
            <ul className="ml-4 mt-1 list-disc space-y-1">
              <li>Ihr Supabase-Nutzerkonto (einschlie&szlig;lich E-Mail, Passwort-Hash, OAuth-Verkn&uuml;pfung)</li>
              <li>Alle Konversationen und Chat-Nachrichten (Fragen, Antworten, Quellenverweise)</li>
              <li>Alle gespeicherten Suchanfragen und Analytics-Events, die Ihrer Konto-ID zugeordnet sind</li>
              <li>Alle Pr&auml;ferenzdaten</li>
            </ul>
            <p className="mt-1">
              Stripe-Zahlungsdaten k&ouml;nnen aufgrund gesetzlicher Aufbewahrungspflichten
              (Abgabenordnung: 10 Jahre) nicht vollst&auml;ndig gel&ouml;scht werden; solche Daten werden anonymisiert.
            </p>

            <h3 className="mb-1 mt-3 text-base font-medium text-cream">Recht auf Einschr&auml;nkung der Verarbeitung (Art. 18 DSGVO)</h3>
            <p>Sie haben das Recht, die Einschr&auml;nkung der Verarbeitung Ihrer Daten unter den in Art. 18 DSGVO genannten Voraussetzungen zu verlangen.</p>

            <h3 className="mb-1 mt-3 text-base font-medium text-cream">Recht auf Daten&uuml;bertragbarkeit (Art. 20 DSGVO)</h3>
            <p>Sie haben das Recht, Ihre Daten in einem strukturierten, g&auml;ngigen und maschinenlesbaren Format zu erhalten.</p>

            <h3 className="mb-1 mt-3 text-base font-medium text-cream">Widerspruchsrecht (Art. 21 DSGVO)</h3>
            <p>Sie haben das Recht, jederzeit gegen die Verarbeitung Ihrer Daten auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse) Widerspruch einzulegen, einschlie&szlig;lich eines auf diese Bestimmungen gest&uuml;tzten Profilings.</p>

            <h3 className="mb-1 mt-3 text-base font-medium text-cream">Beschwerderecht</h3>
            <p>Sie haben das Recht, sich bei einer Aufsichtsbeh&ouml;rde zu beschweren. Die f&uuml;r uns zust&auml;ndige Beh&ouml;rde ist:</p>
            <p className="mt-1">
              Die Landesbeauftragte f&uuml;r den Datenschutz und f&uuml;r das Recht auf Akteneinsicht
              Brandenburg (LDA Brandenburg)<br />
              Stahnsdorfer Damm 77, 14532 Kleinmachnow, Deutschland<br />
              <a href="https://www.lda.brandenburg.de" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary-hover">
                www.lda.brandenburg.de
              </a>
            </p>
            <p className="mt-1">Sie k&ouml;nnen sich auch an die Aufsichtsbeh&ouml;rde Ihres Wohnsitzes oder Arbeitsorts innerhalb der EU wenden.</p>
          </section>

          {/* 16 */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-cream">16. Aufbewahrungsfristen</h2>
            <p>
              Personenbezogene Daten werden gel&ouml;scht, sobald sie f&uuml;r den Verarbeitungszweck nicht
              mehr erforderlich sind und keine gesetzlichen Aufbewahrungspflichten entgegenstehen.
              Wesentliche Aufbewahrungsfristen:
            </p>
            <ul className="ml-4 mt-2 list-disc space-y-1.5">
              <li><strong className="text-cream">Konversationsdaten:</strong> Gespeichert bis zur L&ouml;schung der Konversation oder Ihres Kontos</li>
              <li><strong className="text-cream">Klartext-Suchanfragen:</strong> 7 Tage</li>
              <li><strong className="text-cream">Server-Logs:</strong> 30 Tage</li>
              <li><strong className="text-cream">Attributionsdaten</strong> (landing_attribution): 90 Tage</li>
              <li><strong className="text-cream">Einwilligungsprotokolle</strong> (consent_log): F&uuml;r die Dauer unserer gesetzlichen Rechenschaftspflicht nach Art. 7 Abs. 1 DSGVO</li>
              <li><strong className="text-cream">tv_consent</strong> localStorage-Eintrag: 12 Monate</li>
              <li><strong className="text-cream">tv_session_id</strong> localStorage-Eintrag: Bis zur manuellen L&ouml;schung durch den Nutzer</li>
              <li><strong className="text-cream">Zahlungsdaten:</strong> 10 Jahre (Handels- und Steuerrecht)</li>
              <li><strong className="text-cream">Aggregierte Statistiken:</strong> Zeitlich unbegrenzt (keine personenbezogenen Daten)</li>
            </ul>
            <p className="mt-2">Weitere Details finden Sie in den jeweiligen Abschnitten oben.</p>
          </section>

          {/* 17 */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-cream">17. Minderj&auml;hrige</h2>
            <p>
              TubeVault richtet sich nicht an Kinder unter 16 Jahren. Wir erheben wissentlich keine
              personenbezogenen Daten von Personen unter 16 Jahren. Sollten wir erfahren, dass eine
              Person unter 16 Jahren ein Konto erstellt hat, werden wir das Konto und alle zugehörigen
              Daten unverz&uuml;glich l&ouml;schen.
            </p>
          </section>

          {/* 18 */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-cream">18. &Auml;nderungen dieser Datenschutzerkl&auml;rung</h2>
            <p>
              Wir behalten uns vor, diese Datenschutzerkl&auml;rung bei Bedarf zu aktualisieren,
              insbesondere wenn sich die Plattform &auml;ndert, neue Dienstleister eingesetzt werden oder
              sich die Rechtslage weiterentwickelt. Registrierte Nutzer werden &uuml;ber wesentliche
              &Auml;nderungen per E-Mail informiert. Das Datum der letzten Aktualisierung ist stets am
              Anfang dieses Dokuments angegeben.
            </p>
          </section>

          {/* 19 */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-cream">19. Kontakt</h2>
            <p>
              F&uuml;r Fragen zum Datenschutz oder zur Aus&uuml;bung Ihrer Rechte kontaktieren Sie bitte:
            </p>
            <p className="mt-2">
              E-Mail:{" "}
              <a href="mailto:jost@ikigai-dynamics.com" className="text-primary hover:text-primary-hover">
                jost@ikigai-dynamics.com
              </a>
            </p>
            <p className="mt-1">Wir beantworten Anfragen innerhalb von 30 Tagen gem&auml;&szlig; Art. 12 Abs. 3 DSGVO.</p>
            <p className="mt-3">
              Sie k&ouml;nnen DSGVO-Anfragen auch direkt &uuml;ber unser Online-Formular stellen:{" "}
              <Link href="/privacy/data-request" className="text-primary hover:text-primary-hover">
                Anfrage stellen &rarr;
              </Link>
            </p>
          </section>
        </div>

        <div className="mt-10 space-y-8 text-sm leading-relaxed text-cream/80">
          <section>
            <h2 className="mb-3 text-lg font-semibold text-cream">Versionshistorie</h2>
            <ul className="ml-4 list-disc space-y-1.5">
              <li>Version 1.1 &mdash; 3. Mai 2026: Abschnitt 5a (Chatverlauf und Konversationsdaten) hinzugef&uuml;gt; Daten&uuml;bersicht, L&ouml;schrechte und Aufbewahrungsfristen aktualisiert.</li>
              <li>Version 1.0 &mdash; 27. April 2026: Erstver&ouml;ffentlichung.</li>
            </ul>
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
