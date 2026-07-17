import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

type Product = {
  id: number;
  name: string;
  description: string | null;
  price: string;
  image_url: string | null;
  user_id: number;
  username: string | null;
  profile_picture: string | null;
  likes_count: string;
  is_liked: boolean;
};

type Comment = {
  id: number;
  content: string;
  created_at: string;
  user_id: number;
  username: string | null;
  profile_picture: string | null;
  likes_count: string;
  is_liked: boolean;
};

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  useEffect(() => {
    fetch(`http://localhost:3001/products/${id}`, { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => setProduct(data));
  }, [id]);

  useEffect(() => {
    fetch(`http://localhost:3001/products/${id}/comments`, { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => setComments(data));
  }, [id]);

  useEffect(() => {
    fetch('http://localhost:3001/auth/me', { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => setCurrentUserId(data.id));
  }, []);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    await fetch(`http://localhost:3001/products/${id}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ content: newComment }),
    });
    setNewComment('');
    const res = await fetch(`http://localhost:3001/products/${id}/comments`, { credentials: 'include' });
    const data = await res.json();
    setComments(data);
  };

  const handleCommentLikeToggle = async (comment: Comment) => {
    const method = comment.is_liked ? 'DELETE' : 'POST';
    await fetch(`http://localhost:3001/products/${id}/comments/${comment.id}/like`, { method, credentials: 'include' });
    setComments((prev) =>
      prev.map((c) =>
        c.id === comment.id
          ? { ...c, is_liked: !c.is_liked, likes_count: String(Number(c.likes_count) + (c.is_liked ? -1 : 1)) }
          : c
      )
    );
  };

  const handleDeleteComment = async (commentId: number) => {
    await fetch(`http://localhost:3001/products/${id}/comments/${commentId}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    setComments((prev) => prev.filter((c) => c.id !== commentId));
  };

  const handleLikeToggle = async () => {
    if (!product) return;
    const method = product.is_liked ? 'DELETE' : 'POST';
    await fetch(`http://localhost:3001/products/${product.id}/like`, { method, credentials: 'include' });
    setProduct({
      ...product,
      is_liked: !product.is_liked,
      likes_count: String(Number(product.likes_count) + (product.is_liked ? -1 : 1)),
    });
  };

  if (!product) {
    return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 mb-6"
        >
          ← Back
        </button>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="w-full h-96 bg-gray-200 flex items-center justify-center text-gray-400 overflow-hidden">
            {product.image_url ? (
              <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              'No Image'
            )}
          </div>

          <div className="p-8">
            <div
              onClick={() => navigate(`/profile/${product.user_id}`)}
              className="flex items-center gap-2 mb-4 cursor-pointer w-fit"
            >
              {product.profile_picture ? (
                <img src={product.profile_picture} className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <div className="w-8 h-8 bg-gray-300 rounded-full" />
              )}
              <span className="text-sm font-semibold hover:underline">@{product.username}</span>
            </div>

            <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
            <p className="text-blue-500 text-xl font-semibold mb-4">${product.price}</p>

            {product.description ? (
              <p className="text-gray-600 mb-6 break-words">{product.description}</p>
            ) : (
              <p className="text-gray-400 mb-6">No description</p>
            )}

            <button
              onClick={handleLikeToggle}
              className={`flex items-center gap-1 text-lg ${product.is_liked ? 'text-red-500' : 'text-gray-400'}`}
            >
              {product.is_liked ? '♥' : '♡'} {product.likes_count}
            </button>

            <div className="mt-8 border-t pt-6">
              <h2 className="font-semibold mb-4">Comments</h2>

              <div className="flex gap-2 mb-6">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                  placeholder="Write a comment..."
                  className="flex-1 border rounded p-2 text-sm"
                />
                <button
                  onClick={handleAddComment}
                  className="bg-blue-500 text-white px-4 py-2 rounded text-sm hover:bg-blue-600"
                >
                  Post
                </button>
              </div>

              {comments.length === 0 ? (
                <p className="text-gray-400 text-sm">No comments yet</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {comments.map((c) => (
                    <div key={c.id} className="flex items-start gap-2">
                      {c.profile_picture ? (
                        <img src={c.profile_picture} className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        <div className="w-8 h-8 bg-gray-300 rounded-full" />
                      )}
                      <div className="flex-1">
                        <p className="text-sm">
                          <span className="font-semibold">@{c.username}</span> {c.content}
                        </p>
                        <button
                          onClick={() => handleCommentLikeToggle(c)}
                          className={`text-xs flex items-center gap-1 mt-1 ${c.is_liked ? 'text-red-500' : 'text-gray-400'}`}
                        >
                          {c.is_liked ? '♥' : '♡'} {c.likes_count}
                        </button>
                      </div>
                      {c.user_id === currentUserId && (
                        <button
                          onClick={() => handleDeleteComment(c.id)}
                          className="text-gray-400 hover:text-red-500 text-xs"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;
