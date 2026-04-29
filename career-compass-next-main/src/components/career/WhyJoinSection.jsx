'use client'

import { Check } from 'lucide-react'

// interface BenefitProps {
//   title: string
//   description: string
// }

function BenefitItem({ title, description }) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 mt-1">
        <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center">
          <Check className="w-4 h-4 text-accent" />
        </div>
      </div>
      <div className="flex-1">
        <h4 className="font-semibold text-foreground mb-2">{title}</h4>
        <p className="text-foreground/60 text-sm md:text-base leading-relaxed">{description}</p>
      </div>
    </div>
  )
}

export default function WhyJoinSection() {
  const benefits = [
    {
      title: 'Competitive Compensation',
      description: 'Flexible payment options including hourly rates, project-based pay, and equity opportunities.'
    },
    {
      title: 'Flexible Schedule',
      description: 'Work part-time or full-time with schedules that fit around your academic commitments.'
    },
    {
      title: 'Remote-First Culture',
      description: 'Work from anywhere. We embrace remote work with async-first communication.'
    },
    {
      title: 'Professional Development',
      description: 'Access to training, courses, and certifications to advance your technical and soft skills.'
    },
    {
      title: 'Health & Wellness',
      description: 'Comprehensive health benefits, wellness stipends, and mental health support resources.'
    },
    {
      title: 'Career Progression',
      description: 'Clear growth path with mentorship programs and leadership opportunities.'
    },
    {
      title: 'Diverse Community',
      description: 'Work with talented individuals from diverse backgrounds and geographic locations.'
    },
    {
      title: 'Networking Events',
      description: 'Connect with industry leaders, peers, and mentors at exclusive events and conferences.'
    }
  ]

  return (
    <section className="py-20 md:py-28 lg:py-32 relative bg-slate-50 dark:bg-slate-950/50">
      <div className="absolute inset-0 bg-gradient-to-b from-accent/3 via-transparent to-primary/3 pointer-events-none" />
      
      <div className="container relative z-10 px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-16 items-center">
          {/* Left visual */}
          <div className="relative h-96 md:h-[500px] rounded-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-primary/10" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                {/* Animated background circles */}
                <div className="absolute -top-12 -left-12 w-48 h-48 bg-accent/20 rounded-full blur-3xl" />
                <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-primary/20 rounded-full blur-3xl" />
                <div className="relative bg-gradient-to-br from-accent/30 to-primary/20 p-8 rounded-2xl backdrop-blur-sm border border-accent/20">
                  <div className="text-center">
                    <p className="text-5xl font-bold text-transparent bg-gradient-to-r from-accent to-primary bg-clip-text mb-2">
                      98%
                    </p>
                    <p className="text-foreground/70 font-medium">Employee Satisfaction</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right benefits */}
          <div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-8">
              Why Join Diverse Loopers?
            </h2>
            <p className="text-lg text-foreground/70 mb-12 leading-relaxed">
              We believe in creating an environment where students can thrive, grow, and make a real impact while building their professional careers.
            </p>

            <div className="space-y-6">
              {benefits.map((benefit, index) => (
                <BenefitItem
                  key={index}
                  title={benefit.title}
                  description={benefit.description}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
