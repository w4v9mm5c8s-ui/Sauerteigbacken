export const kitchenBasics='Für ein einfaches Brot brauchst du Mehl, Wasser, Salz und einen aktiven Sauerteigstarter. Zum Abwiegen und Mischen reichen Küchenwaage und Schüssel. Ein sauberes, gut bemehltes Geschirrtuch in einer Schüssel ersetzt das Gärkörbchen. Zum Einschneiden reicht ein scharfes Küchenmesser.';
export function potRecipe(r){
 return r.id?.startsWith('starter-') && r.steps?.some(s=>/mit Deckel/i.test(s));
}
export function ovenChoices(r){
 if(potRecipe(r))return ['Backblech','Pizzastein auf dem Backblech','Gusseisentopf'];
 if(r.equipment)return [r.equipment];
 if(r.steps?.some(s=>/Kastenform/i.test(s)))return ['Backform'];
 if(r.steps?.some(s=>/Backstahl/i.test(s)))return ['Backstahl','Pizzastein auf dem Backblech'];
 return ['Backblech','Pizzastein auf dem Backblech','Backstein','Backform','Gusseisentopf','Airfryer'];
}
export function ovenSelect(r,id,choice,esc){
 return '<label for="'+id+'">Womit möchtest du backen?</label><select id="'+id+'">'+ovenChoices(r).map(x=>'<option'+(x===choice?' selected':'')+'>'+esc(x)+'</option>').join('')+'</select>';
}
export function recipeSteps(r,equipment,basket='none',scale=1){
 return (r.steps||[]).map(s=>{
  s=s.replace(/ ?\(Autolyse ohne Starter\)/gi,'').replace(/(\d+(?:[.,]\d+)?) g\b/g,(_,n)=>Math.round(Number(n.replace(',','.'))*scale)+' g');
  const stone=equipment==='Pizzastein auf dem Backblech';
  if(stone)s=s.replace(/mit Backstahl/g,'mit Pizzastein auf dem Backblech');
  if(potRecipe(r)&&(equipment==='Backblech'||stone)&&/mit Deckel/i.test(s)){
   const phases=r.bake.map(p=>p.min+' Minuten bei '+p.temp+' °C').join(', dann ');
   return 'Ofen auf '+r.bake[0].temp+' °C vorheizen. '+(stone?'Pizzastein auf dem Backblech nach Herstellerangabe mit vorheizen. Laib einschneiden und auf dem heißen Stein offen backen.':'Laib auf ein Backblech setzen, einschneiden und offen backen.')+' Als Richtwert: '+phases+'. Bräunung und Garzustand prüfen.'+(/auskühlen/i.test(s)?' Auf einem Gitter auskühlen lassen.':'');
  }
  if(basket==='none')s=s.replace(/ins (?:bemehlte )?Gärkörbchen/gi,'in eine mit einem gut bemehlten Geschirrtuch ausgelegte Schüssel');
  if(/^Stockgare/i.test(s)&&/falt/i.test(s)&&!/ohne Dehnen/i.test(s))s+=' Die Faltpausen zählen zur gesamten Gehzeit. Nach der letzten Runde läuft nur die restliche Gehzeit weiter.';
  return s;
 });
}
export function plainTitle(s){
 return s.replace(/Stockgare prüfen/g,'Prüfen, ob der Teig aufgegangen ist').replace(/Stückgare prüfen/g,'Geformtes Brot auf Backreife prüfen').replace(/Kalte Stockgare beginnen/g,'Teig vor dem Formen kalt stellen').replace(/Kalte Stockgare/g,'Teig vor dem Formen im Kühlschrank gehen lassen').replace(/Stockgare/g,'Erste Gehzeit (vor dem Formen)').replace(/Stückgare/g,'Zweite Gehzeit (nach dem Formen)').replace(/Stretch & Fold|Coil Fold/g,'Teig dehnen und falten').replace(/Autolyse ansetzen/g,'Mehl und Wasser mischen und ruhen lassen').replace(/Anstellgut/g,'Sauerteigstarter');
}
export function foldDefaults(r){
 const step=(r.steps||[]).find(s=>/^Stockgare/i.test(s))||'';
 const count=/30, 60 und 90/.test(step)?3:/ohne Dehnen/i.test(step)?0:/1–2|2–3|2 sanften?/.test(step)?2:r.starter.type==='Weizen'?2:0;
 return {count:r.foldCount??count,interval:r.foldInterval||(/ersten Stunde|30, 60 und 90/.test(step)?30:40)};
}
