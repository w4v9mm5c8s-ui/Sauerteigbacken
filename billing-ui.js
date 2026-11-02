export function billingView(user,status,escape){
 if(!user)return '<section class="card"><h2>Sauerteig Plus</h2><p>Für Abos ist eine Anmeldung erforderlich.</p><button data-act="account">Zum Konto</button></section>';
 const active=Boolean(status?.plus);
 const enabled=Boolean(status?.enabled);
 return '<section class="card"><h2>Sauerteig Plus</h2><p>Die grundlegenden Backfunktionen bleiben kostenlos. Plus kann künftig zusätzliche KI- und Komfortfunktionen anbieten.</p><p class="muted">Ein kostenpflichtiger Tarif wird erst nach Preisfestlegung und rechtlicher Freigabe angeboten.</p><div class="billing-status"><strong>Dein Status: '+(active?'Plus aktiv':status?.status==='unavailable'?'Bezahlung noch nicht eingerichtet':'Kostenlos')+'</strong></div>'+
 (active?'<p>Dein Abonnement wird von Stripe verwaltet.</p><button data-act="billingPortal">Abo und Rechnungen verwalten</button>':enabled?'<h3>Plus-Abo wählen</h3><p class="muted">Der verbindliche Preis und die Zahlungsbedingungen werden vor dem Bezahlen bei Stripe angezeigt.</p><button data-act="billingCheckout:monthly">Monatsabo bei Stripe ansehen</button><button data-act="billingCheckout:yearly">Jahresabo bei Stripe ansehen</button>':'<p class="muted">Die Zahlung ist derzeit noch nicht freigeschaltet. Du kannst die App weiterhin kostenlos verwenden.</p>')+
 '<p class="muted">Kündigung und Zahlungsmethoden lassen sich nach Aktivierung über das Stripe-Kundenportal verwalten.</p></section>';
}
