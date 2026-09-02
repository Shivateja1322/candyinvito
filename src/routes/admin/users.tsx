import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { useAuth } from "../../lib/auth-context";
import { supabase } from "../../lib/supabase";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { toast } from "sonner";
import { Trash2, KeyRound, UserPlus, Shield, User, Loader2, Check, Sparkles } from "lucide-react";

const serverCreateUser = createServerFn({ method: "POST" })
  .validator((data: any) => data)
  .handler(async (ctx) => {
    const { email, password, role, name, supabaseUrl, supabaseKey } = ctx.data || (ctx as any);
    const adminSupabase = createClient(supabaseUrl, supabaseKey);
    const { data, error } = await adminSupabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role,
          name,
        },
      },
    });
    if (error) return { error: error.message };
    return { success: true, user: data.user };
  });

const serverResetPassword = createServerFn({ method: "POST" })
  .validator((data: any) => data)
  .handler(async (ctx) => {
    const { email, supabaseUrl, supabaseKey } = ctx.data || (ctx as any);
    const adminSupabase = createClient(supabaseUrl, supabaseKey);
    const { error } = await adminSupabase.auth.resetPasswordForEmail(email);
    if (error) return { error: error.message };
    return { success: true };
  });

export const Route = createFileRoute("/admin/users")({
  component: UserManagement,
});

