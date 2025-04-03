'use client'
import Link from "next/link"
import { motion } from "framer-motion"
import Image from "next/image"

const topBlogs = [
  {
    title: "Power of Navgraha: Understanding Planetary Influences",
    excerpt: "Discover how the nine planets shape your destiny and daily life...",
    category: "Vedic Astrology",
    readTime: "5 min",
    image: "/blog/navgraha.jpg",
    slug: "power-of-navgraha"
  },
  {
    title: "Mercury Retrograde: Navigate Through Cosmic Chaos",
    excerpt: "Learn how to handle communication and travel during this period...",
    category: "Planetary Transit",
    readTime: "4 min",
    image: "/blog/mercury-retrograde.jpg",
    slug: "mercury-retrograde-guide"
  },
  {
    title: "Understanding Your Birth Chart's Hidden Secrets",
    excerpt: "Unlock the mysteries encoded in your celestial birth map...",
    category: "Birth Charts",
    readTime: "6 min",
    image: "/blog/birth-chart.jpg",
    slug: "birth-chart-secrets"
  }
];

export function BlogSection() {
  return (
    <section className="py-16 bg-gradient-to-b from-sacred-sandal via-white to-sacred-saffron/10 relative overflow-hidden">
      {/* Sacred Mandala Background */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[url('/mandala-pattern.png')] bg-repeat opacity-20" />
      </div>

      {/* Enhanced Decorative Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-sacred-gold rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-64 h-64 bg-sacred-vermilion rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/3 w-64 h-64 bg-sacred-copper rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Enhanced Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          {/* Enhanced Sanskrit Title with Decorative Circle */}
          <div className="relative inline-block mb-6">
            {/* Outer rotating circle */}
            {/* Inner static circle */}
            <div className="relative bg-white/80 backdrop-blur-sm rounded-full px-8 py-2 border-2 border-sacred-gold/20
                          shadow-[0_0_15px_rgba(212,175,55,0.3)] hover:shadow-[0_0_20px_rgba(212,175,55,0.5)]
                          transition-all duration-500">
              <motion.span 
                className="inline-block text-lg md:text-xl bg-gradient-to-r from-sacred-copper via-sacred-gold to-sacred-vermilion
                           bg-clip-text text-transparent font-semibold tracking-wide"
                whileHover={{ scale: 1.05 }}
              >
                <span className="animate-glow inline-block">🕉️</span>
                <span className="mx-2">ज्ञान प्रकाश</span>
                <span className="animate-glow inline-block">🕉️</span>
              </motion.span>
              
              {/* Decorative dots */}
              <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-sacred-gold/60" />
              <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-sacred-gold/60" />
            </div>
          </div>

          <h2 className="text-5xl font-bold mb-6 relative inline-block">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-sacred-vermilion via-sacred-gold to-sacred-copper animate-sacred-shimmer bg-[length:200%_auto]">
              Sacred Wisdom & Insights
            </span>
            <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-sacred-vermilion via-sacred-gold to-sacred-copper rounded-full"></div>
          </h2>
          <p className="text-sacred-copper/80 text-lg max-w-2xl mx-auto font-medium">
            Ancient vedic knowledge for modern spiritual seekers
          </p>
        </motion.div>

        {/* Enhanced Blog Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {topBlogs.map((blog, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group"
            >
              <Link href={`/blog/${blog.slug}`}>
                <div className="relative bg-gradient-to-b from-sacred-sandal/50 to-white backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-sacred-gold/20">
                  {/* Decorative Corner Ornaments */}
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-sacred-gold/30 rounded-tl-2xl" />
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-sacred-gold/30 rounded-tr-2xl" />
                  
                  <div className="relative h-48 overflow-hidden bg-gradient-to-b from-sacred-gold/10 to-sacred-copper/10">
                    {/* Add loading blur placeholder */}
                    <div className="absolute inset-0 bg-sacred-gold/5 animate-pulse" />
                    <Image
                      src={blog.image}
                      alt={blog.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      priority={index === 0}
                      loading={index === 0 ? "eager" : "lazy"}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                    <div className="absolute top-4 left-4 z-20">
                      <span className="px-3 py-1 bg-sacred-gold/90 text-white rounded-full text-sm font-medium backdrop-blur-sm">
                        {blog.category}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 relative">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sacred-copper">🕮</span>
                        <span className="text-sacred-copper/80 text-sm">{blog.readTime}</span>
                      </div>
                      <motion.span 
                        className="text-sacred-gold text-lg"
                        animate={{ rotate: [0, 360] }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                      >
                        ✨
                      </motion.span>
                    </div>
                    
                    <h3 className="text-xl font-bold mb-3 text-kumkum-800 group-hover:text-sacred-vermilion transition-colors duration-300">
                      {blog.title}
                    </h3>
                    <p className="text-sacred-copper/80 text-sm">
                      {blog.excerpt}
                    </p>

                    {/* Read More Link */}
                    <div className="mt-4 flex items-center gap-2 text-sacred-gold group-hover:text-sacred-vermilion transition-colors duration-300">
                      <span>Read More</span>
                      <span className="transform group-hover:translate-x-2 transition-transform duration-300">→</span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Enhanced CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-center"
        >
          <Link href="/blog" 
            className="inline-flex items-center px-10 py-4 rounded-full bg-gradient-to-r from-sacred-vermilion via-sacred-gold to-sacred-copper 
                     text-white font-semibold hover:shadow-lg hover:shadow-sacred-gold/20 hover:scale-105 transition-all duration-300
                     relative overflow-hidden group"
          >
            <span className="relative z-10 flex items-center gap-2">
              <span>Explore Sacred Knowledge</span>
              <span className="transform group-hover:rotate-180 transition-transform duration-500">🕉️</span>
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-sacred-copper via-sacred-gold to-sacred-vermilion opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
