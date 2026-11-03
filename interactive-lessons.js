import {lessonDiagram} from './lesson-diagrams.js';
import {PDF_LESSONS} from './pdf-baking.js';
const esc=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function lessonView(id,index=0){
 const lesson=PDF_LESSONS.find(x=>x.id===id)||PDF_LESSONS[0];const step=Math.max(0,Math.min(lesson.steps.length-1,Number(index)||0));
 return '<section class="card"><h3>'+esc(lesson.name)+'</h3><p>Schritt '+(step+1)+' von '+lesson.steps.length+' · PDF S. '+lesson.pages+'</p>'+lessonDiagram(lesson.id,step)+'<p aria-live="polite"><strong>'+esc(lesson.steps[step])+'</strong></p><progress max="'+lesson.steps.length+'" value="'+(step+1)+'"></progress><div class="cols"><button data-act="lesson:'+lesson.id+':'+Math.max(0,step-1)+'" '+(!step?'disabled':'')+'>Zurück</button><button data-act="lesson:'+lesson.id+':'+Math.min(lesson.steps.length-1,step+1)+'" '+(step===lesson.steps.length-1?'disabled':'')+'>Weiter</button></div><label><input type="checkbox" data-lesson-done="'+lesson.id+'"> Anleitung ausprobiert</label><p>Die Darstellung ist schematisch. Entscheidend ist der tatsächliche Teigzustand.</p></section>';
}
export function lessonsMenu(){return '<section class="card"><h3>Interaktiv üben</h3>'+PDF_LESSONS.map(l=>'<button data-act="lesson:'+l.id+':0">'+esc(l.name)+'</button>').join('')+'</section><div id="lessonStage">'+lessonView('kneten')+'</div>';}
