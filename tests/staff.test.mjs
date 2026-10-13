import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
const exports = {};
vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/lib/provision-staff.ts','utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText, {exports,require:()=>({})});
const input = {email:'teacher@example.test',password:'test-password-only',name:'Teacher',creator:'owner'};
function fixture(fail) {
 const calls=[];
 const method=(name,result)=>async (...args)=>{calls.push([name,...args]);return fail===name?{error:{message:'failed'}}:result;};
 const admin={auth:{admin:{createUser:method('create',{data:{user:{id:'new-user'}}}),updateUserById:method('activate',{}),deleteUser:method('delete',{})}},rpc:method('rpc',{})};
 return {calls,run:()=>exports.provisionLecturer(admin,input)};
}
test('staff is auto-confirmed, provisioned as lecturer and activated only after database success',async()=>{
 const f=fixture(); assert.ok((await f.run()).success);
 assert.deepEqual(f.calls.map(c=>c[0]),['create','rpc','activate']);
 assert.equal(f.calls[0][1].email_confirm,true); assert.equal(f.calls[0][1].ban_duration,'876000h');
 assert.equal(f.calls[1][2].p_role,'lecturer'); assert.equal(f.calls[1][2].p_creator,'owner');
});
test('duplicate/create failure does not mutate existing account',async()=>{
 const f=fixture('create');assert.ok((await f.run()).error);assert.equal(f.calls.length,1);
});
test('failed provisioning cleans up new identity and never activates it',async()=>{
 const f=fixture('rpc');assert.ok((await f.run()).error);assert.deepEqual(f.calls.map(c=>c[0]),['create','rpc','delete']);
});
test('activation failures are not reported as success',async()=>{
 const f=fixture('activate');assert.ok((await f.run()).error);
});
test('staff action rejects non-superadmins before privileged client creation',async()=>{
 const e={};let privileged=false;
 vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/app/(dashboard)/actions.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports:e,require:name=>({
 '@/lib/auth':{requireUser:async role=>{assert.equal(role,'superadmin');throw new Error('unauthorized');}},
 '@/lib/supabase/admin':{createAdminClient:()=>{privileged=true;},staffCreationEnabled:()=>true},
 })[name] || {}});
 await assert.rejects(e.createLecturerAccount({},new FormData()),/unauthorized/);assert.equal(privileged,false);
});
