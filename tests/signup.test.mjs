import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
import vm from 'node:vm';
function fixture(fail = false, configured = true) {
  const calls = [];
  const run = (path, require) => { const exports = {}; vm.runInNewContext(ts.transpileModule(fs.readFileSync(path,'utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{exports,require,process,URL}); return exports; };
  const roles = run('src/lib/roles.ts',()=>{});
  const actions = run('src/app/auth/actions.ts', name => ({
    'next/navigation': { redirect: path => { throw new Error('redirect:'+path); } },
    'next/cache': { revalidatePath: () => {} },
    '@/lib/supabase/server': { createClient: async () => {throw new Error('No OTP/session calls expected');} },
    '@/lib/supabase/admin': {staffCreationEnabled:()=>configured,createAdminClient:()=>({auth:{admin:{createUser:async args=>{calls.push(args);return {error:fail ? {message:'duplicate'} : null};}}}})},
    '@/lib/supabase/config': { hasSupabase: () => true },
    '@/lib/roles': roles,
  })[name]);
  return {calls, submit: values => { const form = new FormData(); for (const [k,v] of Object.entries(values)) form.set(k,v); return actions.signUp({},form); }};
}
const valid={email:'learner@example.com',full_name:'New Learner',password:'long-password123',confirm_password:'long-password123'};
test('registration creates a student without sending email or accepting a privileged role',async()=>{
 const f=fixture();await assert.rejects(f.submit({...valid,role:'superadmin',user_id:'owner',intent:'complete'}),/redirect:\/login\?notice=registered/);
 assert.equal(f.calls.length,1);assert.equal(f.calls[0].email_confirm,true);
 assert.deepEqual(Object.keys(f.calls[0]).sort(),['email','email_confirm','password','user_metadata']);
 assert.deepEqual(Object.keys(f.calls[0].user_metadata),['full_name']);
});
test('existing email is not overwritten or signed in',async()=>{
 const f=fixture(true); assert.ok((await f.submit(valid)).error);assert.equal(f.calls.length,1);
});
test('invalid inputs never reach the privileged API',async()=>{
 for (const fields of [{email:'invalid'},{full_name:'x'},{password:'short'},{confirm_password:'different'}]) {
  const f=fixture();assert.ok((await f.submit({...valid,...fields})).error);assert.equal(f.calls.length,0);
 }
});
test('registration is unavailable without the server credential',async()=>{
 const f=fixture(false,false);assert.ok((await f.submit(valid)).error);assert.equal(f.calls.length,0);
});
