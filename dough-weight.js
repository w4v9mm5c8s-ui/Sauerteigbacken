/** Raw dough mass excludes bath, tray oil, toppings, fillings and decorative components.
 * All ingredients remain listed for shopping and instructions.
 * Unknown roles are treated as dough and should be reviewed before planning.
 */
const NON_DOUGH_ROLES=new Set(['belag','blech','fuellung','füllung','bad','topping','garnitur','dekoration','deko']);
export const isDoughIngredient=item=>!NON_DOUGH_ROLES.has(String(item?.role||'teig').toLowerCase());
export function doughWeight(recipe){
 if(!recipe||!Array.isArray(recipe.flours)||!recipe.starter)return null;
 const parts=[...recipe.flours.map(f=>Number(f.grams)),Number(recipe.water),Number(recipe.salt),Number(recipe.starter.grams),
  ...(recipe.extras||[]).filter(isDoughIngredient).map(x=>Number(x.grams))];
 return parts.every(v=>Number.isFinite(v)&&v>=0)?parts.reduce((a,b)=>a+b,0):null;
}
export function excludedIngredients(recipe){return (recipe?.extras||[]).filter(x=>!isDoughIngredient(x));}
