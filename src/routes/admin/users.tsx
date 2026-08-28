import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";

// We use a separate client on the server to avoid modifying the admin's session

const serverResetPassword = createServerFn({ method: "POST" })
  .validator((data: any) => data)
  .handler(async (ctx) => {
    const { email, supabaseUrl, supabaseKey } = ctx.data || (ctx as any);
    const adminSupabase = createClient(supabaseUrl, supabaseKey);
    const { error } = await adminSupabase.auth.resetPasswordForEmail(email);
    if (error) return { error: error.message };
    return { success: true };
  });

const serverCreateUser = createServerFn({ method: "POST" })
  .validator((data: any) => data)
  .handler(async (ctx) => {
    const { email, password, role, name, supabaseUrl, supabaseKey } = ctx.data || (ctx as any);
    const adminSupabase = createClient(supabaseUrl, supabaseKey);
    const { data, error } = await adminSupabase.auth.signUp({
      email,
      password,
    });
    if (error) return { error: error.message };
    
    // Attempt to update the user profile row since the trigger might not set name/role correctly
    if (data.user) {
       await adminSupabase.from("users").update({ role, name }).eq("id", data.user.id);
    }
    return { success: true, user: data.user };
  });

import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { toast } from "sonner";
import { supabase } from "../../lib/supabase";
import { Trash2 } from "lucide-react";

export const Route = createFileRoute("/admin/users")({
  component: UserManagement,
});

