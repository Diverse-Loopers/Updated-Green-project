
'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden py-12 md:py-20 lg:py-28">

      {/* Background gradient (safe) */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />

      {/* Decorative blobs (ONLY desktop) */}
      <div className="hidden md:block absolute top-[-200px] right-[-200px] w-[300px] h-[300px] bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="hidden md:block absolute bottom-[-150px] left-[20%] w-[300px] h-[300px] bg-accent/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">

          {/* LEFT */}
          <div className="flex flex-col space-y-6 max-w-xl">

            <div className="space-y-3">
              <p className="text-sm font-semibold text-primary uppercase tracking-wide">
                Join Our Mission
              </p>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Shape the Future of{' '}
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Student Careers
                </span>
              </h1>
            </div>

            <p className="text-base sm:text-lg md:text-xl text-foreground/70 leading-relaxed">
              Diverse Loopers connects talented students with real-world business projects. We're building the bridge between education and industry expertise.
            </p>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="#open-roles">
                <Button className="w-full cursor-pointer sm:w-auto px-6 h-12">
                  Explore Roles
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </a>

              <Link href="/about">
                <Button
                  variant="outline"
                  className="w-full cursor-pointer sm:w-auto px-6 h-12"
                >
                  Learn About Us
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t">
              <div>
                <p className="text-xl md:text-2xl font-bold text-primary">500+</p>
                <p className="text-xs text-foreground/60">Students</p>
              </div>
              <div>
                <p className="text-xl md:text-2xl font-bold text-primary">50+</p>
                <p className="text-xs text-foreground/60">Partners</p>
              </div>
              <div>
                <p className="text-xl md:text-2xl font-bold text-primary">98%</p>
                <p className="text-xs text-foreground/60">Satisfaction</p>
              </div>
            </div>

          </div>

          {/* RIGHT */}
          <div className="w-full">
            <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-xl">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAf1dvqeUSNnH7BlxLGx34sbj0I91sPqJgbEIE3bOXK3fmbdw6QUKYhEVhHhOJ-NiGjG6VbhCcB9w5OBkkCDzeAwmscIq4zmF7eCWIivcW4SVr6ZC3cJohMNmOLP5ROco85cE5vhmfdVYQf6Ba2BZQdUQwoD4P4WvLDzQ-mmQU1yPmTEngNQx--FDpcdtqpNWQ1sDsay46tNH9H5KAoVhuO3bE1ttUWg0EFXll74XPeNdmHL1xAroR7tVDaDJKAZVga2KoAMjC_IeM"
                alt="Students"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
