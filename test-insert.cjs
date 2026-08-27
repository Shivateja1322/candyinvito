const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://ushrpnifluurtqkpcysx.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVzaHJwbmlmbHV1cnRxa3BjeXN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU1NzA4MzYsImV4cCI6MjEwMTE0NjgzNn0.q0YiDXyxhYtP4QNtrgOMWpg9_ICsuLPvwEF8KuY1y1I');

async function test() {
  const { data, error } = await supabase.from('invitations').insert({
    client_id: 'a78928bb-d05e-496a-bb0f-fcc32746d384',
    slug: 'invite-999999',
    couple_names: 'New Couple',
    status: 'Draft',
    template_id: 'contemporary-noir'
  });
  console.log('Insert test:', { data, error });
}
test();
