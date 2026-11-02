const bucket='sourdough-photos';
export async function uploadBakePhoto(config,token,userId,bakeId,stepIndex,dataUrl){
 if(!token||!userId)throw Error('Bitte anmelden, um Fotos zu speichern');
 if(!/^data:image\/jpeg;base64,/.test(dataUrl))throw Error('Bitte ein gültiges JPEG-Foto wählen');
 const bytes=Uint8Array.from(atob(dataUrl.split(',')[1]),c=>c.charCodeAt(0));
 if(bytes.length>2000000)throw Error('Foto ist zu groß');
 const path=userId+'/'+String(bakeId).replace(/[^a-z0-9-]/gi,'')+'/'+Number(stepIndex)+'.jpg';
 const r=await fetch(config.supabaseUrl+'/storage/v1/object/'+bucket+'/'+path,{method:'POST',headers:{Authorization:'Bearer '+token,apikey:config.supabaseKey,'Content-Type':'image/jpeg','x-upsert':'true'},body:bytes});
 if(!r.ok)throw Error('Foto konnte nicht gespeichert werden');
 return path;
}
export async function signedBakePhoto(config,token,path){
 if(!path||!token)return null;
 const r=await fetch(config.supabaseUrl+'/storage/v1/object/sign/'+bucket+'/'+path,{method:'POST',headers:{Authorization:'Bearer '+token,apikey:config.supabaseKey,'Content-Type':'application/json'},body:JSON.stringify({expiresIn:3600})});
 if(!r.ok)return null;
 const data=await r.json();return data.signedURL?config.supabaseUrl+'/storage/v1'+data.signedURL:null;
}
