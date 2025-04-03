'use client'

import { motion } from 'framer-motion'
import { BackgroundBeams } from '@/components/ui/background-beams'
import { SparklesCore } from '@/components/ui/sparkles'
import { FaOm, FaPhone, FaEnvelope, FaMapMarkerAlt, FaWhatsapp, FaFacebook, FaInstagram, FaTwitter } from 'react-icons/fa'
import Link from 'next/link'

export default function ContactPage() {
  const contactMethods = [
    {
      icon: <FaPhone className="w-8 h-8" />,
      title: "Call Us",
      description: "24/7 Customer Support",
      action: "+91 9999 091 091",
      link: "tel:+919999091091",
      color: "from-amber-500 to-orange-500"
    },
    {
      icon: <FaWhatsapp className="w-8 h-8" />,
      title: "WhatsApp",
      description: "Quick Chat Support",
      action: "+91 9999 091 091",
      link: "https://wa.me/919999091091",
      color: "from-green-500 to-green-600"
    },
    {
      icon: <FaEnvelope className="w-8 h-8" />,
      title: "Email Us",
      description: "Get in Touch",
      action: "contact@astroalert.com",
      link: "mailto:contact@astroalert.com",
      color: "from-blue-500 to-purple-500"
    }
  ]

  const socialLinks = [
    { icon: <FaFacebook className="w-6 h-6" />, link: "https://facebook.com/astroalert" },
    { icon: <FaInstagram className="w-6 h-6" />, link: "https://instagram.com/astroalert" },
    { icon: <FaTwitter className="w-6 h-6" />, link: "https://twitter.com/astroalert" }
  ]

  return (
    <main className="min-h-screen bg-gradient-to-br from-sacred-sandal via-white to-sacred-saffron/10 relative overflow-hidden">
      {/* Sacred Mandala Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[url('/mandala-pattern.png')] bg-repeat opacity-10" />
        <div className="absolute top-20 left-10 w-32 h-32 bg-sacred-gold/10 rounded-full blur-2xl animate-float" />
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-sacred-vermilion/10 rounded-full blur-2xl animate-float animation-delay-2000" />
      </div>

      <BackgroundBeams className="opacity-25" />

      <div className="max-w-[1300px] mx-auto px-4 py-8 relative z-10">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="inline-block">
            <FaOm className="w-12 h-12 mx-auto text-amber-500 animate-pulse mb-4" />
            <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-sacred-vermilion via-sacred-gold to-sacred-copper bg-clip-text text-transparent">
              Connect With Us
            </h1>
            <div className="h-1 w-32 mx-auto bg-gradient-to-r from-sacred-vermilion via-sacred-gold to-sacred-copper rounded-full" />
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="relative h-[40px] w-full mb-8">
            <SparklesCore background="transparent" minSize={0.4} maxSize={1} particleDensity={1200} className="w-full h-full" particleColor="#ff8303" />
          </motion.div>
        </motion.div>

        {/* Contact Methods Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {contactMethods.map((method, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-sacred-gold/20"
            >
              <Link href={method.link} className="block">
                <div className={`text-transparent bg-gradient-to-r ${method.color} bg-clip-text mb-4`}>
                  {method.icon}
                </div>
                <h3 className="text-xl font-bold mb-2 text-amber-800">{method.title}</h3>
                <p className="text-amber-700/80 mb-4">{method.description}</p>
                <p className="font-medium text-lg text-amber-900">{method.action}</p>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Office Location */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-sacred-gold/20 mb-16"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent">
                Visit Our Office
              </h2>
              <div className="flex items-start gap-4 text-amber-700/80">
                <FaMapMarkerAlt className="w-6 h-6 text-amber-500 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-medium">AstroAlert Headquarters</p>
                  <p>123 Spiritual Lane</p>
                  <p>New Delhi, 110001</p>
                  <p>India</p>
                </div>
              </div>
            </div>
            <div className="h-[200px] md:h-full min-h-[200px] bg-amber-100 rounded-xl">
              {/* Map placeholder - Replace with actual map component */}
              <div className="w-full h-full rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                <span className="text-amber-800/50">Map View</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Social Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent">
            Follow Us
          </h2>
          <div className="flex justify-center gap-6">
            {socialLinks.map((social, index) => (
              <motion.a
                key={index}
                href={social.link}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-amber-500 hover:text-amber-600 transition-colors"
              >
                {social.icon}
              </motion.a>
            ))}
          </div>
        </motion.div>

        {/* FAQ CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mt-16 text-center"
        >
          <p className="text-amber-700/80 mb-4">
            Have questions? Check out our frequently asked questions
          </p>
          <Link
            href="/faq"
            className="inline-block px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold rounded-full hover:shadow-lg hover:shadow-amber-500/20 transition-all duration-300"
          >
            Visit FAQ Page
          </Link>
        </motion.div>
      </div>
    </main>
  )
} 