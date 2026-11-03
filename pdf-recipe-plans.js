import {PDF_SOURCE_RECIPES} from './pdf-recipes.js';
const flour=(name,grams)=>({name,grams});
const base=(id,flours,water,salt,grams,type='Weizen')=>({...PDF_SOURCE_RECIPES.find(x=>x.id===id),id,flours,water,salt,starter:{type,grams},extras:[],stock:[null,null],proof:[null,null],bake:[],autolyse:0,cold:null,category:'PDF-Rezepte',difficulty:'Nach eigenen Reifeangaben',yieldLabel:'1 Laib',source:'PDF',needsTiming:true});
export function pdfPlanRecipes(){
 const rows=[
 base('pdf-weizen550',[flour('Weizenmehl Type 550',500)],320,10,170),
 {...base('pdf-ruch-altbrot',[flour('Weizenruchmehl',450)],455,10,100),extras:[flour('Weizenprotein',50)],soaker:{items:[flour('Altbrot',25)],water:75,hours:null},starter:{type:'Weizen',grams:100,hydration:100}},
 base('pdf-roggen1150',[flour('Roggenmehl Type 1150',500)],440,10,220,'Roggen'),
 {...base('pdf-manitoba-walnuss',[flour('Manitobamehl',500)],360,10,180),extras:[{name:'Walnüsse',grams:100,role:'fuellung'}],shapeDetail:'Nach der Stockgare Teig ausziehen, Walnüsse aufstreuen und einschlagen. Nicht mitkneten.'},
 {...base('pdf-dinkel-koerner',[flour('Dinkelmehl Type 630',500)],335,10,160),soaker:{items:[flour('Sonnenblumenkerne',30),flour('Kürbiskerne',30),flour('Sesam',20)],water:90,hours:null},waterRange:[330,340]},
 {...base('pdf-proteinbrot',[flour('Weizenmehl Type 550',250),flour('Lupinenmehl',80)],418,10,120),extras:[flour('Weizenprotein',120)],soaker:{items:[flour('Hanfsamen, geschält',50),flour('Leinsamen, geschrotet',30),flour('Flohsamenschalen',20)],water:210,hours:null}},
 {...base('pdf-airfryer',[flour('Weizenmehl Type 550',300)],180,6,100),equipment:'Airfryer',bake:[...Array.from({length:4},()=>({temp:200,min:3.5,detail:'Teigling leicht befeuchten, soweit Geräteanleitung das erlaubt.'})),{temp:180,min:12.5,detail:'Brot vorsichtig umdrehen; anschließend Bräunung und Kerntemperatur um 97 °C prüfen.'}]},
 {...base('pdf-joghurt',[flour('Weizenmehl Type 500',400),flour('Weizenvollkornmehl',80)],220,null,50),extras:[flour('Joghurt',80)],saltNote:'PDF: 1½ TL. Bitte deine abgewogene Salzmenge in Gramm eintragen.',stock:[4,6],proof:[1,2],coldBulkHours:null,requiresColdBulk:true,autolyse:30,foldCount:4,foldInterval:30,yieldLabel:'9 Semmeln',bake:[{temp:230,min:10,detail:'Einschießen, Dampf nach Geräteanleitung.'},{temp:230,min:10,detail:'Dampf ablassen, ohne Dampf fertig backen.'}],preheatTemp:250,shapeDetail:'Nach der kalten Stockgare in neun Stücke teilen und länglich formen.'},
 {...base('pdf-toast',[flour('Weizenmehl Type 550',500)],0,9,50),extras:[flour('Butter',60),flour('Honig',15),flour('Milch',270)],stock:[3.5,4.5],proof:[2,4],autolyse:30,foldCount:4,foldInterval:30,yieldLabel:'1 Kastenform',bake:[{temp:195,min:45,detail:'PDF: 190–200 °C, 40–50 Minuten. Bei starker Bräunung abdecken; Kerntemperatur etwa 96 °C.'}],shapeDetail:'In fünf Stücke teilen, zu Rollen formen und nebeneinander in die gefettete Kastenform legen.',mixDetail:'Nach der Autolyse Starter, Salz und weiche Butter einarbeiten.',liquidNote:'Milch ist eine eigene Zutat; die Wasser-Hydration allein beschreibt diesen Teig nicht.'}
 ];
 return rows.map(r=>({...r,steps:r.method,needsTiming:!r.stock[0]||!r.proof[0]||!r.bake.length,sourceNote:r.note+(r.id==='pdf-ruch-altbrot'?' Für diese Vorlage: 380 g Hauptwasser + 75 g Quellwasser = 455 g Gesamtwasser.':''),starter:{hydration:null,...r.starter}}));
}
