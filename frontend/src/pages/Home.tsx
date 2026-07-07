import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Home() {
  const [user, setUser] = useState<{ email: string } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:3001/auth/me', {
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((data) => setUser(data));
  }, []);

  const handleLogout = async () => {
    await fetch('http://localhost:3001/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Bar */}
      <div className="flex justify-end gap-4 p-8">
        <button
          onClick={() => navigate('/profile')}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Profile
        </button>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Logout
        </button>
      </div>

      {/* Welcome content */}
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <h1 className="text-3xl font-bold">Welcome!</h1>
        {user && <p className="text-gray-600">Logged in as: {user.email}</p>}
      </div>
    </div>
  );
}

export default Home;