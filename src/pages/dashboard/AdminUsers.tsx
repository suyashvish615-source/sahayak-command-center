import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import SystemPanel from "@/components/SystemPanel";
import { Button } from "@/components/ui/button";
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
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Failed to load users", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); }, []);

  const handleApprove = async (user: DBUser) => {
    setActionLoading(user.id);
    try {
      await approveUser(user.id, adminEmail);
      toast({ title: "Approved", description: `${user.name} (${user.email}) has been approved.` });
      await refresh();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (user: DBUser) => {
    setActionLoading(user.id + "_reject");
    try {
      await rejectUser(user.id, adminEmail);
      toast({ title: "Rejected", description: `${user.name}'s registration has been rejected.` });
      await refresh();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setActionLoading(null);
    }
  };

  const filteredUsers = users.filter(u => {
    if (filter === "all") return true;
    return u.status === filter;
  });

  const pendingCount = users.filter(u => u.status === "pending").length;
  const approvedCount = users.filter(u => u.status === "approved").length;
  const rejectedCount = users.filter(u => u.status === "rejected").length;

  const statusBadge = (status: string) => {
    if (status === "pending") return <span className="px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary border border-primary/20 flex items-center gap-1"><Clock className="w-3 h-3" /> Pending</span>;
    if (status === "approved") return <span className="px-2 py-0.5 rounded-full text-xs bg-primary/20 text-primary border border-primary/30 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Approved</span>;
    if (status === "rejected") return <span className="px-2 py-0.5 rounded-full text-xs bg-destructive/20 text-destructive border border-destructive/30 flex items-center gap-1"><XCircle className="w-3 h-3" /> Rejected</span>;
  };

  if (loading) {
    return (
      <DashboardLayout role="admin">
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="admin">
      <div className="min-h-screen">
        <header className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-40">
          <div className="px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="font-display text-lg font-semibold text-foreground">User Management</h1>
              {pendingCount > 0 && (
                <span className="px-2.5 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-semibold">
                  {pendingCount} pending approval
                </span>
              )}
            </div>
            <Button variant="ghost" size="sm" onClick={refresh} className="text-muted-foreground hover:text-foreground">
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </header>

        <div className="p-6 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <SystemPanel>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <div className="text-2xl font-display font-bold text-primary">{pendingCount}</div>
                  <div className="text-xs text-muted-foreground">Pending Approval</div>
                </div>
              </div>
            </SystemPanel>
            <SystemPanel>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <div className="text-2xl font-display font-bold text-foreground">{approvedCount}</div>
                  <div className="text-xs text-muted-foreground">Approved Users</div>
                </div>
              </div>
            </SystemPanel>
            <SystemPanel>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-destructive/10 flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-destructive" />
                </div>
                <div>
                  <div className="text-2xl font-display font-bold text-destructive">{rejectedCount}</div>
                  <div className="text-xs text-muted-foreground">Rejected</div>
                </div>
              </div>
            </SystemPanel>
          </div>

          {/* Filter tabs */}
          <div className="flex gap-2 flex-wrap">
            {(["pending", "approved", "rejected", "all"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-4 py-2 rounded-md text-sm font-medium transition-all capitalize",
                  filter === f
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
              >
                {f} {f !== "all" && `(${users.filter(u => u.status === f).length})`}
              </button>
            ))}
          </div>

          {/* Users list */}
          <SystemPanel title="Registered Users" subtitle="Manage teacher access to the platform">
            {filteredUsers.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No {filter === "all" ? "" : filter} users found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className={cn(
                      "flex items-center justify-between p-4 rounded-lg border transition-all",
                      user.status === "pending"
                        ? "border-primary/30 bg-primary/5"
                        : "border-border bg-accent"
                    )}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-primary font-semibold text-sm">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-foreground text-sm">{user.name}</span>
                          <span className="px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary border border-primary/20 capitalize flex items-center gap-1">
                            <Shield className="w-3 h-3" /> {user.role}
                          </span>
                          {statusBadge(user.status)}
                        </div>
                        <div className="text-xs text-muted-foreground">{user.email}</div>
                        {user.school_name && (
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <School className="w-3 h-3" /> {user.school_name}
                          </div>
                        )}
                        <div className="text-xs text-muted-foreground">
                          Registered: {new Date(user.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          {user.approved_at && ` • Approved: ${new Date(user.approved_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`}
                        </div>
                      </div>
                    </div>

                    {user.role === "teacher" && (
                      <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                        {user.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              variant="system-success"
                              onClick={() => handleApprove(user)}
                              disabled={actionLoading === user.id}
                            >
                              {actionLoading === user.id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <><CheckCircle className="w-3 h-3" /> Approve</>
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="system-critical"
                              onClick={() => handleReject(user)}
                              disabled={actionLoading === user.id + "_reject"}
                            >
                              {actionLoading === user.id + "_reject" ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <><XCircle className="w-3 h-3" /> Reject</>
                              )}
                            </Button>
                          </>
                        )}
                        {user.status === "approved" && (
                          <Button
                            size="sm"
                            variant="system-critical"
                            onClick={() => handleReject(user)}
                            disabled={!!actionLoading}
                          >
                            <XCircle className="w-3 h-3" /> Revoke
                          </Button>
                        )}
                        {user.status === "rejected" && (
                          <Button
                            size="sm"
                            variant="system-success"
                            onClick={() => handleApprove(user)}
                            disabled={!!actionLoading}
                          >
                            <CheckCircle className="w-3 h-3" /> Re-approve
                          </Button>
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
