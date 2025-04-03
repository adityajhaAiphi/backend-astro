'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const faqData = [
  {
    question: "What is Vedic Astrology?",
    answer: "Vedic Astrology (Jyotish) is an ancient Indian science of celestial influences that helps understand your life's purpose, karmic patterns, and destiny through the positions of planets at the time of your birth.",
    icon: "🌟"
  },
  {
    question: "How does a birth chart reading work?",
    answer: "A birth chart reading involves analyzing the exact positions of planets at your birth time. Our expert astrologers study your Kundli (birth chart) to provide insights about your personality, relationships, career, and life path.",
    icon: "📜"
  },
  {
    question: "What are the Navagrahas (Nine Planets)?",
    answer: "The Navagrahas are nine celestial bodies: Sun (Surya), Moon (Chandra), Mars (Mangal), Mercury (Budh), Jupiter (Brihaspati), Venus (Shukra), Saturn (Shani), Rahu, and Ketu. Each influences different aspects of life.",
    icon: "🪐"
  },
  {
    question: "How can remedies help balance planetary influences?",
    answer: "Vedic remedies like gemstones, mantras, and specific rituals can help harmonize challenging planetary positions in your chart. These are prescribed based on your unique birth chart configuration.",
    icon: "💎"
  },
  {
    question: "What are the different types of astrological consultations?",
    answer: "We offer various consultations including birth chart analysis, relationship compatibility (Kundli Milan), Muhurta (timing) for important events, yearly predictions, and specific problem-solving sessions.",
    icon: "🔮"
  }
]

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section className="py-16 bg-gradient-to-b from-sacred-sandal/30 via-white to-sacred-saffron/20 relative overflow-hidden">
      {/* Sacred Mandala Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[url('/mandala-pattern.png')] bg-repeat opacity-10" />
        <div className="absolute top-20 left-10 w-32 h-32 bg-sacred-gold/10 rounded-full blur-2xl animate-float" />
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-sacred-vermilion/10 rounded-full blur-2xl animate-float animation-delay-2000" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Enhanced Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          {/* Sanskrit Title */}
          <div className="relative inline-block mb-6">
            <div className="relative bg-white/80 backdrop-blur-sm rounded-full px-8 py-2 border-2 border-sacred-gold/20
                          shadow-[0_0_15px_rgba(212,175,55,0.3)] hover:shadow-[0_0_20px_rgba(212,175,55,0.5)]
                          transition-all duration-500">
              <motion.span 
                className="inline-block text-lg md:text-xl bg-gradient-to-r from-sacred-copper via-sacred-gold to-sacred-vermilion
                           bg-clip-text text-transparent font-semibold tracking-wide"
                whileHover={{ scale: 1.05 }}
              >
                <span className="animate-glow inline-block">🕉️</span>
                <span className="mx-2">ज्ञान प्रश्न</span>
                <span className="animate-glow inline-block">🕉️</span>
              </motion.span>
            </div>
          </div>

          <h2 className="text-4xl font-bold mb-6 relative inline-block">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-sacred-vermilion via-sacred-gold to-sacred-copper animate-sacred-shimmer bg-[length:200%_auto]">
              Sacred Knowledge Guide
            </span>
            <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-sacred-vermilion via-sacred-gold to-sacred-copper rounded-full"></div>
          </h2>
          
          <p className="text-sacred-copper/80 text-lg max-w-2xl mx-auto font-medium">
            Unlock the mysteries of Vedic wisdom through our expert guidance
          </p>
        </motion.div>

        {/* Enhanced FAQ Cards */}
        <div className="max-w-3xl mx-auto space-y-4">
          {faqData.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white/80 backdrop-blur-sm rounded-xl overflow-hidden border border-sacred-gold/20
                         hover:shadow-lg hover:shadow-sacred-gold/10 transition-all duration-300"
            >
              <button
                className="w-full p-6 text-left flex items-start gap-4"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <span className="text-2xl mt-1">{faq.icon}</span>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-lg text-sacred-copper">
                      {faq.question}
                    </h3>
                    <motion.span 
                      animate={{ rotate: openIndex === index ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                      className="text-sacred-gold text-xl"
                    >
                      ॐ
                    </motion.span>
                  </div>
                  
                  <AnimatePresence>
                    {openIndex === index && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-4 text-sacred-copper/80"
                      >
                        {faq.answer}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </button>
            </motion.div>
          ))}
        </div>

        {/* Decorative Bottom Elements */}
        <div className="mt-16 text-center">
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-sacred-gold opacity-50 text-2xl"
          >
            🕉️
          </motion.div>
        </div>
      </div>
    </section>
  )
}
