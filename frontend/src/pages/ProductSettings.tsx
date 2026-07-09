import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

function ProductSettings() {
  const navigate = useNavigate();

  const [products, setProducts] = useState<
    { id: number; name: string; description: string | null; price: string; image_url: string | null }[]
  >([]);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
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

  const handleEditClick = (product: typeof products[number]) => {
    setEditingId(product.id);
    setName(product.name);
    setDescription(product.description ?? '');
    setPrice(product.price);
    setImagePreview(product.image_url);
    setImageFile(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setName('');
    setDescription('');
    setPrice('');
    setImageFile(null);
    setImagePreview(null);
  };

  const handleDelete = async (id: number) => {
    await fetch(`http://localhost:3001/products/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    setProducts(products.filter((p) => p.id !== id));
    if (editingId === id) handleCancelEdit();
    setDeleteTargetId(null);
  };

  const handleSave = async () => {
    if (!name || !price) return;

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('price', price);
    if (imageFile) formData.append('image', imageFile);

    const res = await fetch(
      editingId ? `http://localhost:3001/products/${editingId}` : 'http://localhost:3001/products',
      {
        method: editingId ? 'PATCH' : 'POST',
        credentials: 'include',
        body: formData,
      }
    );
    const savedProduct = await res.json();

    if (editingId) {
      setProducts(products.map((p) => (p.id === editingId ? savedProduct : p)));
    } else {
      setProducts([savedProduct, ...products]);
    }
    handleCancelEdit();
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
                    <div className="flex gap-2 mt-2">
                      <button onClick={() => handleEditClick(product)} className="text-xs text-blue-500 hover:underline">
                        Edit
                      </button>
                      <button onClick={() => setDeleteTargetId(product.id)} className="text-xs text-red-500 hover:underline">
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right side - Add Product */}
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6">{editingId ? 'Edit Product' : 'Add Product'}</h2>

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

              <div className="flex gap-2 mt-2">
                <button onClick={handleSave} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                  {editingId ? 'Update' : 'Save'}
                </button>
                {editingId && (
                  <button onClick={handleCancelEdit} className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300">
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {deleteTargetId !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-80">
            <p className="text-gray-700 mb-4">Are you sure you want to delete this product?</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setDeleteTargetId(null)} className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300">
                Cancel
              </button>
              <button onClick={() => handleDelete(deleteTargetId)} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductSettings;
