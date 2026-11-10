const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const catalog=require('../curriculum.js');
const core=require('../leetcode-core.js');
const {createApp}=require('../server.cjs');
const {EventEmitter}=require('node:events');
test('the curriculum has the pinned official 150 and 50 distinct extras',()=>{
  assert.equal(catalog.problems.length,200);const main=catalog.problems.filter(p=>p.track==='neetcode150'),extra=catalog.problems.filter(p=>p.track==='extras');assert.equal(main.length,150);assert.equal(extra.length,50);assert.equal(new Set(catalog.problems.map(p=>p.id)).size,200);assert.equal(new Set(main.map(p=>p.topic)).size,18);
  assert.deepEqual(main.reduce((a,p)=>(a[p.difficulty]=(a[p.difficulty]||0)+1,a),{}),{Easy:28,Medium:101,Hard:21});
  for(const p of catalog.problems){assert(Number.isInteger(p.number));assert(p.title.trim());assert(p.url.startsWith('https://leetcode.com/problems/'));}
  const source=JSON.parse(fs.readFileSync(path.join(__dirname,'../curriculum-data.json'),'utf8'));assert.equal(source.sourceCommit,catalog.sourceCommit);assert.deepEqual(source.problems,catalog.problems);
});
test('listing, generated lessons and study marks are counted separately',()=>{
  const rows=catalog.problems.filter(p=>p.track==='neetcode150');assert.deepEqual(catalog.counts(rows),{listed:150,builtIn:1,generated:0,missing:149,studied:0});
  const cache={'contains-duplicate':{title:'Generated'},'not-a-catalog-id':{},'two-sum':{}};
  const studied={'contains-duplicate':true,'not-a-catalog-id':true};assert.deepEqual(catalog.counts(rows,cache,studied),{listed:150,builtIn:1,generated:1,missing:148,studied:1});assert.equal(catalog.lessonStatus('two-sum',cache),'built-in');
});
test('filters preserve track membership and lesson availability',()=>{
  const rows=catalog.filter({track:'neetcode150',topic:'Arrays & Hashing'});assert.equal(rows.length,9);
  assert.equal(catalog.filter({query:'Two Sum',status:'built-in'}).length,1);assert.equal(catalog.filter({track:'extras'}).length,50);assert.equal(catalog.filter({track:'neetcode150',status:'missing'}).length,149);
});
test('generation receives the chosen catalog identity without replacing the pasted contract',()=>{
  const entry=catalog.problems.find(p=>p.id==='contains-duplicate'),messages=core.teachingMessages('Return whether an integer appears at least twice.',entry),input=JSON.parse(messages[1].content);assert.equal(input.expectedProblem.id,entry.id);assert.equal(input.expectedProblem.number,217);assert.match(input.problem,/at least twice/);assert.match(messages[0].content,/conflict/);
});
test('the API rejects unknown curriculum IDs before any OpenAI call',async()=>{
  let called=false;const app=createApp({apiKey:'test',fetchImpl:async()=>{called=true;}});
  const req={url:'/api/leetcode/lesson',method:'POST',headers:{host:'127.0.0.1:8766',origin:'http://127.0.0.1:8766','content-type':'application/json'},async *[Symbol.asyncIterator](){yield Buffer.from(JSON.stringify({problem:'This is enough text to describe a problem contract.',catalogId:'not-a-known-question'}));}};
  const res=new EventEmitter();res.writeHead=status=>res.status=status;res.end=body=>{res.body=JSON.parse(body);res.writableEnded=true;};await app(req,res);assert.equal(res.status,400);assert.equal(called,false);
});

