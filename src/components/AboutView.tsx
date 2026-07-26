import React from 'react';
import { Compass, BookOpen, Users, Shield, Heart, Award, CheckCircle, Flame, Globe, Sparkles, Building, Landmark, GraduationCap, Vote } from 'lucide-react';

export default function AboutView() {
  const coreValues = [
    { name: 'Unity', icon: Users, desc: 'Building lasting relationships among Unithel Academy alumni across all graduating classes.' },
    { name: 'Integrity', icon: Shield, desc: 'Upholding honesty, accountability, and ethical conduct in all academic and professional pursuits.' },
    { name: 'Service', icon: Heart, desc: 'Giving back to Unithel Academy, fellow alumni, and the Bayelsa & global community.' },
    { name: 'Leadership', icon: Compass, desc: 'Encouraging responsible leadership and visionary influence in societal affairs.' },
    { name: 'Excellence', icon: Award, desc: 'Striving for high academic and professional standards in every endeavor.' },
    { name: 'Respect', icon: CheckCircle, desc: 'Valuing diversity, mutual understanding, and collaborative teamwork.' },
    { name: 'Innovation', icon: Globe, desc: 'Embracing cutting-edge ideas and modern technological solutions to empower members.' },
    { name: 'Lifelong Learning', icon: Flame, desc: 'Supporting continuous personal, research, and career development.' }
  ];

  const academyFeatures = [
    {
      title: 'Multidisciplinary Academic Faculties',
      icon: GraduationCap,
      description: 'Unithel Academy stands as a premier institution equipped with specialized research laboratories, humanities institutes, and tech innovation hubs producing visionary leaders across engineering, health sciences, law, and corporate administration.'
    },
    {
      title: 'Global Alumni Mentorship Network',
      icon: Users,
      description: 'A structured 1-on-1 mentorship program pairing young Unithel Academy graduates with distinguished senior alumni leaders across government, corporate tech, medicine, and academia.'
    },
    {
      title: 'Democratic Senate & Governance Assembly',
      icon: Vote,
      description: 'An official parliamentary body where elected Senators and Council Officers manage alumni affairs, propose policy revisions, and vote on institutional resolutions transparently.'
    },
    {
      title: 'Lord Patron Endowments & Research Grants',
      icon: Landmark,
      description: 'Alumni-sponsored research fellowships, hardship vouchers, and merit scholarships dedicated to advancing student innovation and supporting alumni post-graduate research.'
    },
    {
      title: 'Encrypted Member Portal & Real-Time Workspace',
      icon: Sparkles,
      description: 'A modern digital hub featuring verified member directories, real-time encrypted chatrooms, live bulletin boards, digital voting, and career opportunity exchanges.'
    },
    {
      title: 'Regional Chapter Assemblies & Grand Reunion',
      icon: Building,
      description: 'Active regional alumni chapters in Bayelsa, Lagos, Abuja, and international branches hosting annual grand reunions, professional masterclasses, and networking galas.'
    }
  ];

  return (
    <div className="bg-[#F5F1E8] text-[#1E293B] min-h-screen py-6 px-4 max-w-md mx-auto sm:max-w-xl md:max-w-5xl space-y-6">
      
      {/* Title Banner */}
      <div className="text-center bg-[#0A1F44] border-2 border-[#C9A227] text-white py-8 px-4 shadow-sm relative overflow-hidden">
        <span className="text-[10px] uppercase tracking-[0.25em] text-[#C9A227] font-sans font-black block mb-1">
          UNITHEL ACADEMY ALUMNI ASSOCIATION
        </span>
        <h1 className="font-serif text-2xl sm:text-3xl font-black uppercase tracking-wide text-amber-100">
          About Unithel Academy
        </h1>
        <p className="max-w-md mx-auto text-xs text-gray-300 mt-2 font-sans leading-relaxed">
          Nurturing lifelong connections, academic excellence, and leadership legacy across generations of Unithel Academy graduates.
        </p>
      </div>

      {/* 1. INTRODUCTION STATEMENT */}
      <section className="bg-white p-6 border border-gray-200 shadow-sm space-y-3">
        <div className="flex items-center space-x-2">
          <Users className="h-5 w-5 text-[#C9A227]" />
          <h2 className="font-serif font-bold text-sm text-[#0A1F44] uppercase tracking-wider">
            About Unithel Academy Alumni Association
          </h2>
        </div>
        <div className="h-0.5 bg-[#C9A227]/30 w-full" />
        <p className="text-xs text-gray-700 leading-relaxed font-sans text-justify">
          The Unithel Academy Alumni Association is an official, prestigious community of graduates, scholars, and academic patrons dedicated to maintaining lifelong connections with one another and with Unithel Academy (Opolo Yenagoa, Bayelsa State). The association serves as a premier platform for professional networking, mentorship, research grants, and societal service.
        </p>
        <p className="text-xs text-gray-700 leading-relaxed font-sans text-justify">
          Through strategic programs, regional chapter galas, and digital collaboration, the association strengthens the bond between alumni and Unithel Academy, ensuring that every graduate remains empowered throughout their professional journey.
        </p>
      </section>

      {/* 2. ACADEMY FEATURES & HIGHLIGHTS */}
      <section className="bg-white p-6 border border-gray-200 shadow-sm space-y-4">
        <div className="text-center max-w-md mx-auto space-y-1">
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#C9A227]">
            Institutional Pillars
          </span>
          <h2 className="font-serif font-bold text-base text-[#0A1F44] uppercase tracking-wider">
            Key Features of Unithel Academy & Alumni Network
          </h2>
          <div className="h-0.5 bg-[#C9A227]/30 w-24 mx-auto" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {academyFeatures.map((feat) => {
            const IconComp = feat.icon;
            return (
              <div key={feat.title} className="p-4 bg-[#F8F6F0] border border-gray-200 hover:border-[#C9A227] transition-all space-y-2 flex flex-col justify-between">
                <div>
                  <div className="p-2.5 bg-[#0D2B4E] text-[#C9A227] w-fit border border-[#C9A227]/30 mb-3">
                    <IconComp className="h-5 w-5" />
                  </div>
                  <h3 className="font-serif font-bold text-xs text-[#0A1F44] uppercase tracking-wide">
                    {feat.title}
                  </h3>
                  <p className="text-[11px] text-gray-600 leading-relaxed mt-1 font-sans">
                    {feat.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. HISTORY STATEMENT */}
      <section className="bg-white p-6 border border-gray-200 shadow-sm space-y-3">
        <div className="flex items-center space-x-2">
          <BookOpen className="h-5 w-5 text-[#C9A227]" />
          <h2 className="font-serif font-bold text-sm text-[#0A1F44] uppercase tracking-wider">
            Unithel Academy History & Legacy
          </h2>
        </div>
        <div className="h-0.5 bg-[#C9A227]/30 w-full" />
        <p className="text-xs text-gray-700 leading-relaxed font-sans text-justify">
          Unithel Academy was established with a clear mandate: to cultivate exceptional intellectual discipline, character, and leadership. Recognizing that an academy’s true legacy rests in the achievements of its alumni, the Alumni Association was instituted to keep the flame of Unithel academic excellence burning brightly.
        </p>
        <p className="text-xs text-gray-700 leading-relaxed font-sans text-justify">
          From its origins in Opolo Yenagoa to its expanding global footprint, Unithel Academy continues to produce distinguished leaders in technology, government, healthcare, law, and business.
        </p>
      </section>

      {/* 4. MISSION & VISION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-6 border border-gray-200 shadow-sm space-y-3">
          <div className="flex items-center space-x-2">
            <Compass className="h-5 w-5 text-[#C9A227]" />
            <h2 className="font-serif font-bold text-sm text-[#0A1F44] uppercase tracking-wider">Mission</h2>
          </div>
          <div className="h-0.5 bg-[#C9A227]/30 w-full" />
          <p className="text-xs text-gray-600 leading-relaxed font-sans">
            To unite all Unithel Academy alumni in a vibrant and supportive network that promotes lifelong brotherhood, career advancement, research mentorship, social responsibility, and sustained institutional progress.
          </p>
        </div>

        <div className="bg-white p-6 border border-gray-200 shadow-sm space-y-3">
          <div className="flex items-center space-x-2">
            <Award className="h-5 w-5 text-[#C9A227]" />
            <h2 className="font-serif font-bold text-sm text-[#0A1F44] uppercase tracking-wider">Vision</h2>
          </div>
          <div className="h-0.5 bg-[#C9A227]/30 w-full" />
          <p className="text-xs text-gray-600 leading-relaxed font-sans">
            To stand as an exemplary, globally respected alumni association that inspires visionary leadership, fosters technological and academic innovation, and provides enduring opportunities for Unithel Academy graduates across generations.
          </p>
        </div>
      </div>

      {/* 5. CORE VALUES GRID */}
      <section className="bg-white p-6 border border-gray-200 shadow-sm space-y-4">
        <div className="text-center">
          <h2 className="font-serif font-bold text-base text-[#0A1F44] uppercase tracking-wider">
            Our Core Values
          </h2>
          <p className="text-[10px] text-gray-500 font-sans mt-0.5">
            The foundational principles guiding Unithel Academy Alumni Association.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {coreValues.map((val) => {
            const IconComp = val.icon;
            return (
              <div key={val.name} className="flex space-x-3 p-2 hover:bg-gray-50 rounded">
                <div className="p-2 bg-[#0D2B4E]/5 border border-[#C9A227]/20 text-[#0A1F44] h-9 w-9 flex items-center justify-center shrink-0">
                  <IconComp className="h-4.5 w-4.5 text-[#C9A227]" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-xs text-[#0A1F44] uppercase tracking-wide">
                    {val.name}
                  </h3>
                  <p className="text-[11px] text-gray-600 leading-normal mt-0.5 font-sans">
                    {val.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
}
