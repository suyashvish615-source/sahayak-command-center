import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import SystemPanel from "@/components/SystemPanel";
import { CheckCircle, XCircle, Clock, Users, RefreshCw, Loader2, Shield, School } from "lucide-react";
import { getAllUsers, approveUser, rejectUser, DBUser } from "@/lib/database";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const AdminUsers = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<DBUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const adminEmail = localStorage.getItem("sahayak_user_email") || "admin";

  const refresh = async () => {
    setLoading(true);
    try { setUsers(await getAllUsers()); } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Failed to load users", variant: "destructive" });
    } finally { setLoading(false); }
  };

  useEffect(() => { refresh(); }, []);

  const handleApprove = async (user: DBUser) => {
    setActionLoading(user.id);
    try { await approveUser(user.id, adminEmail); toast({ title: `${user.name} approved` }); await refresh(); }
    catch (err: any) { toast({ title: "Error", description: err.message, variant: "destructive" }); }
    finally { setActionLoading(null); }
  };

  const handleReject = async (user: DBUser) => {
    setActionLoading(user.id + "_r");
    try { await rejectUser(user.id, adminEmail); toast({ title: `${user.name} rejected` }); await refresh(); }
    catch (err: any) { toast({ title: "Error", description: err.message, variant: "destructive" }); }
    finally { setActionLoading(null); }
  };

  const filteredUsers = users.filter(u => filter === "all" || u.status === filter);
  const pendingCount = users.filter(u => u.status === "pending").length;
  const approvedCount = users.filter(u => u.status === "approved").length;
  const rejectedCount = users.filter(u => u.status === "rejected").length;

  if (loading) {
    return (
      <DashboardLayout role="admin">
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="admin">
      <div className="min-h-screen">
        <header className="border-b border-border glass sticky top-0 z-40">
          <div className="px-6 h-14 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="font-semibold text-foreground">User Management</h1>
              {pendingCount > 0 && (
                <span className="px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">
                  {pendingCount} pending
                </span>
              )}
            </div>
            <button onClick={refresh} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </header>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: Clock, value: pendingCount, label: "Pending", color: "text-primary" },
              { icon: Users, value: approvedCount, label: "Approved", color: "text-foreground" },
              { icon: XCircle, value: rejectedCount, label: "Rejected", color: "text-destructive" },
            ].map((s) => (
              <SystemPanel key={s.label}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <s.icon className={`w-5 h-5 ${s.color}`} />
                  </div>
                  <div>
                    <div className={`text-xl font-bold font-mono ${s.color}`}>{s.value}</div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-widest">{s.label}</div>
                  </div>
                </div>
              </SystemPanel>
            ))}
          </div>

          <div className="flex gap-1">
            {(["pending", "approved", "rejected", "all"] as const).map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize",
                  filter === f ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}>
                {f} {f !== "all" && `(${users.filter(u => u.status === f).length})`}
              </button>
            ))}
          </div>

          <SystemPanel title="Users" subtitle="Manage teacher access">
            {filteredUsers.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                <Users className="w-8 h-8 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No {filter === "all" ? "" : filter} users</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredUsers.map((user) => (
                  <div key={user.id}
                    className={cn(
                      "flex items-center justify-between p-4 rounded-xl border transition-all",
                      user.status === "pending" ? "border-primary/20 bg-primary/5" : "border-border bg-accent/30"
                    )}>
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-primary font-bold text-sm">{user.name.charAt(0).toUpperCase()}</span>
                      </div>
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-foreground text-sm">{user.name}</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] bg-accent text-muted-foreground border border-border capitalize flex items-center gap-1">
                            <Shield className="w-2.5 h-2.5" /> {user.role}
                          </span>
                          {user.status === "pending" && <span className="px-2 py-0.5 rounded-full text-[10px] bg-primary/10 text-primary border border-primary/20 flex items-center gap-1"><Clock className="w-2.5 h-2.5" /> Pending</span>}
                          {user.status === "approved" && <span className="px-2 py-0.5 rounded-full text-[10px] bg-primary/10 text-primary border border-primary/20 flex items-center gap-1"><CheckCircle className="w-2.5 h-2.5" /> Approved</span>}
                          {user.status === "rejected" && <span className="px-2 py-0.5 rounded-full text-[10px] bg-destructive/10 text-destructive border border-destructive/20 flex items-center gap-1"><XCircle className="w-2.5 h-2.5" /> Rejected</span>}
                        </div>
                        <div className="text-xs text-muted-foreground">{user.email}</div>
                        {user.school_name && <div className="text-xs text-muted-foreground flex items-center gap-1"><School className="w-3 h-3" /> {user.school_name}</div>}
                      </div>
                    </div>

                    {user.role === "teacher" && (
                      <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                        {user.status === "pending" && (
                          <>
                            <button onClick={() => handleApprove(user)} disabled={actionLoading === user.id}
                              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors flex items-center gap-1 disabled:opacity-50">
                              {actionLoading === user.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />} Approve
                            </button>
                            <button onClick={() => handleReject(user)} disabled={actionLoading === user.id + "_r"}
                              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20 transition-colors flex items-center gap-1 disabled:opacity-50">
                              {actionLoading === user.id + "_r" ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3 h-3" />} Reject
                            </button>
                          </>
                        )}
                        {user.status === "approved" && (
                          <button onClick={() => handleReject(user)} disabled={!!actionLoading}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20 transition-colors flex items-center gap-1 disabled:opacity-50">
                            <XCircle className="w-3 h-3" /> Revoke
                          </button>
                        )}
                        {user.status === "rejected" && (
                          <button onClick={() => handleApprove(user)} disabled={!!actionLoading}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors flex items-center gap-1 disabled:opacity-50">
                            <CheckCircle className="w-3 h-3" /> Re-approve
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </SystemPanel>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminUsers;
