(function(){
'use strict';
const data=globalThis.LCCurriculum,core=globalThis.LCData,$=s=>document.querySelector(s);
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const byId=new Map(data.problems.map(p=>[p.id,p]));
const cache=Object.create(null),persisted=new Set();let studied=Object.create(null),db=null;
try{const saved=JSON.parse(localStorage.getItem('leetcode-companion-studied')||'{}');for(const id of Object.keys(saved))if(byId.has(id)&&saved[id]===true)studied[id]=true;}catch{}
const topics=[...new Set(data.problems.map(p=>p.topic))];$('#catalogTopic').innerHTML='<option value="">All topics</option>'+topics.map(t=>`<option>${esc(t)}</option>`).join('');
function render(){
  const track=$('#catalogTrack').value,trackRows=data.problems.filter(p=>track==='all'||p.track===track),counts=data.counts(trackRows,cache,studied);
  const visible=data.filter({track,topic:$('#catalogTopic').value,status:$('#catalogStatus').value,query:$('#catalogSearch').value},cache,studied);
  $('#catalogSummary').textContent=`${counts.listed} catalogued � ${counts.builtIn} built-in lesson � ${counts.generated} AI lessons available (unreviewed) � ${counts.missing} lessons not created � ${counts.studied} marked studied. Showing ${visible.length}.`;
  $('#catalogList').innerHTML=visible.map(p=>{const status=data.lessonStatus(p.id,cache),label=status==='built-in'?'Built-in lesson':status==='generated'?(persisted.has(p.id)?'Saved AI lesson � unreviewed':'AI lesson in this session � unreviewed'):'Lesson not created';return `<div class="catalog-row"><div><strong>${p.number}. ${esc(p.title)}</strong><div class="muted">${esc(p.topic)} � ${esc(p.difficulty)}</div><div class="catalog-state">${label}</div></div><div class="catalog-row-actions"><button type="button" data-catalog-open="${p.id}">${status==='missing'?'Prepare lesson':'Open lesson'}</button><a href="${esc(p.url)}" target="_blank" rel="noopener">Problem ?</a><label><input type="checkbox" data-studied="${p.id}" ${studied[p.id]?'checked':''}> Studied</label></div></div>`;}).join('')||'<p class="muted">No matching questions.</p>';
}
function select(id){
  const p=byId.get(id);if(!p)return;$('#catalogSelectedId').value=id;$('#catalogClear').hidden=false;$('#catalogSelected').textContent=`Selected #${p.number}: ${p.title}. For a new lesson, paste its full statement, examples, and constraints below.`;
  if(id==='two-sum'){document.dispatchEvent(new CustomEvent('lc:open-cached',{detail:{lesson:core.lesson}}));$('#problemDialog').close();return;}
  if(cache[id]){document.dispatchEvent(new CustomEvent('lc:open-cached',{detail:{lesson:cache[id]}}));$('#problemDialog').close();return;}
  $('#generationStatus').textContent='This question is catalogued, but its complete lesson has not been created yet. Paste the problem and use the GPT backend to create it.';
  $('#problemText').focus();
}
async function writeMany(entries){
  if(!db)throw Error('Persistent lesson storage is unavailable. Export a backup to keep these lessons.');
  return new Promise((resolve,reject)=>{const transaction=db.transaction('lessons','readwrite'),store=transaction.objectStore('lessons');for(const [id,lesson]of entries)store.put({id,lesson,savedAt:Date.now()});transaction.oncomplete=resolve;transaction.onerror=()=>reject(Error('Could not save lessons. Export a backup before closing.'));transaction.onabort=()=>reject(Error('Lesson save was interrupted. Export a backup.'));});
}
function storageMessage(text){$('#catalogStorage').textContent=text;}
function openDatabase(){
  try{const request=indexedDB.open('leetcode-companion-library',1);request.onupgradeneeded=()=>{if(!request.result.objectStoreNames.contains('lessons'))request.result.createObjectStore('lessons',{keyPath:'id'});};request.onerror=()=>storageMessage('Session storage only. Export any generated lessons before closing.');request.onsuccess=()=>{db=request.result;const read=db.transaction('lessons','readonly').objectStore('lessons').getAll();read.onsuccess=()=>{let skipped=0;for(const row of read.result){if(!byId.has(row.id)||row.id==='two-sum')continue;try{cache[row.id]=core.validateLesson(row.lesson);persisted.add(row.id);}catch{skipped++;}}storageMessage(`Saved lessons stay in this browser. Export backups regularly.${skipped?' '+skipped+' invalid saved entries were ignored.':''}`);render();};read.onerror=()=>storageMessage('Could not read saved lessons. Current-session lessons still work.');};}catch{storageMessage('Session storage only. Export any generated lessons before closing.');}
}
$('#catalogTrack').onchange=render;$('#catalogTopic').onchange=render;$('#catalogStatus').onchange=render;$('#catalogSearch').oninput=render;
$('#catalogList').onclick=e=>{const button=e.target.closest('[data-catalog-open]');if(button)select(button.dataset.catalogOpen);};
$('#catalogList').onchange=e=>{const input=e.target.closest('[data-studied]');if(!input)return;const id=input.dataset.studied;if(input.checked)studied[id]=true;else delete studied[id];try{localStorage.setItem('leetcode-companion-studied',JSON.stringify(studied));}catch{storageMessage('Study marks could not be saved. Export your progress.');}render();};
document.addEventListener('lc:generated',async e=>{
  const {id,lesson}=e.detail||{};if(!byId.has(id)||id==='two-sum')return;
  try{cache[id]=core.validateLesson(lesson);persisted.delete(id);render();await writeMany([[id,cache[id]]]);persisted.add(id);storageMessage('Generated lesson saved in this browser. It still needs review.');render();}catch(error){storageMessage(error.message);}
});
$('#catalogExport').onclick=()=>{const payload={format:'leetcode-companion-library',version:1,sourceCommit:data.sourceCommit,lessons:cache,studied:Object.keys(studied).filter(id=>studied[id])},url=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download='LeetCode-Library-Backup.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
$('#catalogImport').onclick=()=>$('#catalogFile').click();
$('#catalogFile').onchange=async()=>{try{const file=$('#catalogFile').files[0];if(!file)return;if(file.size>15000000)throw Error('Use a backup under 15 MB.');const payload=JSON.parse(await file.text());if(payload.format!=='leetcode-companion-library'||payload.version!==1||!payload.lessons||typeof payload.lessons!=='object'||Array.isArray(payload.lessons)||!Array.isArray(payload.studied))throw Error('Choose a LeetCode companion library backup.');const entries=Object.entries(payload.lessons).map(([id,value])=>{if(!byId.has(id)||id==='two-sum')throw Error('The backup contains an unknown or reserved question ID.');return [id,core.validateLesson(value)];});for(const [id,value]of entries){cache[id]=value;persisted.delete(id);}for(const id of payload.studied)if(byId.has(id))studied[id]=true;try{localStorage.setItem('leetcode-companion-studied',JSON.stringify(studied));}catch{}render();await writeMany(entries);entries.forEach(([id])=>persisted.add(id));render();storageMessage(`Imported ${entries.length} lessons. Existing questions and study marks were kept.`);}catch(error){storageMessage(error.message);}finally{$('#catalogFile').value='';}};
function clearSelection(){$('#catalogSelectedId').value='';$('#catalogSelected').textContent='';$('#catalogClear').hidden=true;}$('#catalogClear').onclick=clearSelection;document.addEventListener('lc:clear-selection',clearSelection);
render();openDatabase();
})();

