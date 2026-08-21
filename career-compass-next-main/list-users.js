import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
        env[match[1]] = match[2].trim();
    }
});

const supabaseAdmin = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkUsers() {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers();
    if (error) {
        console.error("Error fetching users:", error);
        return;
    }
    console.log("Total users:", data.users.length);
    for (const u of data.users) {
        console.log(`- ${u.email} (id: ${u.id})`);
    }
}
checkUsers();
