const {test}=require('node:test');
const assert=require('node:assert/strict');
const {EventEmitter}=require('node:events');
const {createApp}=require('../server.cjs');
test('the independent app serves the companion at its root without notebook files',async()=>{
  const app=createApp();
  const req={url:'/',method:'GET',headers:{host:'127.0.0.1:8766'}};
  const res=new EventEmitter();res.writeHead=status=>res.status=status;res.end=body=>res.body=body.toString();
  await app(req,res);assert.equal(res.status,200);assert.match(res.body,/codecompanion/);assert.match(res.body,/leetcode-core.js/);assert(!res.body.includes('app.js'));
});

