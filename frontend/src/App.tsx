import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';

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
      </Routes>
    </BrowserRouter>
  );
}

export default App;
