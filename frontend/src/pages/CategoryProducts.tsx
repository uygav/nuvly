import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

type ProductResult = {
  id: number;
  name: string;
  price: string;
  image_url: string | null;
  username: string | null;
};

function CategoryProducts() {
  const { name } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState<ProductResult[]>([]);

  useEffect(() => {
    fetch(`http://localhost:3001/products/search?q=&category=${encodeURIComponent(name || '')}`, {
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((data) => setProducts(data));
  }, [name]);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <button onClick={() => navigate('/')} className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 mb-6">
          ← Back
        </button>

        <h1 className="text-2xl font-bold mb-6">{name}</h1>

        {products.length === 0 ? (
          <p className="text-gray-400 text-center mt-8">No products in this category</p>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {products.map((p) => (
              <div key={p.id} onClick={() => navigate(`/products/${p.id}`)} className="bg-white p-4 rounded-lg shadow-md cursor-pointer hover:bg-gray-50">
                <div className="w-full h-32 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs mb-2 overflow-hidden">
                  {p.image_url ? <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" /> : 'No Image'}
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

export default CategoryProducts;
