import { ReactNode, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  Shield, 
  LayoutDashboard, 
  BookOpen, 
  BarChart3, 
  Settings,
  ChevronLeft,
  LogOut,
  Menu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: ReactNode;
  role: "teacher" | "crp" | "admin";
}

const DashboardLayout = ({ children, role }: DashboardLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const roleConfig = {
    teacher: {
      title: "Teacher Console",
      nav: [
        { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard/teacher" },
        { label: "Sessions", icon: BookOpen, path: "/dashboard/teacher/sessions" },
        { label: "Analytics", icon: BarChart3, path: "/dashboard/teacher/analytics" },
        { label: "Settings", icon: Settings, path: "/dashboard/teacher/settings" },
      ]
    },
    crp: {
      title: "CRP Console",
      nav: [
        { label: "Overview", icon: LayoutDashboard, path: "/dashboard/crp" },
        { label: "Teachers", icon: BookOpen, path: "/dashboard/crp/teachers" },
        { label: "Analytics", icon: BarChart3, path: "/dashboard/crp/analytics" },
        { label: "Settings", icon: Settings, path: "/dashboard/crp/settings" },
      ]
    },
    admin: {
      title: "Admin Console",
      nav: [
        { label: "System", icon: LayoutDashboard, path: "/dashboard/admin" },
        { label: "Users", icon: BookOpen, path: "/dashboard/admin/users" },
        { label: "Reports", icon: BarChart3, path: "/dashboard/admin/reports" },
        { label: "Settings", icon: Settings, path: "/dashboard/admin/settings" },
      ]
    }
  };

  const config = roleConfig[role];

  const handleLogout = () => {
    // Clear token and redirect
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background flex w-full">
      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed left-0 top-0 h-full border-r border-panel-border bg-sidebar flex flex-col transition-all duration-300 z-50",
          collapsed ? "w-16" : "w-60"
        )}
      >
        {/* Header */}
        <div className="h-16 border-b border-sidebar-border flex items-center justify-between px-4">
          {!collapsed && (
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-md bg-primary/10 border border-primary/30 flex items-center justify-center">
                <Shield className="w-4 h-4 text-primary" />
              </div>
              <span className="font-display font-semibold text-sm tracking-tight text-foreground">
                SAHAYAK
              </span>
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            {collapsed ? <Menu className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </Button>
        </div>

        {/* Role Badge */}
        {!collapsed && (
          <div className="px-4 py-3 border-b border-sidebar-border">
            <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
              {config.title}
            </span>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 py-4 px-2 space-y-1">
          {config.nav.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200",
                  isActive 
                    ? "bg-sidebar-accent text-foreground" 
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-foreground"
                )}
              >
                <item.icon className={cn("w-4 h-4 flex-shrink-0", isActive && "text-primary")} />
                {!collapsed && (
                  <span className="text-sm font-medium">{item.label}</span>
                )}
                {isActive && !collapsed && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-sidebar-border">
          <Button
            variant="ghost"
            onClick={handleLogout}
            className={cn(
              "w-full justify-start gap-3 text-muted-foreground hover:text-foreground",
              collapsed && "justify-center"
            )}
          >
            <LogOut className="w-4 h-4" />
            {!collapsed && <span className="text-sm">Logout</span>}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main 
        className={cn(
          "flex-1 transition-all duration-300",
          collapsed ? "ml-16" : "ml-60"
        )}
      >
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
