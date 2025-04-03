"use client"

import { motion } from 'framer-motion'
import { BackgroundBeams } from '@/components/ui/background-beams'
import { SparklesCore } from '@/components/ui/sparkles'
import { FaOm, FaBriefcase, FaGraduationCap, FaHandshake } from 'react-icons/fa'
import Link from 'next/link'

export default function CareersPage() {
  const openPositions = [
    {
      title: "Senior Astrologer",
      department: "Astrology",
      location: "Remote / Delhi NCR",
      type: "Full-time",
      requirements: [
        "10+ years of experience in Vedic Astrology",
        "Strong knowledge of multiple astrology systems",
        "Excellent communication skills",
        "Fluency in Hindi and English",
      ]
    },
    {
      title: "Frontend Developer",
      department: "Technology",
      location: "Delhi NCR",
      type: "Full-time",
      requirements: [
        "3+ years of React/Next.js experience",
        "Strong TypeScript skills",
        "Experience with responsive design",
        "Knowledge of modern web technologies",
      ]
    },
    {
      title: "Customer Success Specialist",
      department: "Operations",
      location: "Remote",
      type: "Full-time",
      requirements: [
        "2+ years in customer service",
        "Experience in spiritual/wellness industry",
        "Strong problem-solving skills",
        "Available for rotating shifts",
      ]
    }
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
              Join Our Sacred Journey
            </h1>
            <div className="h-1 w-32 mx-auto bg-gradient-to-r from-sacred-vermilion via-sacred-gold to-sacred-copper rounded-full" />
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="relative h-[40px] w-full mb-8">
            <SparklesCore background="transparent" minSize={0.4} maxSize={1} particleDensity={1200} className="w-full h-full" particleColor="#ff8303" />
          </motion.div>
        </motion.div>

        {/* Why Join Us Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
        >
          {[
            {
              icon: <FaBriefcase className="w-8 h-8" />,
              title: "Growth Opportunities",
              description: "Continuous learning and career advancement paths"
            },
            {
              icon: <FaGraduationCap className="w-8 h-8" />,
              title: "Learning & Development",
              description: "Regular training and skill enhancement programs"
            },
            {
              icon: <FaHandshake className="w-8 h-8" />,
              title: "Inclusive Culture",
              description: "Diverse and supportive work environment"
            }
          ].map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-sacred-gold/20"
            >
              <div className="text-amber-500 mb-4">{benefit.icon}</div>
              <h3 className="text-xl font-bold mb-2 text-amber-800">{benefit.title}</h3>
              <p className="text-amber-700/80">{benefit.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Open Positions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-sacred-gold/20"
        >
          <h2 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent">
            Open Positions
          </h2>

          <div className="space-y-6">
            {openPositions.map((position, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white/50 rounded-xl p-6 border border-sacred-gold/10"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-amber-800">{position.title}</h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="text-sm bg-amber-100 text-amber-800 px-3 py-1 rounded-full">
                        {position.department}
                      </span>
                      <span className="text-sm bg-amber-100 text-amber-800 px-3 py-1 rounded-full">
                        {position.location}
                      </span>
                      <span className="text-sm bg-amber-100 text-amber-800 px-3 py-1 rounded-full">
                        {position.type}
                      </span>
                    </div>
                  </div>
                  <Link
                    href={`/careers/apply?position=${encodeURIComponent(position.title)}`}
                    className="inline-block px-6 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold rounded-full hover:shadow-lg hover:shadow-amber-500/20 transition-all duration-300"
                  >
                    Apply Now
                  </Link>
                </div>

                <div className="mt-4">
                  <h4 className="font-semibold text-amber-800 mb-2">Requirements:</h4>
                  <ul className="list-disc list-inside space-y-1 text-amber-700/80">
                    {position.requirements.map((req, idx) => (
                      <li key={idx}>{req}</li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mt-12 text-center"
        >
          <p className="text-amber-700/80 mb-4">
            Don't see a position that matches your skills?
          </p>
          <Link
            href="mailto:careers@astroalert.com"
            className="inline-block px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold rounded-full hover:shadow-lg hover:shadow-amber-500/20 transition-all duration-300"
          >
            Contact Our HR Team
          </Link>
        </motion.div>
      </div>
    </main>
  )
}
