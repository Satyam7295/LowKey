import { Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Search from "./pages/Search";
import Notifications from "./pages/Notifications";
import Spillback from "./pages/Spillback";
import UserProfile from "./pages/UserProfile";
import ProfileForm from "./pages/ProfileForm";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/home" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/spillback" element={<Spillback />} />
          <Route path="/user/:username" element={<UserProfile />} />
          <Route path="/dashboard" element={<Navigate to="/home" replace />} />
          <Route path="/profile/create" element={<ProfileForm />} />
          <Route path="/profile/edit" element={<ProfileForm />} />
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
