import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

type FeedProduct = {
  id: number;
  name: string;
  price: string;
  image_url: string | null;
  user_id: number;
  username: string | null;
  profile_picture: string | null;
  likes_count: string;
  comments_count: string;
  is_liked: boolean;
};

function Home() {
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [feed, setFeed] = useState<FeedProduct[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:3001/auth/me', {
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((data) => setUser(data));
  }, []);

  useEffect(() => {
    fetch('http://localhost:3001/products/feed', { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => setFeed(data));
  }, []);

  useEffect(() => {
    fetch('http://localhost:3001/notifications/unread-count', { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => setUnreadCount(data.count));
  }, []);

  const handleLikeToggle = async (product: FeedProduct) => {
    const method = product.is_liked ? 'DELETE' : 'POST';
    await fetch(`http://localhost:3001/products/${product.id}/like`, { method, credentials: 'include' });
    setFeed((prev) =>
      prev.map((p) =>
        p.id === product.id
          ? { ...p, is_liked: !p.is_liked, likes_count: String(Number(p.likes_count) + (p.is_liked ? -1 : 1)) }
          : p
      )
    );
  };

  const handleLogout = async () => {
    await fetch('http://localhost:3001/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Bar */}
      <div className="flex justify-end gap-4 p-8">
        <button
          onClick={() => navigate('/notifications')}
          className="relative bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
        >
          🔔
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>
        <button
          onClick={() => navigate('/search')}
          className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
        >
          Search
        </button>
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

      {/* Feed */}
      <div className="max-w-5xl w-full mx-auto px-8 pb-8">
        {feed.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-96 text-gray-400 gap-1">
            <p>Your feed is empty</p>
            <p className="text-sm">Follow people to see their products here</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-6">
            {feed.map((product) => (
              <div key={product.id} className="bg-white border rounded-lg p-4 shadow-sm">
                <div
                  onClick={() => navigate(`/profile/${product.user_id}`)}
                  className="flex items-center gap-2 mb-3 cursor-pointer"
                >
                  {product.profile_picture ? (
                    <img src={product.profile_picture} className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 bg-gray-300 rounded-full" />
                  )}
                  <span className="text-sm font-semibold hover:underline">@{product.username}</span>
                </div>
                <div
                  onClick={() => navigate(`/products/${product.id}`)}
                  className="w-full h-40 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs mb-2 overflow-hidden cursor-pointer"
                >
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    'No Image'
                  )}
                </div>
                <p
                  onClick={() => navigate(`/products/${product.id}`)}
                  className="font-semibold truncate cursor-pointer hover:underline"
                >
                  {product.name}
                </p>
                <p className="text-blue-500 text-sm">${product.price}</p>
                <div className="flex items-center gap-3 mt-2">
                  <button
                    onClick={() => handleLikeToggle(product)}
                    className={`flex items-center gap-1 text-sm ${product.is_liked ? 'text-red-500' : 'text-gray-400'}`}
                  >
                    {product.is_liked ? '♥' : '♡'} {product.likes_count}
                  </button>
                  <span className="text-gray-400 text-sm">💬 {product.comments_count}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;