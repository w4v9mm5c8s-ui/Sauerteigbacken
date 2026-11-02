export function billingView(user,status,escape){
 if(!user)return '<section class="card"><h2>Sauerteig Plus</h2><p>Für Abos ist eine Anmeldung erforderlich.</p><button data-act="account">Zum Konto</button></section>';
 const active=Boolean(status?.plus),plans=Array.isArray(status?.plans)?status.plans:[];
 const enabled=Boolean(status?.enabled)&&plans.length===2;
 const price=(plan)=>{const p=plans.find(x=>x.plan===plan);if(!p)return '';return new Intl.NumberFormat('de-DE',{style:'currency',currency:'EUR'}).format(p.amount/100)};
 const statusText=active?'Plus aktiv':status?.status==='unavailable'?'Bezahlung noch nicht eingerichtet':'Kostenlos';
 return '<section class="card"><h2>Sauerteig Plus</h2><p>Die grundlegenden Backfunktionen bleiben kostenlos. Plus bietet künftig zusätzliche KI- und Komfortfunktionen.</p><div class="billing-status"><strong>Dein Status: '+statusText+'</strong></div>'+
 (active?'<p>Dein Abonnement wird von Stripe verwaltet.</p><button data-act="billingPortal">Abo und Rechnungen verwalten</button>':
 enabled?'<h3>Plus-Abo wählen</h3><p>Monatlich: <strong>'+price('monthly')+' pro Monat</strong>, inklusive Umsatzsteuer.</p><p>Jährlich: <strong>'+price('yearly')+' pro Jahr</strong>, inklusive Umsatzsteuer.</p><p class="muted">Die Zahlung erfolgt sicher über Stripe. Prüfe alle Bedingungen vor dem Abschluss.</p><button data-act="billingCheckout:monthly">Monatsabo auswählen</button><button data-act="billingCheckout:yearly">Jahresabo auswählen</button>':
 '<p class="muted">Die Zahlung ist derzeit noch nicht freigeschaltet. Du kannst die App weiterhin kostenlos verwenden.</p>')+
 '<p class="muted">Nach Aktivierung verwaltest du Zahlungsmethoden, Rechnungen und Kündigung im Stripe-Kundenportal.</p></section>';
}
