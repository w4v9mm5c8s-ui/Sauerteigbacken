# Sauerteig Plus – Zahlungsintegration

## Stand
Die Stripe-Integration ist technisch vorbereitet, aber **standardmäßig ausgeschaltet**. Bestehende kostenlose Funktionen werden nicht gesperrt. Ohne Stripe-Konto, Preise, vollständige Steuer-/Rechtsangaben und reale Zahlungstests ist sie **nicht live buchbar**.

## Geplantes Modell
- Kostenlos: Kernfunktionen (Backplan, Rezepte, Grundwissen, einfache Rechner)
- Optional Plus: Erweiterte KI-Nutzung, unbegrenzte private Sammlungen, erweiterte Auswertungen und Planungsfunktionen – erst nach ausdrücklicher Produktentscheidung und technischer Durchsetzung
- Keine erfundenen Preise; Monats- und Jahrespreis müssen im Stripe-Dashboard angelegt und wirtschaftlich geprüft werden.
- Kostenintensive KI-Aufrufe brauchen serverseitige Nutzungsgrenzen und Missbrauchsschutz, bevor ein unbegrenzter Tarif angeboten wird.

## Stripe vorbereiten
1. Eigenes Stripe-Geschäftskonto für das tatsächliche Unternehmen erstellen und Identität/Bankdaten verifizieren.
2. Zunächst im Stripe-Testmodus ein Produkt „Sauerteig Plus“ und zwei wiederkehrende EUR-Preise anlegen (monatlich/jährlich).
3. Stripe-Kundenportal konfigurieren: Kündigung, Zahlungsmethoden und Rechnungsverlauf aktivieren.
4. Stripe-Webhook anlegen: `https://backen-mit-sauerteig.onrender.com/api/stripe/webhook`.
5. Ereignisse abonnieren: `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`.
6. Folgende Geheimnisse **ausschließlich** in Render Environment hinterlegen, nie in GitHub oder Chat:
   - `STRIPE_SECRET_KEY` = Stripe-Testschlüssel `sk_test_...` (später Live-Schlüssel)
   - `STRIPE_WEBHOOK_SECRET` = Signaturgeheimnis des Webhooks `whsec_...`
   - `STRIPE_PRICE_MONTHLY` = Monats-Price-ID `price_...`
   - `STRIPE_PRICE_YEARLY` = Jahres-Price-ID `price_...`
   - `SUPABASE_SERVICE_ROLE_KEY` = Supabase Service-Role-Schlüssel, ausschließlich serverseitig
   - `PUBLIC_BASE_URL` = `https://backen-mit-sauerteig.onrender.com`
7. Erst nach End-to-End-Test und Rechts-/Steuerfreigabe `BILLING_ENABLED=true` setzen.
8. Vor Livebetrieb Test-IDs durch Live-IDs ersetzen und erneut vollständig testen. Test- und Live-Schlüssel nicht mischen.

## Technische Sicherheit
- Checkout/Portal nur nach Supabase-Authentifizierung.
- Preise ausschließlich aus Server-Umgebungsvariablen, niemals aus Client-Requests.
- Webhooks mit Stripe-Signatur und 5-Minuten-Toleranz verifiziert.
- Abostatus in RLS-geschützter Supabase-Tabelle; Änderungen nur mit Service-Role.
- Kein Plus-Zugang durch bloße Rückkehr von Checkout.
- Nur `active` oder `trialing` gelten als Plus.
- Kund:innen können Rechnungen, Zahlungsmethoden und Kündigungen im Stripe-Kundenportal verwalten.
- Keine Kartendaten in unserer App.

## Vor Live-Freigabe noch notwendig
- [ ] Geschäftsmodell, Leistungen, Grenzen und Preise festlegen
- [ ] Stripe-Testkonto verbinden, Test-Checkout, Webhook und Portal tatsächlich testen
- [ ] Livebetrieb steuerlich/rechtlich prüfen (MwSt., Widerruf, Kündigung, AGB, Datenschutz, Preisangaben)
- [ ] Nutzungsgrenzen und serverseitige Premium-Berechtigungen definieren und durchsetzen
- [ ] Rückerstattungen, Zahlungsfehler, Wiederholungen und Kündigungstermine testen
- [ ] Bestehende Nutzer:innen nicht ohne Zustimmung aussperren
- [ ] Domain festlegen und URLs bei Umzug aktualisieren

Quellen: https://docs.stripe.com/payments/checkout , https://docs.stripe.com/billing/subscriptions/webhooks , https://docs.stripe.com/customer-management/configure-portal