function UserManagement() {
  const { user: currentAdmin } = useAuth();
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserName, setNewUserName] = useState("");
  const [newUserRole, setNewUserRole] = useState<"ADMIN" | "CLIENT">("CLIENT");
  const [isCreating, setIsCreating] = useState(false);

  const [users, setUsers] = useState<any[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Password reset modal state
  const [passwordModalUser, setPasswordModalUser] = useState<any | null>(null);
  const [newPasswordValue, setNewPasswordValue] = useState("");
  const [isSettingPassword, setIsSettingPassword] = useState(false);

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
      const result = await serverCreateUser({
        data: {
          email: newUserEmail,
          password: newUserPassword,
          role: newUserRole,
          name: newUserName,
          supabaseUrl: url,
          supabaseKey: key,
        },
      });
      if (result.error) throw new Error(result.error);

      // Explicitly ensure public.users role is set
      if (result.user?.id) {
        try {
          await supabase
            .from("users")
            .update({
              role: newUserRole,
              name: newUserName || (newUserRole === "ADMIN" ? "Platform Admin" : "CandyInvito Client"),
            })
            .eq("id", result.user.id);
        } catch {}
      }

      toast.success(`User ${newUserEmail} created as ${newUserRole} successfully.`);
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
    if (userId === currentAdmin?.id) {
      toast.error("You cannot delete your own active account.");
      return;
    }

    if (
      !window.confirm(
        `Are you absolutely sure you want to PERMANENTLY delete user "${email}"?\n\nThis will remove their invitations and account completely.`,
      )
    ) {
      return;
    }

    setIsDeleting(userId);
    try {
      // 1. Clean up dependent deployment requests & invitations first
      await supabase.from("deployment_requests").delete().eq("requested_by", userId);
      await supabase.from("invitations").delete().eq("client_id", userId);
      await supabase.from("users").delete().eq("id", userId);

      // 2. Call delete_user SQL RPC to remove from auth.users
      try {
        await supabase.rpc("delete_user", { target_user_id: userId });
      } catch (rpcErr) {
        console.warn("delete_user RPC warning:", rpcErr);
      }

      toast.success(`User ${email} deleted successfully.`);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (error: any) {
      toast.error(error.message || "Failed to delete user.");
    } finally {
      setIsDeleting(null);
    }
  };

  const handleDirectPasswordSave = async () => {
    if (!passwordModalUser || !newPasswordValue) return;
    if (newPasswordValue.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    setIsSettingPassword(true);
    try {
      // If changing current logged-in admin's password
      if (passwordModalUser.id === currentAdmin?.id) {
        const { error } = await supabase.auth.updateUser({ password: newPasswordValue });
        if (error) throw error;
        toast.success("Your password has been updated successfully.");
        setPasswordModalUser(null);
        setNewPasswordValue("");
        return;
      }

      // If changing another user's password via RPC
      const { error: rpcErr } = await supabase.rpc("admin_set_user_password", {
        target_user_id: passwordModalUser.id,
        new_password: newPasswordValue,
      });

      if (rpcErr) {
        // Fallback: send password reset email if RPC is not installed
        const url = import.meta.env.VITE_SUPABASE_URL;
        const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
        const emailRes = await serverResetPassword({
          data: { email: passwordModalUser.email, supabaseUrl: url, supabaseKey: key },
        });
        if (emailRes.error) throw new Error(emailRes.error);
        toast.success(`Direct reset unavailable; reset link emailed to ${passwordModalUser.email}`);
      } else {
        toast.success(`Password for ${passwordModalUser.email} updated successfully!`);
      }

      setPasswordModalUser(null);
      setNewPasswordValue("");
    } catch (err: any) {
      toast.error(err.message || "Failed to update password.");
    } finally {
      setIsSettingPassword(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in font-sans pb-10">
      {/* Header */}
      <header className="pb-6 border-b border-[#201814]/10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-[10px] tracking-[0.22em] uppercase text-[#201814]/50 font-bold mb-1.5 flex items-center gap-1.5">
            <Sparkles size={12} className="text-[#DCA963]" /> Studio Security & Access
          </p>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight text-[#201814]">
            User & Role Management
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-black/10 rounded-full text-xs font-bold uppercase tracking-wider text-black/70 shadow-2xs">
            Total Accounts: <strong className="text-[#201814]">{users.length}</strong>
          </span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Create User Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-black/10 p-5 sm:p-6 shadow-xs sticky top-20">
            <div className="flex items-center gap-3 mb-5 pb-3 border-b border-black/5">
              <div className="p-2.5 bg-[#DCA963]/10 text-[#DCA963] rounded-xl">
                <UserPlus size={18} />
              </div>
              <div>
                <h2 className="text-lg font-serif font-bold text-[#201814]">Create User</h2>
                <p className="text-xs text-black/50">Add a client or administrator account.</p>
              </div>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <Label htmlFor="newUserName" className="text-xs font-bold uppercase tracking-wider text-black/60 block mb-1.5">
                  Full Name / Couple Title
                </Label>
                <Input
                  id="newUserName"
                  type="text"
                  placeholder="e.g. Arjun & Priya"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="border-black/10 rounded-xl focus-visible:ring-[#DCA963] text-sm py-2.5"
                />
              </div>

              <div>
                <Label htmlFor="newUserEmail" className="text-xs font-bold uppercase tracking-wider text-black/60 block mb-1.5">
                  Email Address *
                </Label>
                <Input
                  id="newUserEmail"
                  type="email"
                  placeholder="client@example.com"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  required
                  className="border-black/10 rounded-xl focus-visible:ring-[#DCA963] text-sm py-2.5"
                />
              </div>

              <div>
                <Label htmlFor="newUserPassword" className="text-xs font-bold uppercase tracking-wider text-black/60 block mb-1.5">
                  Initial Password *
                </Label>
                <Input
                  id="newUserPassword"
                  type="text"
                  placeholder="Enter initial password"
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  required
                  minLength={6}
                  className="border-black/10 rounded-xl focus-visible:ring-[#DCA963] text-sm py-2.5"
                />
              </div>

              <div>
                <Label htmlFor="newUserRole" className="text-xs font-bold uppercase tracking-wider text-black/60 block mb-1.5">
                  Account Role *
                </Label>
                <select
                  id="newUserRole"
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as "ADMIN" | "CLIENT")}
                  className="w-full border border-black/10 rounded-xl px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:border-[#DCA963] transition-colors"
                >
                  <option value="CLIENT">Client (Standard Access)</option>
                  <option value="ADMIN">Admin (Full System Access)</option>
                </select>
              </div>

              <Button
                type="submit"
                disabled={isCreating}
                className="w-full bg-[#141210] hover:bg-[#DCA963] hover:text-[#141210] text-white rounded-xl py-3 text-xs font-bold uppercase tracking-widest transition-all shadow-xs mt-2"
              >
                {isCreating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {isCreating ? "Creating Account..." : "Create Account"}
              </Button>
            </form>
          </div>
        </div>

        {/* User Table List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-black/10 shadow-xs overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-black/5 flex items-center justify-between">
              <h2 className="text-lg font-serif font-bold text-[#201814]">Platform Accounts</h2>
              <span className="text-xs font-semibold text-black/40">
                {users.length} Registered
              </span>
            </div>

            {isLoadingUsers ? (
              <div className="p-16 flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-[#DCA963]" />
                <span className="text-xs text-black/40">Loading platform accounts...</span>
              </div>
            ) : users.length === 0 ? (
              <div className="p-12 text-center text-black/40 italic">
                No users found in database.
              </div>
            ) : (
              <div className="overflow-x-auto -mx-0">
                <Table>
                  <TableHeader className="bg-[#FAF9F6]">
                    <TableRow className="border-black/5 hover:bg-transparent">
                      <TableHead className="text-[10px] uppercase font-bold tracking-widest text-black/50 py-3.5 pl-5">User Details</TableHead>
                      <TableHead className="text-[10px] uppercase font-bold tracking-widest text-black/50 py-3.5">Role</TableHead>
                      <TableHead className="text-[10px] uppercase font-bold tracking-widest text-black/50 py-3.5">Status</TableHead>
                      <TableHead className="text-[10px] uppercase font-bold tracking-widest text-black/50 py-3.5 text-right pr-5">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((u) => {
                      const isSelf = u.id === currentAdmin?.id;
                      const isAdmin = u.role?.toUpperCase() === "ADMIN";

                      return (
                        <TableRow key={u.id} className="border-black/5 hover:bg-[#FAF9F6]/60 transition-colors">
                          <TableCell className="py-4 pl-5">
                            <div className="flex flex-col">
                              <span className="font-bold text-sm text-[#201814] flex items-center gap-1.5">
                                {u.name || (isAdmin ? "Admin User" : "Client User")}
                                {isSelf && (
                                  <span className="bg-[#DCA963]/20 text-[#DCA963] text-[9px] font-extrabold px-1.5 py-0.5 rounded">
                                    YOU
                                  </span>
                                )}
                              </span>
                              <span className="text-xs text-black/50 font-normal mt-0.5">{u.email}</span>
                            </div>
                          </TableCell>
                          <TableCell className="py-4">
                            <span
                              className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                                isAdmin
                                  ? "bg-purple-100 text-purple-800 border border-purple-200"
                                  : "bg-blue-100 text-blue-800 border border-blue-200"
                              }`}
                            >
                              {isAdmin ? <Shield size={10} /> : <User size={10} />}
                              {u.role}
                            </span>
                          </TableCell>
                          <TableCell className="py-4">
                            <span
                              className={`inline-flex items-center text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                                u.status === "ACTIVE" || !u.status
                                  ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                  : "bg-amber-100 text-amber-800 border border-amber-200"
                              }`}
                            >
                              {u.status || "ACTIVE"}
                            </span>
                          </TableCell>
                          <TableCell className="py-4 text-right pr-5">
                            <div className="flex items-center justify-end gap-2">
                              {/* Direct Set Password Button */}
                              <button
                                onClick={() => {
                                  setPasswordModalUser(u);
                                  setNewPasswordValue("");
                                }}
                                className="flex items-center gap-1 bg-black/5 hover:bg-[#DCA963] hover:text-[#141210] text-[#201814] px-2.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors shadow-2xs"
                                title="Reset or set new password"
                              >
                                <KeyRound size={13} />
                                <span className="hidden sm:inline">Set Pass</span>
                              </button>

                              {/* Status Dropdown */}
                              <Select
                                value={u.status || "ACTIVE"}
                                onValueChange={(val) => handleUpdateStatus(u.id, val)}
                              >
                                <SelectTrigger className="w-[90px] h-8 text-xs border-black/10 rounded-lg">
                                  <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="ACTIVE">Active</SelectItem>
                                  <SelectItem value="HOLD">On Hold</SelectItem>
                                </SelectContent>
                              </Select>

                              {/* Delete Button (Can delete ANY user except oneself) */}
                              {!isSelf ? (
                                <button
                                  onClick={() => handleHardDelete(u.id, u.email)}
                                  disabled={isDeleting === u.id}
                                  className="p-1.5 text-black/40 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                  title="Permanently Delete User"
                                >
                                  {isDeleting === u.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <Trash2 size={15} />
                                  )}
                                </button>
                              ) : (
                                <span className="w-6" />
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Direct Password Reset Modal */}
      {passwordModalUser && (
        <Dialog open={!!passwordModalUser} onOpenChange={() => setPasswordModalUser(null)}>
          <DialogContent className="sm:max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-black/10">
            <DialogHeader>
              <DialogTitle className="font-serif text-xl font-bold text-[#201814] flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-[#DCA963]" /> Set New Password
              </DialogTitle>
              <DialogDescription className="text-xs text-black/60 pt-1">
                Directly change the login password for{" "}
                <strong className="text-[#201814]">{passwordModalUser.email}</strong>.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="directNewPassword" className="text-xs font-bold uppercase tracking-wider text-black/50 block mb-1.5">
                  New Password (min. 6 characters)
                </Label>
                <Input
                  id="directNewPassword"
                  type="text"
                  placeholder="Enter new password"
                  value={newPasswordValue}
                  onChange={(e) => setNewPasswordValue(e.target.value)}
                  className="rounded-xl border-black/10 focus-visible:ring-[#DCA963] text-sm py-2.5"
                  autoFocus
                />
              </div>
            </div>

            <DialogFooter className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setPasswordModalUser(null)}
                className="w-full sm:w-auto rounded-xl text-xs font-bold uppercase tracking-wider"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDirectPasswordSave}
                disabled={isSettingPassword || !newPasswordValue}
                className="w-full sm:w-auto bg-[#141210] hover:bg-[#DCA963] hover:text-[#141210] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow-xs"
              >
                {isSettingPassword ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {isSettingPassword ? "Saving..." : "Save Password"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
