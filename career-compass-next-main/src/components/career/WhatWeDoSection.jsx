

import { Briefcase, Users, Layers, Sparkles } from "lucide-react";

export default function WhatWeDo() {
  return (
    <section className="relative bg-[#F5F7FB] py-24 overflow-hidden">
      
      {/* Subtle background glow */}
      <div className="absolute top-[-100px] left-[-100px] w-[300px] h-[300px] bg-indigo-200 opacity-20 blur-3xl rounded-full"></div>
      <div className="absolute bottom-[-100px] right-[-100px] w-[300px] h-[300px] bg-blue-200 opacity-20 blur-3xl rounded-full"></div>

      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">

        {/* LEFT SIDE */}
        <div>
          <p className="text-sm text-indigo-600 font-medium mb-3">
            How it works
          </p>

          <h2 className="text-4xl font-semibold text-gray-900 leading-tight mb-6">
            We don’t just teach. <br />
            We build professionals.
          </h2>

          <p className="text-lg text-gray-600 mb-6 leading-relaxed">
            At Diverse Loopers, students don’t learn through theory alone. 
            They work on real business problems, collaborate in teams, and 
            grow under mentorship — just like in real companies.
          </p>

          <p className="text-sm text-gray-500 font-medium">
            From learning → execution → professional growth
          </p>
        </div>

        {/* RIGHT SIDE (Staggered Cards) */}
        <div className="relative">

          {/* Card 1 */}
          <div className="relative z-10 bg-white p-6 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.05)] border border-gray-100 mb-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600">
                <Briefcase size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Real Business Projects
                </h3>
                <p className="text-sm text-gray-600">
                  Work on live projects from real companies — not assignments or simulations.
                </p>
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="relative z-20 bg-white p-6 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.05)] border border-gray-100 ml-8 mb-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
                <Users size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Mentorship That Guides Execution
                </h3>
                <p className="text-sm text-gray-600">
                  Learn how professionals think, build, and deliver with guidance from experts.
                </p>
              </div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="relative z-10 bg-white p-6 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.05)] border border-gray-100 mb-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-green-50 text-green-600">
                <Layers size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Work Like a Real Team
                </h3>
                <p className="text-sm text-gray-600">
                  Collaborate, communicate, and execute just like in real organizations.
                </p>
              </div>
            </div>
          </div>

          {/* Card 4 */}
          <div className="relative z-0 bg-white p-6 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.05)] border border-gray-100 ml-8">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-purple-50 text-purple-600">
                <Sparkles size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Build a Portfolio That Matters
                </h3>
                <p className="text-sm text-gray-600">
                  Showcase real impact and real work — not just certificates.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}