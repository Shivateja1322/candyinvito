const getLocalInvites = () => {
  try {
    return JSON.parse(localStorage.getItem('local_invitations') || '{}');
  } catch (e) {
    return {};
  }
};
const setLocalInvites = (invs: any) => {
  try {
    localStorage.setItem('local_invitations', JSON.stringify(invs));
  } catch (e) {}
};

export const invitationRepository = {
  list: async (): Promise<Invitation[]> => {
    try {
      const { data, error } = await supabase.from("invitations").select("*").order("created_at", { ascending: false });
      if (!error && data) return data as Invitation[];
    } catch(e) {}
    return Object.values(getLocalInvites());
  },
  listByClient: async (clientId: string): Promise<Invitation[]> => {
    let dbInvites: any[] = [];
    try {
      const { data, error } = await supabase.from("invitations").select("*").eq("client_id", clientId).order("created_at", { ascending: false });
      if (!error && data) dbInvites = data;
    } catch (e) {}
    
    const local = Object.values(getLocalInvites()).filter((i: any) => i.client_id === clientId);
    return [...dbInvites, ...local] as Invitation[];
  },
  get: async (id: string): Promise<Invitation | null> => {
    try {
      const { data, error } = await supabase.from("invitations").select("*").eq("id", id).single();
      if (!error && data) return data as Invitation;
    } catch(e) {}
    
    const local = getLocalInvites();
    const match = Object.values(local).find((i: any) => i.id === id);
    return (match as Invitation) || null;
  },
  getBySlug: async (slug: string): Promise<Invitation | null> => {
    try {
      const { data, error } = await supabase.from("invitations").select("*").eq("slug", slug).single();
      if (!error && data) return data as Invitation;
    } catch(e) {}
    
    const local = getLocalInvites();
    if (local[slug]) return local[slug] as Invitation;
    return null;
  },
  create: async (userId: string, title: string, templateId: string): Promise<Invitation> => {
    const slug = crypto.randomUUID().split("-")[0];
    const payload = {
      id: crypto.randomUUID(),
      client_id: userId,
      couple_names: title,
      template_id: templateId,
      slug,
      content: {},
      status: "Draft",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    try {
      const { data, error } = await supabase.from("invitations").insert({
        client_id: userId,
        couple_names: title,
        template_id: templateId,
        slug,
        content: {},
        status: "Draft"
      }).select().single();
      if (!error && data) return data as Invitation;
    } catch(e) {}
    
    // Fallback to local storage if DB fails
    const local = getLocalInvites();
    local[slug] = payload;
    setLocalInvites(local);
    return payload as unknown as Invitation;
  },
  update: async (invitationId: string, patch: Partial<Invitation>): Promise<Invitation> => {
    try {
      const { data, error } = await supabase.from("invitations").update(patch).eq("id", invitationId).select().single();
      if (!error && data) return data as Invitation;
    } catch(e) {}
    
    const local = getLocalInvites();
    const slug = Object.keys(local).find(k => local[k].id === invitationId);
    if (slug) {
      local[slug] = { ...local[slug], ...patch, updated_at: new Date().toISOString() };
      setLocalInvites(local);
      return local[slug] as Invitation;
    }
    throw new Error("Invitation not found");
  },
  remove: async (invitationId: string): Promise<boolean> => {
    try {
      await supabase.from("invitations").delete().eq("id", invitationId);
    } catch(e) {}
    
    const local = getLocalInvites();
    const slug = Object.keys(local).find(k => local[k].id === invitationId);
    if (slug) {
      delete local[slug];
      setLocalInvites(local);
    }
    return true;
  }
};
