import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Home, Lightbulb, PlusCircle, User, LogOut } from "lucide-react";
import Register from "./pages/Register";
import Login from "./pages/Login";
import HomeFeed from "./pages/Home";
import CreateIdea from "./pages/CreateIdea";
import IdeaDetail from "./pages/IdeaDetail";
import Profile from "./pages/Profile";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading">Loading...</div>;
  return user ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppLayout />
      </AuthProvider>
    </BrowserRouter>
  );
}

function AppLayout() {
  const { user, loading } = useAuth();

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="app">
      {user && <Sidebar />}
      <main className="main-content">
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><HomeFeed /></ProtectedRoute>} />
          <Route path="/ideas/new" element={<ProtectedRoute><CreateIdea /></ProtectedRoute>} />
          <Route path="/ideas/:id" element={<ProtectedRoute><IdeaDetail /></ProtectedRoute>} />
          <Route path="/profile/:id" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        </Routes>
      </main>
    </div>
  );
}

function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <Link to="/">IdeaVault</Link>
      </div>
      <nav className="sidebar-nav">
        <Link to="/" className={location.pathname === "/" ? "active" : ""}>
          <Home size={24} />
          <span>Home</span>
        </Link>
        <Link to="/ideas/new" className={location.pathname === "/ideas/new" ? "active" : ""}>
          <PlusCircle size={24} />
          <span>New Idea</span>
        </Link>
        <Link to={`/profile/${user?.id}`} className={location.pathname.startsWith("/profile") ? "active" : ""}>
          <User size={24} />
          <span>Profile</span>
        </Link>
        <button onClick={logout}>
          <LogOut size={24} />
          <span>Logout</span>
        </button>
      </nav>
      <div className="sidebar-user" onClick={() => window.location.href = `/profile/${user?.id}`}>
        <div className="sidebar-user-avatar">
          {user?.name?.[0]?.toUpperCase()}
        </div>
        <div className="sidebar-user-info">
          <div className="sidebar-user-name">{user?.name}</div>
          <div className="sidebar-user-email">{user?.email}</div>
        </div>
      </div>
    </aside>
  );
}

export default App;
