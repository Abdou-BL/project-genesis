import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import PageTransition from "@/components/PageTransition";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Translation from "./pages/Translation";
import Courses from "./pages/Courses";
import Terminology from "./pages/Terminology";
import Meetings from "./pages/Meetings";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Index /></PageTransition>} />
        <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
        <Route path="/register" element={<PageTransition><Register /></PageTransition>} />
        <Route path="/translation" element={<PageTransition><Translation /></PageTransition>} />
        <Route path="/courses" element={<PageTransition><ProtectedRoute><Courses /></ProtectedRoute></PageTransition>} />
        <Route path="/terminology" element={<PageTransition><ProtectedRoute><Terminology /></ProtectedRoute></PageTransition>} />
        <Route path="/meetings" element={<PageTransition><ProtectedRoute><Meetings /></ProtectedRoute></PageTransition>} />
        <Route path="/dashboard" element={<PageTransition><ProtectedRoute><Dashboard /></ProtectedRoute></PageTransition>} />
        <Route path="/profile" element={<PageTransition><ProtectedRoute><Profile /></ProtectedRoute></PageTransition>} />
        <Route path="/admin" element={<PageTransition><ProtectedRoute><Admin /></ProtectedRoute></PageTransition>} />
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <LanguageProvider>
          <AuthProvider>
            <AnimatedRoutes />
          </AuthProvider>
        </LanguageProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
