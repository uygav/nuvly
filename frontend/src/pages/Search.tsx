import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Search() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<
    { id: number; username: string; profile_picture: string | null }[]
  >([]);

  const handleSearch = async () => {
    const res = await fetch(`http://localhost:3001/users/search?q=${encodeURIComponent(query)}`, {
      credentials: 'include',
    });
    const data = await res.json();
    setResults(data);
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

        <h1 className="text-2xl font-bold mb-6">Search Users</h1>

        <div className="flex gap-2 mb-6">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search by username..."
            className="flex-1 border rounded p-2"
          />
          <button
            onClick={handleSearch}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Search
          </button>
        </div>

        <div className="flex flex-col gap-2">
          {results.map((u) => (
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
      </div>
    </div>
  );
}

export default Search;
