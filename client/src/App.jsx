import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Home from "./pages/Home";
import CreateIdea from "./pages/CreateIdea";
import IdeaDetail from "./pages/IdeaDetail";
import Profile from "./pages/Profile";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <p>Loading...</p>;
  return user ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="app">
          <header>
            <h1><a href="/">Idea Vault</a></h1>
            <Nav />
          </header>
          <main>
            <Routes>
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Home />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/ideas/new"
                element={
                  <ProtectedRoute>
                    <CreateIdea />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/ideas/:id"
                element={
                  <ProtectedRoute>
                    <IdeaDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile/:id"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

function Nav() {
  const { user, logout } = useAuth();
  if (!user) return null;
  return (
    <nav>
      <a href={`/profile/${user.id}`} className="nav-link">{user.name}</a>
      <button onClick={logout}>Logout</button>
    </nav>
  );
}

export default App;