function UserManagement() {
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserName, setNewUserName] = useState("");
  const [newUserRole, setNewUserRole] = useState<"ADMIN" | "CLIENT">("CLIENT");
  const [isCreating, setIsCreating] = useState(false);

  const handleResetPassword = async (email: string) => {
    if (!window.confirm(`Send password reset email to ${email}?`)) return;
    try {
      const url = import.meta.env.VITE_SUPABASE_URL;
      const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
      const res = await serverResetPassword({ data: { email, supabaseUrl: url, supabaseKey: key } });
      if (res.error) throw new Error(res.error);
      toast.success("Password reset email sent.");
    } catch (err: any) {
      toast.error(err.message || "Failed to send reset email.");
    }
  };

  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const [users, setUsers] = useState<any[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);

  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const { data, error } = await supabase.rpc("get_all_users");

      if (error) throw error;
      setUsers(data || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to load users.");
    } finally {
      setIsLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserEmail || !newUserPassword) return;

    
      setIsCreating(true);
      try {
        const url = import.meta.env.VITE_SUPABASE_URL;
        const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
        const result = await serverCreateUser({ data: { email: newUserEmail, password: newUserPassword, role: newUserRole, name: newUserName, supabaseUrl: url, supabaseKey: key } });
        if (result.error) throw new Error(result.error);


      toast.success(`User ${newUserEmail} created successfully.`);
      setNewUserEmail("");
      setNewUserPassword("");
      setNewUserName("");
      setNewUserRole("CLIENT");

      setTimeout(() => fetchUsers(), 1000);
    } catch (error: any) {
      toast.error(error.message || "Failed to create user.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateStatus = async (userId: string, newStatus: string) => {
    try {
      const { error } = await supabase.from("users").update({ status: newStatus }).eq("id", userId);

      if (error) throw error;

      toast.success(`User status updated to ${newStatus}.`);
      setUsers(users.map((u) => (u.id === userId ? { ...u, status: newStatus } : u)));
    } catch (error: any) {
      toast.error(error.message || "Failed to update user status.");
    }
  };

  const handleHardDelete = async (userId: string, email: string) => {
    if (
      !window.confirm(
        `Are you absolutely sure you want to PERMANENTLY delete ${email}? This cannot be undone.`,
      )
    ) {
      return;
    }

    setIsDeleting(userId);
    try {
      const { error } = await supabase.rpc("delete_user", { target_user_id: userId });
      if (error) throw error;

      toast.success(`User ${email} permanently deleted.`);
      setUsers(users.filter((u) => u.id !== userId));
    } catch (error: any) {
      toast.error(error.message || "Failed to delete user. Ensure the SQL function was created.");
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="space-y-12 animate-fade-in">
      <header className="pb-8 border-b border-gold/20">
        <h1 className="text-4xl font-display font-medium tracking-wide text-foreground">
          User Management
        </h1>
        <p className="text-muted-foreground mt-2 tracking-wide font-light">
          Manage platform clients, their access levels, and security states.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Add User Section */}
        <div className="lg:col-span-1">
          <div className="relative overflow-hidden rounded-xl border border-gold/20 bg-background/50 backdrop-blur-sm p-6 shadow-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-gold/5 to-transparent pointer-events-none" />
            <div className="relative z-10">
              <h2 className="text-xl font-display font-medium mb-1">Create New Client</h2>
              <p className="text-xs text-muted-foreground font-light mb-6">
                Register a new couple to access their dashboard.
              </p>

              <form onSubmit={handleCreateUser} className="space-y-5">
                <div className="space-y-2">
                  <Label
                    htmlFor="newUserName"
                    className="text-xs tracking-wider uppercase text-muted-foreground"
                  >
                    Client Name
                  </Label>
                  <Input
                    id="newUserName"
                    type="text"
                    placeholder="Couple Name (e.g. Arjun & Priya)"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    className="border-gold/20 focus-visible:ring-gold/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="newUserEmail"
                    className="text-xs tracking-wider uppercase text-muted-foreground"
                  >
                    Client Email
                  </Label>
                  <Input
                    id="newUserEmail"
                    type="email"
                    placeholder="couple@example.com"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    required
                    className="border-gold/20 focus-visible:ring-gold/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="newUserPassword"
                    className="text-xs tracking-wider uppercase text-muted-foreground"
                  >
                    Temporary Password
                  </Label>
                  <Input
                    id="newUserPassword"
                    type="text"
                    placeholder="Enter a secure password"
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    required
                    minLength={6}
                    className="border-gold/20 focus-visible:ring-gold/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="newUserRole"
                    className="text-xs tracking-wider uppercase text-muted-foreground"
                  >
                    Role
                  </Label>
                  <select
                    id="newUserRole"
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as "ADMIN" | "CLIENT")}
                    className="w-full border border-gold/20 rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-gold/50"
                  >
                    <option value="CLIENT">Client</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
                <Button
                  type="submit"
                  disabled={isCreating}
                  className="w-full bg-gold text-gold-foreground hover:bg-gold/90 transition-colors"
                >
                  {isCreating ? "Creating..." : "Add Client"}
                </Button>
              </form>
            </div>
          </div>
        </div>

        {/* User List Section */}
        <div className="lg:col-span-2">
          <div className="relative overflow-hidden rounded-xl border border-gold/20 bg-background/50 backdrop-blur-sm p-6 shadow-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-gold/5 to-transparent pointer-events-none" />
            <div className="relative z-10">
              <h2 className="text-xl font-display font-medium mb-1">Active Platform Users</h2>
              <p className="text-xs text-muted-foreground font-light mb-6">
                All registered accounts and their current statuses.
              </p>

              {isLoadingUsers ? (
                <div className="text-sm text-muted-foreground py-12 text-center animate-pulse">
                  Loading users...
                </div>
              ) : users.length === 0 ? (
                <div className="text-sm text-muted-foreground font-light italic text-center py-12 border border-dashed border-gold/30 rounded-lg">
                  No users found in the database.
                </div>
              ) : (
                <div className="rounded-lg border border-gold/20 overflow-hidden bg-background">
                  <Table>
                    <TableHeader className="bg-gold/5">
                      <TableRow className="border-gold/20 hover:bg-transparent">
                        <TableHead className="font-medium text-xs uppercase tracking-wider text-muted-foreground">
                          Email
                        </TableHead>
                        <TableHead className="font-medium text-xs uppercase tracking-wider text-muted-foreground">
                          Role
                        </TableHead>
                        <TableHead className="font-medium text-xs uppercase tracking-wider text-muted-foreground">
                          Status
                        </TableHead>
                        <TableHead className="text-right font-medium text-xs uppercase tracking-wider text-muted-foreground">
                          Action
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((u) => (
                        <TableRow
                          key={u.id}
                          className="border-gold/10 transition-colors hover:bg-gold/5"
                        >
                          <TableCell className="font-medium">
                            <div className="flex flex-col">
                              <span className="text-sm text-foreground">{u.name}</span>
                              <span className="text-xs text-muted-foreground font-light">
                                {u.email}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={`text-[10px] tracking-wider uppercase border-gold/30 ${u.role === "ADMIN" ? "text-gold" : "text-muted-foreground"}`}
                            >
                              {u.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={u.status === "ACTIVE" || !u.status ? "default" : "secondary"}
                              className={`text-[10px] tracking-wider uppercase ${u.status === "ACTIVE" || !u.status ? "bg-gold/10 text-gold hover:bg-gold/20 border-transparent" : "bg-muted text-muted-foreground border-transparent"}`}
                            >
                              {u.status || "ACTIVE"}
                            </Badge>
                          </TableCell>
                          
                      <TableCell className="text-right flex items-center justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleResetPassword(u.email)} className="text-xs">Reset Password</Button>

                            {u.role !== "ADMIN" && (
                              <div className="flex items-center justify-end gap-2">
                                <Select
                                  value={u.status || "ACTIVE"}
                                  onValueChange={(val) => handleUpdateStatus(u.id, val)}
                                >
                                  <SelectTrigger className="w-[110px] h-8 text-xs border-gold/20 focus:ring-gold/50">
                                    <SelectValue placeholder="Status" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="ACTIVE">Set Active</SelectItem>
                                    <SelectItem value="HOLD">Put on Hold</SelectItem>
                                  </SelectContent>
                                </Select>

                                <Button
                                  variant="destructive"
                                  size="icon"
                                  className="h-8 w-8 bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
                                  onClick={() => handleHardDelete(u.id, u.email)}
                                  disabled={isDeleting === u.id}
                                  title="Permanently Delete"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
