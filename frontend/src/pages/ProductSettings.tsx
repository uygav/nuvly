import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

function ProductSettings() {
  const navigate = useNavigate();

  const [products, setProducts] = useState<
    { id: number; name: string; price: string; image_url: string | null }[]
  >([]);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('http://localhost:3001/products/mine', { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => setProducts(data));
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!name || !price) return;

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('price', price);
    if (imageFile) formData.append('image', imageFile);

    const res = await fetch('http://localhost:3001/products', {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });
    const newProduct = await res.json();
    setProducts([newProduct, ...products]);
    setName('');
    setDescription('');
    setPrice('');
    setImageFile(null);
    setImagePreview(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between mb-8">
          <button
            onClick={() => navigate('/profile')}
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

          {/* Right side - Add Product */}
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6">Add Product</h2>

            <div className="flex flex-col gap-4">
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Image</label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="cursor-pointer w-full h-32 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs overflow-hidden"
                >
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    'No Image'
                  )}
                </div>
                <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
              </div>

              <div>
                <label className="text-sm text-gray-600 mb-1 block">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border rounded p-2 text-sm"
                />
              </div>

              <div>
                <label className="text-sm text-gray-600 mb-1 block">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full border rounded p-2 text-sm resize-none"
                />
              </div>

              <div>
                <label className="text-sm text-gray-600 mb-1 block">Price</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full border rounded p-2 text-sm"
                />
              </div>

              <button
                onClick={handleSave}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mt-2"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductSettings;
