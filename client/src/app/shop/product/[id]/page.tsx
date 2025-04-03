'use client'
import { useState, useEffect, use } from 'react'
import Image from 'next/image'
import { FaStar } from 'react-icons/fa'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'

interface Product {
  _id: string;
  userId: string;
  shopName: string;
  itemName: string;
  price: number;
  discountedprice?: number;
  description: string;
  category: string;
  stock: number;
  image: string[];
  rating: number;
  totalRatings: number;
}

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const router = useRouter();

  useEffect(() => {
    fetchProduct();
  }, [resolvedParams.id]);

  const fetchProduct = async () => {
    try {
      const response = await fetch(`https://astroalert-backend-m1hn.onrender.com/api/shop/${resolvedParams.id}`);
      if (!response.ok) throw new Error('Failed to fetch product');
      const data = await response.json();
      setProduct(data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load product');
      setLoading(false);
    }
  };

  const handleBuyNow = async () => {
    if (!product) return;
    
    try {
      // You can implement your buy logic here
      // For example, redirect to a payment page or show a payment modal
      toast.success('Redirecting to payment...');
      // router.push('/checkout/' + product._id);
    } catch (err) {
      toast.error('Failed to process purchase');
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-orange-500"></div>
    </div>
  );

  if (error || !product) return (
    <div className="min-h-screen flex items-center justify-center text-red-500">
      {error || 'Product not found'}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 py-8">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-lg p-6 md:p-8"
        >
          <div className="grid md:grid-cols-2 gap-8">
            {/* Image Gallery */}
            <div className="space-y-4">
              <div className="relative h-[400px] rounded-lg overflow-hidden">
                <Image
                  src={product.image[selectedImage] || '/placeholder.png'}
                  alt={product.itemName}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto">
                {product.image.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative w-20 h-20 rounded-md overflow-hidden border-2 
                      ${selectedImage === index ? 'border-orange-500' : 'border-transparent'}`}
                  >
                    <Image
                      src={img}
                      alt={`${product.itemName} view ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Product Details */}
            <div className="space-y-6">
              <button
                onClick={() => router.back()}
                className="text-amber-600 hover:text-amber-700"
              >
                ← Back to Shop
              </button>
              
              <h1 className="text-3xl font-bold text-amber-900">{product.itemName}</h1>
              
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <FaStar className="text-yellow-500" />
                  <span className="text-gray-600">
                    {product.rating.toFixed(1)} ({product.totalRatings} reviews)
                  </span>
                </div>
                <span className="text-gray-400">|</span>
                <span className="text-amber-600">{product.category}</span>
              </div>

              <div className="space-y-2">
                <div className="text-3xl font-bold text-amber-900">
                  ₹{product.discountedprice || product.price}
                </div>
                {product.discountedprice && (
                  <div className="flex items-center gap-2">
                    <span className="text-lg text-gray-500 line-through">₹{product.price}</span>
                    <span className="text-green-600">
                      {(((product.price - product.discountedprice) / product.price) * 100).toFixed(0)}% OFF
                    </span>
                  </div>
                )}
              </div>

              <div className="prose max-w-none">
                <h3 className="text-lg font-semibold text-amber-900">Description</h3>
                <p className="text-gray-600">{product.description}</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">Availability:</span>
                  <span className={product.stock > 0 ? 'text-green-600' : 'text-red-600'}>
                    {product.stock > 0 ? `In Stock (${product.stock} available)` : 'Out of Stock'}
                  </span>
                </div>

                {product.stock > 0 && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleBuyNow}
                    className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-orange-500 to-amber-500 
                      text-white rounded-lg font-semibold hover:shadow-lg transition-all"
                  >
                    Buy Now
                  </motion.button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
