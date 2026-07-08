import { useEffect, useState, useRef } from 'react';
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
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioDraft, setBioDraft] = useState('');

  const handleSaveBio = async () => {
    const res = await fetch('http://localhost:3001/auth/bio', {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bio: bioDraft }),
    });
    const data = await res.json();
    setUser(data);
    setIsEditingBio(false);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    const res = await fetch('http://localhost:3001/auth/profile-picture', {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });
    const data = await res.json();
    setUser(data);
  };

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
      .then((data)=> setProducts(data))
      .catch(()=>{ window.location.href='/login'})
  }, [])

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
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Products</h2>
              <button
                onClick={() => navigate('/products/settings')}
                className="text-sm bg-gray-200 text-gray-700 px-3 py-1.5 rounded hover:bg-gray-300"
              >
                Product Settings
              </button>
            </div>

            {/* Product List */}
             {products.length === 0 ? (
              <div className="flex items-center justify-center h-96 text-gray-400">
                <p>No products yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-4 h-72 content-start overflow-y-auto pr-2">
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
          <div className="bg-white p-8 rounded-lg shadow-md">
            {/* Profile Picture */}
            <div className="flex justify-center mb-4">
              <div onClick={() => fileInputRef.current?.click()} className="cursor-pointer" title="Change profile picture">
                {user?.profile_picture ? (
                  <img src={user.profile_picture} alt="Profile" className="w-32 h-32 rounded-full object-cover" />
                ) : (
                  <div className="w-32 h-32 bg-gray-300 rounded-full flex items-center justify-center text-gray-500 text-sm">
                    No Image
                  </div>
                )}
              </div>
              <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
            </div>

            {/* Email */}
            {user && (
              <p className="text-center text-gray-600 text-sm mb-6 break-words">
                {user.email}
              </p>
            )}

            {/* Description */}
            <div className="text-center text-sm mb-6">
              {isEditingBio ? (
                <div>
                  <textarea
                    value={bioDraft}
                    onChange={(e) => setBioDraft(e.target.value)}
                    maxLength={200}
                    rows={3}
                    className="w-full border rounded p-2 text-gray-700 resize-none text-sm"
                    placeholder=""
                  />
                  <div className="flex justify-center gap-2 mt-2">
                    <button onClick={handleSaveBio} className="bg-blue-500 text-white px-3 py-1 rounded text-xs">
                      Save
                    </button>
                    <button onClick={() => setIsEditingBio(false)} className="bg-gray-200 text-gray-700 px-3 py-1 rounded text-xs">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => { setBioDraft(user?.bio ?? ''); setIsEditingBio(true); }}
                  className="cursor-pointer"
                >
                  {user?.bio ? (
                    <p className="text-gray-600 break-words">{user.bio}</p>
                  ) : (
                    <p className="text-gray-400">No description yet</p>
                  )}
                </div>
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