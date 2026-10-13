// Run once with Node 24: node --env-file=.env.local scripts/bootstrap-superadmin.mjs
// Supply {"email":"...","password":"..."} through stdin, never commit credentials.
import { createClient } from '@supabase/supabase-js';
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY;
if (!url || !key) throw new Error('Configure the SkillWave project URL and server-only secret key first.');
const chunks = [];
for await (const chunk of process.stdin) chunks.push(chunk);
const { email, password } = JSON.parse(Buffer.concat(chunks).toString());
if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 || typeof password !== 'string' || password.length < 10 || password.length > 128) throw new Error('Provide a valid owner email and a password of 10–128 characters.');
const admin = createClient(url, key, {auth:{persistSession:false,autoRefreshToken:false}});
const existing = await admin.from('user_roles').select('user_id').eq('role','superadmin').limit(1);
if (existing.error || existing.data.length) throw new Error('Cannot bootstrap: check the migration or existing superadmin.');
const {data,error} = await admin.auth.admin.createUser({email:email.toLowerCase(),password,email_confirm:true,ban_duration:'876000h',user_metadata:{full_name:'SkillWave Superadmin'}});
if (error || !data.user) throw new Error('Owner creation failed. Check project configuration or whether the email already exists.');
const id = data.user.id;
const provisioned = await admin.rpc('provision_staff',{p_user_id:id,p_email:email.toLowerCase(),p_name:'SkillWave Superadmin',p_role:'superadmin',p_creator:null});
if (provisioned.error) {
  const cleanup = await admin.auth.admin.deleteUser(id);
  throw new Error(cleanup.error ? 'Bootstrap failed; a disabled Auth identity remains. Inspect the project.' : 'Bootstrap failed; the new identity was removed.');
}
const activated = await admin.auth.admin.updateUserById(id,{ban_duration:'none'});
if(activated.error) throw new Error('Owner provisioned but still disabled. Inspect the project before retrying.');
console.log('Superadmin created. Email verification is not required. Sign in at /superadmin/login.');
