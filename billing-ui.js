export function billingView(user,status){
 const active=Boolean(user&&status?.plus),plans=status?.plans||[];
 const enabled=status?.enabled&&['monthly','yearly'].every(key=>plans.some(p=>p.plan===key));
 const money=new Intl.NumberFormat('de-DE',{style:'currency',currency:'EUR'});
 const tariffs=[['monthly','Monatsabo','Monat'],['yearly','Jahresabo','Jahr']].map(([key,title,period])=>{
  const price=plans.find(p=>p.plan===key);
  return '<section class="card"><h3>'+title+'</h3><p>'+(price?'<strong>'+money.format(price.amount/100)+' pro '+period+'</strong> inklusive Umsatzsteuer.':(key==='monthly'?'Monatliche':'Jährliche')+' Abrechnung.')+'</p>'+
   (enabled&&!active&&user?'<button data-act="billingCheckout:'+key+'">'+title+' bei Stripe auswählen</button>':'')+'</section>';
 }).join('');
 return '<section class="card"><h2>Was ist Sauerteig Plus?</h2><p>Plus ist das kostenpflichtige Abo für den KI Buddy. Wenn du beim Backen unsicher bist, kannst du deine Frage direkt im Chat stellen.</p><h3>Das ist in beiden Abos enthalten</h3><ul><li>Fragen zu Rezepten, Zutaten und Backschritten stellen und im Gespräch nachfragen.</li><li>Ein Foto von Teig oder Brot mitschicken und sichtbare Merkmale mit dem KI Buddy besprechen.</li><li>Ein höheres stündliches Nutzungslimit für die KI-Funktionen.</li></ul><p>Rezepte auswählen, Mengen umrechnen und deinen Backvorgang planen kannst du kostenlos.</p></section><section><h2>Abomodelle</h2>'+tariffs+'</section>'+
 (active?'<section class="card"><strong>Dein Plus-Abo ist aktiv.</strong><p><button data-act="billingPortal">Abo und Rechnungen verwalten</button></p></section>':
 enabled?(user?'':'<button data-act="billingLogin">Zum Abonnieren anmelden</button>'):'<p>Der Kauf ist derzeit nicht freigeschaltet.</p>')+
 (!active&&user&&status?.hasCustomer?'<button data-act="billingPortal">Frühere Rechnungen verwalten</button>':'');
}
