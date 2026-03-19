import { ReactNode, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Shield, 
  LayoutDashboard, 
  BookOpen, 
  BarChart3, 
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
      ]
    },
    crp: {
      title: "CRP Console",
      nav: [
        { label: "Overview", icon: LayoutDashboard, path: "/dashboard/crp" },
        { label: "Teachers", icon: BookOpen, path: "/dashboard/crp/teachers" },
        { label: "Analytics", icon: BarChart3, path: "/dashboard/crp/analytics" },
      ]
    },
    admin: {
      title: "Admin Console",
      nav: [
        { label: "System", icon: LayoutDashboard, path: "/dashboard/admin" },
        { label: "Users", icon: BookOpen, path: "/dashboard/admin/users" },
        { label: "Reports", icon: BarChart3, path: "/dashboard/admin/reports" },
      ]
    }
  };

  const config = roleConfig[role];

  const handleLogout = () => {
    navigate("/login");
  };

  const sidebarVariants = {
    expanded: { width: 240 },
    collapsed: { width: 64 }
  };

  return (
    <div className="min-h-screen bg-background flex w-full overflow-hidden">
      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={collapsed ? "collapsed" : "expanded"}
        variants={sidebarVariants}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed left-0 top-0 h-full border-r border-panel-border bg-sidebar flex flex-col z-50"
      >
        {/* Header */}
        <div className="h-16 border-b border-sidebar-border flex items-center justify-between px-4">
          <AnimatePresence mode="wait">
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                <Link to="/" className="flex items-center gap-2.5">
                  <motion.div 
                    className="w-8 h-8 rounded-md bg-primary/10 border border-primary/30 flex items-center justify-center"
                    whileHover={{ scale: 1.1 }}
                    animate={{ 
                      boxShadow: [
                        "0 0 0px hsl(var(--primary) / 0.3)",
                        "0 0 15px hsl(var(--primary) / 0.3)",
                        "0 0 0px hsl(var(--primary) / 0.3)",
                      ],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Shield className="w-4 h-4 text-primary" />
                  </motion.div>
                  <span className="font-display font-semibold text-sm tracking-tight text-foreground">
                    SAHAYAK
                  </span>
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCollapsed(!collapsed)}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              <motion.div
                animate={{ rotate: collapsed ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                {collapsed ? <Menu className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              </motion.div>
            </Button>
          </motion.div>
        </div>

        {/* Role Badge */}
        <AnimatePresence>
          {!collapsed && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="px-4 py-3 border-b border-sidebar-border overflow-hidden"
            >
              <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                {config.title}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-2 space-y-1">
          {config.nav.map((item, index) => {
            const isActive = location.pathname === item.path;
            return (
              <motion.div
                key={item.path}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200 relative",
                    isActive 
                      ? "bg-sidebar-accent text-foreground" 
                      : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-foreground"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute inset-0 bg-sidebar-accent rounded-md"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <item.icon className={cn("w-4 h-4 flex-shrink-0 relative z-10", isActive && "text-primary")} />
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span 
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        className="text-sm font-medium relative z-10 whitespace-nowrap"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {isActive && !collapsed && (
                    <motion.div 
                      className="ml-auto w-1.5 h-1.5 rounded-full bg-primary relative z-10"
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  )}
                </Link>
              </motion.div>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-sidebar-border">
          <motion.div whileHover={{ x: 3 }} whileTap={{ scale: 0.98 }}>
            <Button
              variant="ghost"
              onClick={handleLogout}
              className={cn(
                "w-full justify-start gap-3 text-muted-foreground hover:text-foreground",
                collapsed && "justify-center"
              )}
            >
              <LogOut className="w-4 h-4" />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span 
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    className="text-sm"
                  >
                    Logout
                  </motion.span>
                )}
              </AnimatePresence>
            </Button>
          </motion.div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <motion.main 
        animate={{ marginLeft: collapsed ? 64 : 240 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="flex-1"
      >
        {children}
      </motion.main>
    </div>
  );
};

export default DashboardLayout;
