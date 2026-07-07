import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Profile() {
  const [user, setUser] = useState<{ 
    email: string
    bio:string | null
    profile_picture:string | null } | null>(null);
  
  const [products, setProducts] = useState<
    { 
      id: number; 
      name: string; 
      price: string; 
      image_url: string | null }[]
  >([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:3001/auth/me', {
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((data) => setUser(data))
      .catch(() => {
        window.location.href = '/login';
      });
  }, []);

  useEffect(()=> {
    fetch('http://localhost:3001/products/mine', {
      credentials: 'include'})
      .then((res)=> res.json())
      .then((data)=> setUser(data))
      .catch(()=>{ window.location.href='/login'})
  })

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Top Bar */}
        <div className="flex justify-between mb-8">
          
          {/* BACK BUTTON */}
          <button
            onClick={() => navigate('/')}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
          >
            ← Back
          </button>
          {/* LOGOUT BUTTON  */}
          <button
            onClick={async () => {
              await fetch('http://localhost:3001/auth/logout', {
                method: 'POST',
                credentials: 'include',
              });
              window.location.href = '/login';
            }}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>

        {/* Both layout */}
        <div className="grid grid-cols-2 gap-8">
          {/* Left side - Products */}
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6">Products</h2>

            {/* Product List */}
             {products.length === 0 ? (
              <div className="flex items-center justify-center h-96 text-gray-400">
                <p>No products yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
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

          {/* Right Side - Profile */}
          <div className="bg-white p-8 rounded-lg shadow-md h-fit">
            {/* Profile Picture */}
            <div className="flex justify-center mb-4">
               {user?.profile_picture ? (
                <img src={user.profile_picture} alt="Profile" className="w-32 h-32 rounded-full object-cover" />
              ) : (
                <div className="w-32 h-32 bg-gray-300 rounded-full flex items-center justify-center text-gray-500 text-sm">
                  No Image
                </div>
              )}
            </div>

            {/* Email */}
            {user && (
              <p className="text-center text-gray-600 text-sm mb-6 break-words">
                {user.email}
              </p>
            )}

            {/* Description */}
            <div className="text-center text-sm mb-6">
              {user?.bio ? (
                <p className="text-gray-600 break-words">{user.bio}</p>
              ) : (
                <p className="text-gray-400">No description yet</p>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-gray-600 text-xs mb-1">Followers</p>
                <p className="text-2xl font-bold text-blue-500">0</p>
              </div>

              <div>
                <p className="text-gray-600 text-xs mb-1">Following</p>
                <p className="text-2xl font-bold text-blue-500">0</p>
              </div>

              <div>
                <p className="text-gray-600 text-xs mb-1">Products</p>
                <p className="text-2xl font-bold text-blue-500">{products.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;