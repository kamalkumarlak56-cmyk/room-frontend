// client/src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
import AdminDashboard from './pages/AdminDashboard';
import ProfilePage from './pages/ProfilePage';
import ChatPage from './pages/ChatPage';
import RoomDetailsPage from './pages/RoomDetailsPage';

export default function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <div className="min-h-screen bg-[var(--color-bg-app)] text-[var(--color-text-body)] flex flex-col font-sans antialiased selection:bg-[#f5efe6] selection:text-[#0a0b0d] transition-colors duration-200">
            <Navbar />
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
                  <Route path="/owner/dashboard" element={<OwnerDashboard />} />
                </Route>

                {/* Protected Admin Route (Accessible exclusively by Admin) */}
                <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                  <Route path="/admin/dashboard" element={<AdminDashboard />} />
                </Route>

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}