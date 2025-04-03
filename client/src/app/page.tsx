'use client'
import Image from "next/image"
import Link from "next/link"
import { Hero } from "@/components/ui/Hero"
// import { FreeServices } from "@/components/ui/FreeServices"
import { FreeServices } from "@/components/ui/FreeServices"
import { CustomerReviews } from "@/components/CustomerReviews"
import { BlogSection } from "@/components/BlogSection"
import { AstrologyTypes } from "@/components/AstrologyTypes"
import { FAQ } from "@/components/FAQ"
import { Footer } from "@/components/Footer"
export default function Page() {
  return (
    <>
    <Hero />
    <FreeServices />  
    <CustomerReviews />
    <BlogSection />
    <AstrologyTypes />
    <FAQ />
    <Footer />
    
    </>
    
  )
}