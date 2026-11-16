export function billingView(user,status){
 const active=Boolean(user&&status?.plus),plans=status?.plans||[];
 const enabled=status?.enabled&&['monthly','yearly'].every(key=>plans.some(p=>p.plan===key));
 const money=new Intl.NumberFormat('de-DE',{style:'currency',currency:'EUR'});
 const expiry=status?.periodEnd?new Intl.DateTimeFormat('de-DE',{dateStyle:'medium'}).format(new Date(status.periodEnd)):'';
 const tariffs=[['monthly','Monatsabo','Monat'],['yearly','Jahresabo','Jahr']].map(([key,title,period])=>{
  const amount=plans.find(p=>p.plan===key)?.amount??(key==='monthly'?490:3990);
  return '<section class="card"><h3>'+title+'</h3><p>'+'<strong>'+money.format(amount/100)+' pro '+period+'</strong> inklusive Umsatzsteuer.'+'</p>'+
   (enabled&&!active&&user?'<button data-act="billingCheckout:'+key+'">'+title+' bei Stripe auswählen</button>':'')+'</section>';
 }).join('');
 const voucher=!user?'':'<section class="card"><h3>Gutscheincode</h3>'+(status?.testCode&&active?'<p><strong>Testzugang aktiv</strong>'+(expiry?' bis '+expiry:'')+'.</p>':'<p>Du hast einen Testcode? Gib ihn hier ein, um Plus kostenlos freizuschalten.</p><label for="plusVoucher">Gutscheincode</label><input id="plusVoucher" autocomplete="off" maxlength="80" placeholder="Code eingeben"><button data-act="billingRedeem">Gutscheincode einlösen</button>')+'</section>';
 return '<section class="card"><h2>Was ist Sauerteig Plus?</h2><p>Plus ist das kostenpflichtige Abo für den KI Buddy. Wenn du beim Backen unsicher bist, kannst du deine Frage direkt im Chat stellen.</p><h3>Das ist in beiden Abos enthalten</h3><ul><li>Fragen zu Rezepten, Zutaten und Backschritten stellen und im Gespräch nachfragen.</li><li>Ein Foto von Teig oder Brot mitschicken und sichtbare Merkmale mit dem KI Buddy besprechen.</li><li>Ein höheres stündliches Nutzungslimit für die KI-Funktionen.</li></ul><p>Rezepte auswählen, Mengen umrechnen und deinen Backvorgang planen kannst du kostenlos.</p></section><section><h2>Abomodelle</h2>'+tariffs+'</section>'+voucher+
 (active?'<section class="card"><strong>Dein Plus-Abo ist aktiv.</strong>'+(status?.testCode?'':'<p><button data-act="billingPortal">Abo und Rechnungen verwalten</button></p>')+'</section>':
 enabled?(user?'':'<button data-act="billingLogin">Zum Abonnieren anmelden</button>'):'')+
 (!active&&user&&status?.hasCustomer?'<button data-act="billingPortal">Frühere Rechnungen verwalten</button>':'');
}
