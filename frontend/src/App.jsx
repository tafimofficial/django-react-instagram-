import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Home from './pages/Home';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="h-screen w-screen flex items-center justify-center bg-black text-white">Loading...</div>;
  return user ? children : <Navigate to="/login" />;
};

import Layout from './components/layout/Layout';

// ... imports

import Friends from './pages/Friends';
import Messages from './pages/Messages';
import Signup from './pages/Signup';
import CreatePost from './pages/CreatePost';
import CreateStory from './pages/CreateStory';
import StoryViewerPage from './pages/StoryViewerPage';
import Profile from './pages/Profile';
import Search from './pages/Search';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route element={
        <PrivateRoute>
          <Layout />
        </PrivateRoute>
      }>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<Search />} />
        <Route path="/create" element={<CreatePost />} />
        <Route path="/create-story" element={<CreateStory />} />
        <Route path="/stories/:username" element={<StoryViewerPage />} />
        <Route path="/friends" element={<Friends />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/profile/:username" element={<Profile />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
