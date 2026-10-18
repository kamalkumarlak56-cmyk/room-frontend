// client/src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import SearchRooms from './pages/SearchRooms';
import WishlistPage from './pages/WishlistPage';
import Login from './pages/Login';
import Register from './pages/Register';
import OwnerDashboard from './pages/OwnerDashboard';
import OwnerPostRoom from './pages/OwnerPostRoom';
import AdminDashboard from './pages/AdminDashboard';
import ProfilePage from './pages/ProfilePage';
import ChatPage from './pages/ChatPage';
import RoomDetailsPage from './pages/RoomDetailsPage';

function AppContent() {
  const location = useLocation();
  const isAuthPage =
    location.pathname.startsWith('/login') ||
    location.pathname.startsWith('/register');

  // Hide footer on user profile, owner profile/panels, admin dashboard, and auth pages (login/register)
  const hideFooter =
    isAuthPage ||
    location.pathname.startsWith('/owner') ||
    location.pathname.startsWith('/admin') ||
    location.pathname.startsWith('/profile');

  const hideNavbar = isAuthPage;

  return (
    <div className="min-h-screen bg-[var(--color-bg-app)] text-[var(--color-text-body)] flex flex-col font-sans antialiased selection:bg-[#f5efe6] selection:text-[#0a0b0d] transition-colors duration-200">
      {!hideNavbar && <Navbar />}
      <main className="flex-grow">
        <Routes>
          {/* Public & Search Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/rooms-detail/:id" element={<RoomDetailsPage />} />
          <Route path="/room-details/:id" element={<RoomDetailsPage />} />
          <Route path="/room/:id" element={<RoomDetailsPage />} />
          <Route path="/searchrooms" element={<SearchRooms />} />
          <Route path="/search" element={<SearchRooms />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Authenticated Routes for All Roles (User, Owner, Admin) */}
          <Route
            element={
              <ProtectedRoute allowedRoles={['user', 'owner', 'admin']} />
            }
          >
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/wishlist" element={<WishlistPage />} />
          </Route>

          {/* Protected Owner Routes (Accessible by Owner and Admin) */}
          <Route element={<ProtectedRoute allowedRoles={['owner', 'admin']} />}>
            <Route path="/owner" element={<Navigate to="/owner/dashboard" replace />} />
            <Route path="/owner/dashboard" element={<OwnerDashboard defaultTab="dashboard" />} />
            <Route path="/owner/rooms" element={<OwnerDashboard defaultTab="rooms" />} />
            <Route path="/owner/payments" element={<OwnerDashboard defaultTab="payments" />} />
            <Route path="/owner/chats" element={<OwnerDashboard defaultTab="chats" />} />
            <Route path="/owner/reviews" element={<OwnerDashboard defaultTab="reviews" />} />
            <Route path="/owner/profile" element={<OwnerDashboard defaultTab="profile" />} />
            <Route path="/owner/post-room" element={<OwnerPostRoom />} />
            <Route path="/owner/edit-room/:id" element={<OwnerPostRoom isEditing={true} />} />
          </Route>

          {/* Protected Admin Route (Accessible exclusively by Admin) */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/admin/dashboard" element={<AdminDashboard defaultTab="rooms" />} />
            <Route path="/admin/rooms" element={<AdminDashboard defaultTab="rooms" />} />
            <Route path="/admin/users" element={<AdminDashboard defaultTab="users" />} />
            <Route path="/admin/stats" element={<AdminDashboard defaultTab="stats" />} />
            <Route path="/admin/settings" element={<AdminDashboard defaultTab="settings" />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {!hideFooter && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}