import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import TeacherDashboard from "./pages/dashboard/TeacherDashboard";
import TeacherSessions from "./pages/dashboard/TeacherSessions";
import TeacherAnalytics from "./pages/dashboard/TeacherAnalytics";
import CRPDashboard from "./pages/dashboard/CRPDashboard";
import CRPSessions from "./pages/dashboard/CRPSessions";
import CRPAnalytics from "./pages/dashboard/CRPAnalytics";
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import AdminUsers from "./pages/dashboard/AdminUsers";
import AdminReports from "./pages/dashboard/AdminReports";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          {/* Teacher Routes */}
          <Route path="/dashboard/teacher" element={<TeacherDashboard />} />
          <Route path="/dashboard/teacher/sessions" element={<TeacherSessions />} />
          <Route path="/dashboard/teacher/analytics" element={<TeacherAnalytics />} />
          {/* CRP Routes */}
          <Route path="/dashboard/crp" element={<CRPDashboard />} />
          <Route path="/dashboard/crp/teachers" element={<CRPSessions />} />
          <Route path="/dashboard/crp/analytics" element={<CRPAnalytics />} />
          {/* Admin Routes */}
          <Route path="/dashboard/admin" element={<AdminDashboard />} />
          <Route path="/dashboard/admin/users" element={<AdminUsers />} />
          <Route path="/dashboard/admin/reports" element={<AdminReports />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
