import { ReactNode, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, BookOpen, BarChart3, ChevronLeft,
  LogOut, Menu, Users
} from "lucide-react";
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
      title: "Teacher",
      nav: [
        { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard/teacher" },
        { label: "Sessions", icon: BookOpen, path: "/dashboard/teacher/sessions" },
        { label: "Analytics", icon: BarChart3, path: "/dashboard/teacher/analytics" },
      ]
    },
    crp: {
      title: "CRP",
      nav: [
        { label: "Overview", icon: LayoutDashboard, path: "/dashboard/crp" },
        { label: "Teachers", icon: Users, path: "/dashboard/crp/teachers" },
        { label: "Analytics", icon: BarChart3, path: "/dashboard/crp/analytics" },
      ]
    },
    admin: {
      title: "Admin",
      nav: [
        { label: "System", icon: LayoutDashboard, path: "/dashboard/admin" },
        { label: "Users", icon: Users, path: "/dashboard/admin/users" },
        { label: "Reports", icon: BarChart3, path: "/dashboard/admin/reports" },
      ]
    }
  };

  const config = roleConfig[role];
  const handleLogout = () => { localStorage.clear(); navigate("/login"); };

  return (
    <div className="min-h-screen bg-background flex w-full overflow-hidden">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 60 : 220 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed left-0 top-0 h-full border-r border-border bg-sidebar flex flex-col z-50"
      >
        {/* Logo */}
        <div className="h-14 border-b border-sidebar-border flex items-center justify-between px-3">
          <AnimatePresence mode="wait">
            {!collapsed && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                <Link to="/" className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center flex-shrink-0">
                    <span className="text-primary-foreground font-black text-xs">S</span>
                  </div>
                  <span className="font-semibold text-sm tracking-tight text-foreground">SAHAYAK</span>
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            {collapsed ? <Menu className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Role label */}
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="px-4 py-2.5 border-b border-sidebar-border overflow-hidden"
            >
              <span className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-medium">
                {config.title}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Nav */}
        <nav className="flex-1 py-3 px-2 space-y-0.5">
          {config.nav.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 relative",
                  isActive
                    ? "bg-accent text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-r-full bg-primary"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <item.icon className={cn("w-4 h-4 flex-shrink-0", isActive && "text-primary")} />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      className="whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-2 border-t border-sidebar-border">
          <button
            onClick={handleLogout}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors w-full",
              collapsed && "justify-center"
            )}
          >
            <LogOut className="w-4 h-4" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main */}
      <motion.main
        animate={{ marginLeft: collapsed ? 60 : 220 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="flex-1 min-h-screen"
      >
        {children}
      </motion.main>
    </div>
  );
};

export default DashboardLayout;
