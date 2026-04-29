'use client'

import { Button } from '@/components/ui/button'
import { Mail, Linkedin, Github } from 'lucide-react'

export default function FinalCTASection() {
  return (
    <section className="relative px-4 md:px-10 lg:px-20 py-10 md:py-18 lg:py-28 overflow-hidden">
      {/* Gradient backgrounds */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/10 to-primary/10 pointer-events-none" />
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-accent/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
      
      <div className="container relative z-10 px-4 md:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
            Ready to Make a Real Impact?
          </h2>
          
          <p className="text-xl md:text-2xl text-foreground/70 mb-12 leading-relaxed">
            Join us in transforming how students discover their careers and how companies discover their future leaders.
          </p>

          {/* Primary CTA */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
           <a href="#open-roles">
            <Button 
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-12 py-4 text-lg font-semibold rounded-lg h-auto"
            >
              Apply Now
            </Button>
            </a>
          </div>

          {/* Contact info */}
          <div className="mb-16">
            <p className="text-foreground/70 mb-6 text-sm md:text-base">
              Prefer to reach out directly? We'd love to hear from you.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 md:gap-8 justify-center items-center flex-wrap">
              <a
                href="mailto:careers@diverseloopers.com"
                className="flex items-center gap-3 px-6 py-3 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary font-medium transition-colors"
              >
                <Mail className="w-5 h-5" />
                careers@diverseloopers.com
              </a>
              <a
                href="https://www.linkedin.com/company/105277450"
                className="flex items-center gap-3 px-6 py-3 rounded-lg bg-accent/10 hover:bg-accent/20 text-accent font-medium transition-colors"
              >
                <Linkedin className="w-5 h-5" />
                LinkedIn
              </a>
             
            </div>
          </div>

          {/* Bottom section */}
          <div className="pt-12 border-t border-border/30">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <p className="text-xs uppercase tracking-widest text-foreground/50 font-semibold mb-3">
                  Response Time
                </p>
                <p className="text-lg font-bold text-foreground">24-48 Hours</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-foreground/50 font-semibold mb-3">
                  Application Process
                </p>
                <p className="text-lg font-bold text-foreground">Quick & Simple</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-foreground/50 font-semibold mb-3">
                  Equal Opportunities
                </p>
                <p className="text-lg font-bold text-foreground">Always</p>
              </div>
            </div>
          </div>
        </div>

        {/* Testimonial highlight */}
        <div className="mt-20 md:mt-24 max-w-2xl mx-auto">
          <div className="p-8 md:p-12 rounded-2xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 text-center">
            <p className="text-lg md:text-xl text-foreground/80 italic mb-6 leading-relaxed">
              "Applying to Diverse Loopers was one of the best decisions I made as a student. The experience, mentorship, and relationships I gained are invaluable. I'm now excited about my career in ways I never expected."
            </p>
            <p className="font-semibold text-foreground">
              — Ajit Singh
            </p>
            <p className="text-sm text-foreground/60">
              Former Intern, Now Software Engineer at Meta
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
