import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
import vm from 'node:vm';
function fixture(overrides = {}) {
  const calls = [];
  const auth = Object.fromEntries(['signInWithOtp','verifyOtp','getUser','updateUser','signOut'].map(name => [name, async args => { calls.push([name,args]); return overrides[name] || { data: {}, error: null }; }]));
  const roles = {};
  const run = (path, require) => { const exports = {}; vm.runInNewContext(ts.transpileModule(fs.readFileSync(path,'utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{exports,require,process,URL}); return exports; };
  Object.assign(roles,run('src/lib/roles.ts',()=>{}));
  const actions = run('src/app/auth/actions.ts', name => ({
    'next/navigation': { redirect: path => { throw new Error('redirect:'+path); } },
    'next/cache': { revalidatePath: () => {} },
    '@/lib/supabase/server': { createClient: async () => ({auth}) },
    '@/lib/supabase/config': { hasSupabase: () => true },
    '@/lib/roles': roles,
  })[name]);
  return {calls, submit: (values, state = {}) => { const form = new FormData(); for (const [k,v] of Object.entries(values)) form.set(k,v); return actions.signUp(state,form); }};
}
const email = 'learner@example.com';
test('signup sends email OTP without a password',async()=>{
 const f=fixture(); const result=await f.submit({email,intent:'send'});
 assert.equal(result.step,'verify'); assert.equal(f.calls[0][0],'signInWithOtp'); assert.equal(f.calls[0][1].email,email); assert.equal(f.calls[0][1].password,undefined);
});
test('invalid and rejected OTP cannot advance to password',async()=>{
 const f=fixture({verifyOtp:{error:{message:'expired'},data:{}}});
 assert.equal((await f.submit({email,intent:'verify',token:'abc'})).step,'verify'); assert.equal(f.calls.length,0);
 assert.equal((await f.submit({email,intent:'verify',token:'123456'})).step,'verify');
});
test('only confirmed OTP session advances',async()=>{
 const f=fixture({verifyOtp:{error:null,data:{session:{},user:{email_confirmed_at:'today'}}}});
 assert.equal((await f.submit({email,intent:'verify',token:'123456'})).step,'password');
});
test('forged client password step and mismatched email cannot save password',async()=>{
 for(const user of [null,{email:'other@example.com',email_confirmed_at:'today'},{email}]) {
 const f=fixture({getUser:{data:{user},error:null}});
 const r=await f.submit({email,intent:'complete',password:'long-password123',confirm_password:'long-password123',full_name:'Learner'},{step:'password',email});
 assert.equal(r.step,'email'); assert.equal(f.calls.some(([n])=>n==='updateUser'),false);
 }
});
test('verified email can save password, revoke sessions and return to login',async()=>{
 const f=fixture({getUser:{data:{user:{email,email_confirmed_at:'today'}},error:null}});
 await assert.rejects(f.submit({email,intent:'complete',password:'long-password123',confirm_password:'long-password123',full_name:'Learner'}),/redirect:\/login/);
 assert.deepEqual(f.calls.map(([n])=>n),['getUser','updateUser','signOut']); assert.equal(f.calls[2][1].scope,'global');
});
test('resend rate errors preserve code entry; password validation prevents writes',async()=>{
 const f=fixture({signInWithOtp:{error:{message:'rate limit'}},getUser:{data:{user:{email,email_confirmed_at:'today'}}}});
 assert.equal((await f.submit({email,intent:'resend'})).step,'verify');
 assert.ok((await f.submit({email,intent:'complete',full_name:'Learner',password:'short'})).error);
 assert.equal(f.calls.some(([n])=>n==='updateUser'),false);
});
