import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import FollowListModal from '../components/FollowListModal';

function UserProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [followModal, setFollowModal] = useState<'followers' | 'following' | null>(null);

  const [user, setUser] = useState<{
    email: string;
    username: string | null;
    bio: string | null;
    profile_picture: string | null;
    followers_count: string;
    following_count: string;
    is_following: boolean;
  } | null>(null);

  const [products, setProducts] = useState<
    { id: number; name: string; price: string; image_url: string | null }[]
  >([]);

  useEffect(() => {
    fetch(`http://localhost:3001/users/${id}`, { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => setUser(data));
  }, [id]);

  useEffect(() => {
    fetch(`http://localhost:3001/products/user/${id}`, { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => setProducts(data));
  }, [id]);

  const handleFollowToggle = async () => {
    if (!user) return;
    const method = user.is_following ? 'DELETE' : 'POST';
    await fetch(`http://localhost:3001/users/${id}/follow`, { method, credentials: 'include' });
    setUser({
      ...user,
      is_following: !user.is_following,
      followers_count: String(Number(user.followers_count) + (user.is_following ? -1 : 1)),
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between mb-8">
          <button
            onClick={() => navigate('/search')}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
          >
            ← Back
          </button>
        </div>

        <div className="grid grid-cols-2 gap-8">
          {/* Left side - Products */}
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6">Products</h2>

            {products.length === 0 ? (
              <div className="flex items-center justify-center h-96 text-gray-400">
                <p>No products yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-4 h-[560px] content-start overflow-y-auto pr-2">
                {products.map((product) => (
                  <div key={product.id} className="border rounded-lg p-4">
                    <div className="w-full h-32 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs mb-2 overflow-hidden">
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        'No Image'
                      )}
                    </div>
                    <p className="font-semibold truncate">{product.name}</p>
                    <p className="text-blue-500 text-sm">${product.price}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Side - Profile (read-only) */}
          <div className="bg-white p-8 rounded-lg shadow-md">
            <div className="flex justify-center mb-4">
              {user?.profile_picture ? (
                <img src={user.profile_picture} alt="Profile" className="w-32 h-32 rounded-full object-cover" />
              ) : (
                <div className="w-32 h-32 bg-gray-300 rounded-full flex items-center justify-center text-gray-500 text-sm">
                  No Image
                </div>
              )}
            </div>

            {user?.username && (
              <p className="text-center font-semibold">@{user.username}</p>
            )}

            {user && (
              <p className="text-center text-gray-600 text-sm mb-6 break-words">
                {user.email}
              </p>
            )}

            {user && (
              <div className="flex justify-center mb-6">
                <button
                  onClick={handleFollowToggle}
                  className={
                    user.is_following
                      ? 'bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300'
                      : 'bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600'
                  }
                >
                  {user.is_following ? 'Unfollow' : 'Follow'}
                </button>
              </div>
            )}

            <div className="text-center text-sm mb-6">
              {user?.bio ? (
                <p className="text-gray-600 break-words">{user.bio}</p>
              ) : (
                <p className="text-gray-400">No description yet</p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-gray-600 text-xs mb-1">Followers</p>
                <p
                  onClick={() => setFollowModal('followers')}
                  className="text-2xl font-bold text-blue-500 cursor-pointer hover:underline"
                >
                  {user?.followers_count ?? 0}
                </p>
              </div>
              <div>
                <p className="text-gray-600 text-xs mb-1">Following</p>
                <p
                  onClick={() => setFollowModal('following')}
                  className="text-2xl font-bold text-blue-500 cursor-pointer hover:underline"
                >
                  {user?.following_count ?? 0}
                </p>
              </div>
              <div>
                <p className="text-gray-600 text-xs mb-1">Products</p>
                <p className="text-2xl font-bold text-blue-500">{products.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {followModal && id && (
        <FollowListModal userId={id} type={followModal} onClose={() => setFollowModal(null)} />
      )}
    </div>
  );
}

export default UserProfile;
