'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import { FaStar, FaSearch, FaShoppingCart } from 'react-icons/fa'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

interface Product {
  _id: string;
  userId: string;
  shopName: string;
  itemName: string;
  price: number;
  discountedprice?: number;
  description: string;
  category: 'Bracelets' | 'Gemstone' | 'Rudraksha' | 'Crystal' | 'Kawach';
  stock: number;
  image: string[];
  rating: number;
  totalRatings: number;
  createdAt: string;
  updatedAt: string;
}

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const [isGridView, setIsGridView] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('https://astroalert-backend-m1hn.onrender.com/api/shop');
      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();
      setProducts(data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load products');
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const searchFields = [
      product.itemName,
      product.description,
      product.category,
      product.shopName
    ].map(field => field?.toLowerCase() || '');

    const searchMatches = searchTerm.trim() === '' || searchFields.some(field =>
      field.includes(searchTerm.trim().toLowerCase())
    );

    const categoryMatches = 
      selectedCategory === 'all' || 
      product.category.toLowerCase() === selectedCategory.toLowerCase();

    return searchMatches && categoryMatches;
  });

  const sortProducts = (products: Product[]) => {
    switch (sortBy) {
      case 'price-low':
        return [...products].sort((a, b) => (a.discountedprice || a.price) - (b.discountedprice || b.price));
      case 'price-high':
        return [...products].sort((a, b) => (b.discountedprice || b.price) - (a.discountedprice || a.price));
      case 'rating':
        return [...products].sort((a, b) => b.rating - a.rating);
      default:
        return products;
    }
  };

  const filteredAndSortedProducts = sortProducts(filteredProducts);

  const categories = ['all', ...Array.from(new Set(
    products.map(product => product.category)
  ))].sort();

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-orange-500"></div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center text-red-500">
      {error}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      {/* Enhanced Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-orange-200 to-amber-200 shadow-lg"
      >
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-5xl font-bold text-amber-900 text-center bg-clip-text text-transparent bg-gradient-to-r from-amber-900 to-orange-700">
            Spiritual Shop
          </h1>
          <p className="text-center mt-4 text-amber-700 text-lg font-medium">
            Discover Divine Products for Your Spiritual Journey
          </p>
        </div>
      </motion.div>

      {/* Enhanced Search and Filter Section */}
      <motion.div 
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        className="container mx-auto px-4 py-8"
      >
        <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-400" />
              <input
                type="text"
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-amber-200 bg-orange-50 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent placeholder-amber-400 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-4 w-full md:w-auto">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full md:w-48 px-4 py-3 rounded-lg border-2 border-amber-200 bg-orange-50 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent text-amber-900 transition-all"
              >
                {categories.map(category => (
                  <option key={category} value={category.toLowerCase()}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full md:w-48 px-4 py-3 rounded-lg border-2 border-amber-200 bg-orange-50 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent text-amber-900 transition-all"
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Enhanced Products Grid */}
      <AnimatePresence>
        <motion.div 
          layout
          className="container mx-auto px-4 py-8"
        >
          <div className={`grid ${isGridView 
            ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4' 
            : 'grid-cols-1'} gap-6`}
          >
            {filteredAndSortedProducts.map((product) => (
              <motion.div
                key={product._id}
                layout
                variants={fadeInUp}
                initial="initial"
                animate="animate"
                exit="exit"
                whileHover={{ y: -5 }}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-amber-100"
              >
                <div className="relative h-56 overflow-hidden">
                  <Image
                    src={product.image[0] || '/placeholder.png'}
                    alt={product.itemName}
                    fill
                    className="object-cover transition-transform duration-500 hover:scale-110"
                  />
                  {product.discountedprice && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      Save {Math.round((1 - product.discountedprice/product.price) * 100)}%
                    </div>
                  )}
                </div>
                <div className="p-6 bg-gradient-to-b from-orange-50 to-transparent">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-xl text-amber-900">{product.itemName}</h3>
                    <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-sm">
                      {product.category}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <FaStar key={i} className={`${i < Math.round(product.rating) ? 'text-yellow-400' : 'text-gray-300'}`} />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">({product.totalRatings})</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-2xl font-bold text-amber-900">
                        ₹{product.discountedprice || product.price}
                      </span>
                      {product.discountedprice && (
                        <span className="text-sm text-amber-600 line-through">
                          ₹{product.price}
                        </span>
                      )}
                    </div>
                    {product.stock > 0 ? (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => router.push(`/shop/product/${product._id}`)}
                        className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all"
                      >
                        <FaShoppingCart />
                        <span>Buy Now</span>
                      </motion.button>
                    ) : (
                      <button disabled className="bg-gray-200 text-gray-600 px-6 py-3 rounded-lg cursor-not-allowed">
                        Out of Stock
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Enhanced Categories Section */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="bg-gradient-to-b from-white to-orange-50 py-20"
      >
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12 text-amber-900">
            Explore Categories
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {['Gemstone', 'Rudraksha', 'Crystal', 'Kawach', 'Bracelets'].map((category) => (
              <motion.button
                key={category}
                whileHover={{ scale: 1.05, backgroundColor: '#FFF7ED' }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(category.toLowerCase())}
                className="p-6 text-center rounded-xl border-2 border-amber-200 hover:border-orange-400 text-amber-800 transition-all shadow-md hover:shadow-xl"
              >
                <span className="text-lg font-medium">{category}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}