import Image from 'next/image'
import { motion } from 'framer-motion'

export const AstrologyTypes = () => {
  const astrologyTypes = [
    {
      title: "Vedic Astrology",
      description: "Ancient Indian system of astrology, also known as Jyotish, based on the sidereal zodiac.",
      image: "/vedic-astrology.jpg"
    },
    {
      title: "Western Astrology",
      description: "Modern system based on tropical zodiac, focusing on psychological and personality analysis.",
      image: "/western-astrology.jpg"
    },
    {
      title: "Chinese Astrology",
      description: "Based on twelve animal signs and the lunar calendar, emphasizing yearly cycles.",
      image: "/chinese-astrology.jpg"
    },
    {
      title: "Numerology",
      description: "Study of numbers and their influence on human life and events.",
      image: "/numerology.jpg"
    }
  ]

  return (
    <section className="py-16 bg-gradient-to-b from-sacred-sandal/30 via-white to-sacred-saffron/20 relative overflow-hidden">
      {/* Enhanced Sacred Mandala Background with multiple layers */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[url('/mandala-pattern.png')] bg-repeat opacity-10" />
        <div className="absolute top-20 left-10 w-32 h-32 bg-sacred-gold/10 rounded-full blur-2xl animate-float" />
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-sacred-vermilion/10 rounded-full blur-2xl animate-float animation-delay-2000" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Enhanced Header Section with rotating Om symbol */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          {/* Sanskrit Title with improved decorative elements */}
          <div className="relative inline-block mb-6">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 bg-gradient-to-r from-sacred-vermilion via-sacred-gold to-sacred-copper rounded-full opacity-20 blur-sm"
            />
            <div className="relative bg-white/80 backdrop-blur-sm rounded-full px-8 py-2 border-2 border-sacred-gold/20
                          shadow-[0_0_15px_rgba(212,175,55,0.3)] hover:shadow-[0_0_20px_rgba(212,175,55,0.5)]
                          transition-all duration-500">
              <motion.span 
                className="inline-block text-lg md:text-xl bg-gradient-to-r from-sacred-copper via-sacred-gold to-sacred-vermilion
                           bg-clip-text text-transparent font-semibold tracking-wide"
                whileHover={{ scale: 1.05 }}
              >
                <span className="animate-glow inline-block">🕉️</span>
                <span className="mx-2">ज्योतिष शास्त्र</span>
                <span className="animate-glow inline-block">🕉️</span>
              </motion.span>
            </div>
          </div>

          <h2 className="text-5xl font-bold mb-6 relative inline-block">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-sacred-vermilion via-sacred-gold to-sacred-copper animate-sacred-shimmer bg-[length:200%_auto]">
              Ancient Vedic Astrology
            </span>
            <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-sacred-vermilion via-sacred-gold to-sacred-copper rounded-full"></div>
          </h2>
          
          {/* Added subtitle */}
          <p className="text-sacred-copper/80 text-lg max-w-2xl mx-auto font-medium">
            Discover the ancient wisdom of celestial science
          </p>
        </motion.div>

        {/* Enhanced Introduction Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="prose max-w-4xl mx-auto mb-16 bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-sacred-gold/20
                     hover:shadow-lg hover:shadow-sacred-gold/20 transition-all duration-500"
        >
          <p className="text-sacred-copper/90 mb-6 text-lg leading-relaxed">
            Astrology as a predictive science facilitates fortune tellers and astrologers to dive deep into the study of a person's unique traits right from the moment they are born. The zodiac is the belt of constellations through which the Sun, the Moon and the planets transit across the sky. Many believe that studying the position of celestial bodies at the time of birth can predict one's future.
          </p>
          <p className="text-sacred-copper/90 mb-6 text-lg leading-relaxed">
            Our country has given the world a precious gift in the form of the study of the Sun, the Moon, and the planets in our galaxy. This science of calculating the impact of planetary movements is called horoscope astrology.
          </p>
        </motion.div>

        {/* Enhanced Types Grid with Hover Effects */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {astrologyTypes.map((type, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="group"
            >
              <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg 
                            hover:shadow-2xl transition-all duration-500 border border-sacred-gold/20">
                {/* Enhanced corner decorations */}
                <div className="absolute top-0 left-0 w-16 h-16">
                  <div className="absolute top-0 left-0 w-full h-full border-t-2 border-l-2 border-sacred-gold/30 rounded-tl-2xl" />
                  <div className="absolute top-2 left-2 w-2 h-2 bg-sacred-gold/40 rounded-full" />
                </div>
                <div className="absolute top-0 right-0 w-16 h-16">
                  <div className="absolute top-0 right-0 w-full h-full border-t-2 border-r-2 border-sacred-gold/30 rounded-tr-2xl" />
                  <div className="absolute top-2 right-2 w-2 h-2 bg-sacred-gold/40 rounded-full" />
                </div>
                
                {/* Enhanced Image Container */}
                <div className="relative h-48 overflow-hidden bg-gradient-to-b from-sacred-gold/10 to-sacred-copper/10">
                  <div className="absolute inset-0 bg-sacred-gold/5 animate-pulse" />
                  <Image
                    src={type.image}
                    alt={type.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  
                  {/* Added floating Om symbol */}
                  <motion.span 
                    className="absolute top-4 right-4 text-sacred-gold text-2xl opacity-80"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    🕉️
                  </motion.span>
                </div>
                
                {/* Enhanced Content Area */}
                <div className="p-6 relative">
                  <h3 className="text-xl font-bold mb-3 bg-gradient-to-r from-sacred-vermilion to-sacred-gold 
                               bg-clip-text text-transparent group-hover:from-sacred-gold group-hover:to-sacred-vermilion 
                               transition-all duration-300">
                    {type.title}
                  </h3>
                  <p className="text-sacred-copper/80">
                    {type.description}
                  </p>
                  
                  {/* Added decorative bottom line */}
                  <div className="absolute -bottom-px left-4 right-4 h-[2px] bg-gradient-to-r from-transparent via-sacred-gold/30 to-transparent"></div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Enhanced Detailed Information Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="prose max-w-4xl mx-auto bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-sacred-gold/20
                     hover:shadow-lg hover:shadow-sacred-gold/20 transition-all duration-500"
        >
          <div className="mb-8">
            <h4 className="text-2xl font-semibold mb-4 bg-gradient-to-r from-sacred-vermilion to-sacred-gold bg-clip-text text-transparent">
              Indian Astrology (Vedic)
            </h4>
            <p className="text-sacred-copper/90">
              Indian astrology (Vedic astrology) can be traced back centuries and is based on the movement of different stars and planets. It studies 27 constellations, 9 planets, 12 zodiacs, and 12 houses and their impact on people's lives. Astrology by date of birth helps create a horoscope chart that displays the placement of the 9 planets among the 12 houses at the time of birth.
            </p>
          </div>

          <div className="mb-8">
            <h4 className="text-2xl font-semibold mb-4 bg-gradient-to-r from-sacred-vermilion to-sacred-gold bg-clip-text text-transparent">
              Western Astrology
            </h4>
            <p className="text-sacred-copper/90">
              Western astrology uses an equatorial zodiac system controlled by the equator points. This design of making predictions develops a horoscope using each definite minute, giving precedence to the time of birth before making predictions. This science tracks the movement of the Sun, the planets, and the Moon.
            </p>
          </div>

          <div>
            <h4 className="text-2xl font-semibold mb-4 bg-gradient-to-r from-sacred-vermilion to-sacred-gold bg-clip-text text-transparent">
              Astrology Chart Components
            </h4>
            <ul className="list-none pl-0 grid gap-3">
              <li className="flex items-center gap-3 text-sacred-copper/90 p-2 rounded-lg hover:bg-sacred-gold/5 transition-colors duration-300">
                <span className="text-sacred-gold">✨</span>
                The position of each planet in the 12 houses
              </li>
              <li className="flex items-center gap-3 text-sacred-copper/90 p-2 rounded-lg hover:bg-sacred-gold/5 transition-colors duration-300">
                <span className="text-sacred-gold">✨</span>
                The placement of the Moon, Venus, and Mars
              </li>
              <li className="flex items-center gap-3 text-sacred-copper/90 p-2 rounded-lg hover:bg-sacred-gold/5 transition-colors duration-300">
                <span className="text-sacred-gold">✨</span>
                Jupiter's placement for luck
              </li>
              <li className="flex items-center gap-3 text-sacred-copper/90 p-2 rounded-lg hover:bg-sacred-gold/5 transition-colors duration-300">
                <span className="text-sacred-gold">✨</span>
                Saturn's placement for areas that need hard work
              </li>
              <li className="flex items-center gap-3 text-sacred-copper/90 p-2 rounded-lg hover:bg-sacred-gold/5 transition-colors duration-300">
                <span className="text-sacred-gold">✨</span>
                Aspects formed between two planets
              </li>
              <li className="flex items-center gap-3 text-sacred-copper/90 p-2 rounded-lg hover:bg-sacred-gold/5 transition-colors duration-300">
                <span className="text-sacred-gold">✨</span>
                The balance of the four elements (fire, water, earth, and air)
              </li>
              <li className="flex items-center gap-3 text-sacred-copper/90 p-2 rounded-lg hover:bg-sacred-gold/5 transition-colors duration-300">
                <span className="text-sacred-gold">✨</span>
                Whether elements are cardinal, fixed, or mutable
              </li>
            </ul>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
