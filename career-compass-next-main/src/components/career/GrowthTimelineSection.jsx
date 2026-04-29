'use client'
import { FaUserGraduate, FaTrophy } from "react-icons/fa";



export default function GrowthTimelineSection() {
  

  return (
   

    // <!-- Culture & Programs Insights -->
<section className="py-24 px-8 max-w-7xl mx-auto">
<div className="grid lg:grid-cols-3 gap-8">
<div className="lg:col-span-2 space-y-8">
<div className="p-8 bg-surface-container-lowest rounded-3xl flex gap-8 items-center group bg-white">

<div className="bg-gray-200 p-4 rounded-xl">
          <FaUserGraduate className="text-blue-600 text-xl" />
        </div>
<div>
<h3 className="text-2xl font-bold mb-2 ">Personal Mentorship</h3>
<p className="text-on-surface-variant">Every looper is paired with a senior professional for weekly 1-on-1 career mapping and technical deep dives.</p>
</div>
</div>
<div className="p-8 bg-surface-container-lowest rounded-3xl flex gap-8 items-center bg-white">

<div className="bg-gray-200 p-4 rounded-xl">
          <FaTrophy className="text-blue-600 text-xl" />
        </div>
<div>
<h3 className="text-2xl font-bold mb-2">The Wall of Fame</h3>
<p className="text-on-surface-variant">Our digital and physical monument celebrating those who made the leap from students to industry-leading professionals.</p>
</div>
</div>
</div>
<div className="bg-surface-container-lowest rounded-3xl p-8 flex flex-col bg-white">
<h3 className="text-2xl font-bold mb-6">Global Offsites</h3>
<div className="h-48 w-full bg-slate-100 rounded-2xl mb-6 overflow-hidden">
<img alt="Offsite" className="w-full h-full object-cover" data-alt="Team having a social gathering at sunset" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD21VtuAxtqxh6iz6ZjJ3o6splMNNlYjdPCpXz8GqpYlW87wY9zQ0sPqrscXOn5UEXj6eNnNeBnTJsA7-MbEifahMdItyUSQJ_-_XL4sWVMIxYBGxl5DA3KWsZILlp8CWQl_nO9mWSNLjsJjWtxbKPrrysBjoiuFGKKUJccEWTkp_rdBeFKkTUnO_L5h79QMIJ_XCAtt0DAM64dn8-rzAFA-7Zrp1ocGbKbBLnQuj3W5go2bAQnq6D-_9HIWdc82-f8ZRh0icxnggI"/>
</div>
<p className="text-on-surface-variant mb-auto">Twice a year, we gather the global cohort in inspiring locations to reset and reconnect.</p>

</div>
</div>
</section>
  )
}
