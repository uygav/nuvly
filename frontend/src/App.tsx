import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Profile from './pages/Profile';
import ProductSettings from './pages/ProductSettings';
import Search from './pages/Search';
import UserProfile from './pages/UserProfile';
import ProductDetail from './pages/ProductDetail';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    fetch('http://localhost:3001/auth/me', {
      credentials: 'include',
    })
      .then((res) => setIsLoggedIn(res.ok))
      .catch(() => setIsLoggedIn(false));
  }, []);

  if (isLoggedIn === null) return <div>Loading...</div>;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={isLoggedIn ? <Home /> : <Navigate to="/login" />} />
        <Route path="/login" element={isLoggedIn ? <Navigate to="/" /> : <Login />} />
        <Route path="/register" element={isLoggedIn ? <Navigate to="/" /> : <Register />} />
        <Route path="/profile" element={isLoggedIn ? <Profile /> : <Navigate to="/login" />} />
        <Route path="/products/settings" element={isLoggedIn ? <ProductSettings /> : <Navigate to="/login" />} />
        <Route path="/search" element={isLoggedIn ? <Search /> : <Navigate to="/login" />} />
        <Route path="/profile/:id" element={isLoggedIn ? <UserProfile /> : <Navigate to="/login" />} />
        <Route path="/products/:id" element={isLoggedIn ? <ProductDetail /> : <Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
