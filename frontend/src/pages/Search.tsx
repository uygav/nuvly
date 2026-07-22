import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

type UserResult = { id: number; username: string; profile_picture: string | null };
type ProductResult = { id: number; name: string; price: string; image_url: string | null; username: string | null };

function Search() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'users' | 'products'>('users');
  const [query, setQuery] = useState('');
  const [userResults, setUserResults] = useState<UserResult[]>([]);
  const [productResults, setProductResults] = useState<ProductResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    setHasSearched(true);
    if (mode === 'users') {
      const res = await fetch(`http://localhost:3001/users/search?q=${encodeURIComponent(query)}`, {
        credentials: 'include',
      });
      setUserResults(await res.json());
    } else {
      const res = await fetch(`http://localhost:3001/products/search?q=${encodeURIComponent(query)}`, {
        credentials: 'include',
      });
      setProductResults(await res.json());
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between mb-8">
          <button
            onClick={() => navigate('/')}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
          >
            ← Back
          </button>
        </div>

        <h1 className="text-2xl font-bold mb-6">Search</h1>

        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setMode('users')}
            className={`px-4 py-2 rounded text-sm ${mode === 'users' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Users
          </button>
          <button
            onClick={() => setMode('products')}
            className={`px-4 py-2 rounded text-sm ${mode === 'products' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Products
          </button>
        </div>

        <div className="flex gap-2 mb-6">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder={mode === 'users' ? 'Search by username...' : 'Search by product name...'}
            className="flex-1 border rounded p-2"
          />
          <button
            onClick={handleSearch}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Search
          </button>
        </div>

        {mode === 'users' ? (
          userResults.length === 0 && hasSearched ? (
            <p className="text-gray-400 text-center mt-8">No users found</p>
          ) : (
            <div className="flex flex-col gap-2">
              {userResults.map((u) => (
                <div
                  key={u.id}
                  onClick={() => navigate(`/profile/${u.id}`)}
                  className="flex items-center gap-3 bg-white p-4 rounded-lg shadow-md cursor-pointer hover:bg-gray-50"
                >
                  {u.profile_picture ? (
                    <img src={u.profile_picture} alt={u.username} className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-500 text-xs">
                      No Image
                    </div>
                  )}
                  <p>@{u.username}</p>
                </div>
              ))}
            </div>
          )
        ) : productResults.length === 0 && hasSearched ? (
          <p className="text-gray-400 text-center mt-8">No products found</p>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {productResults.map((p) => (
              <div
                key={p.id}
                onClick={() => navigate(`/products/${p.id}`)}
                className="bg-white p-4 rounded-lg shadow-md cursor-pointer hover:bg-gray-50"
              >
                <div className="w-full h-32 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs mb-2 overflow-hidden">
                  {p.image_url ? (
                    <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    'No Image'
                  )}
                </div>
                <p className="font-semibold truncate">{p.name}</p>
                <p className="text-blue-500 text-sm">${p.price}</p>
                <p className="text-gray-400 text-xs">@{p.username}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Search;
