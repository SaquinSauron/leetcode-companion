const fs=require('node:fs');
const path=require('node:path');
const read=name=>fs.readFileSync(path.join(__dirname,name),'utf8');
const html=read('leetcode.html')
  .replace('<link rel="stylesheet" href="leetcode.css">',()=>'<style>'+read('leetcode.css')+'</style>')
  .replace('<script src="leetcode-core.js"></script>',()=>'<script>'+read('leetcode-core.js')+'</script>')
  .replace('<script src="leetcode.js"></script>',()=>'<script>'+read('leetcode.js')+'</script>');
fs.writeFileSync(path.join(__dirname,'LeetCode_Companion.html'),html);
console.log('Built LeetCode_Companion.html. The complete Two Sum lesson works without a server.');

