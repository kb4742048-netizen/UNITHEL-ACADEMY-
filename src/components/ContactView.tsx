import React, { useState } from 'react';
import { Mail, MapPin, MessageSquare, Compass, CheckCircle } from 'lucide-react';

export default function ContactView() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const whatsAppGroupLink = 'https://chat.whatsapp.com/BUFcRgyJ1In590VagfBfBf?s=cl&p=a&ilr=0';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.email && formData.message) {
      setSubmitted(true);
      setTimeout(() => {
        setFormData({ name: '', email: '', subject: '', message: '' });
      }, 2000);
    }
  };

  return (
    <div className="bg-[#F5F1E8] text-[#1E293B] min-h-screen py-6 px-4">
      <div className="max-w-md mx-auto sm:max-w-xl md:max-w-4xl space-y-5">
        
        {/* Title banner */}
        <div className="text-center bg-[#0A1F44] border-2 border-[#C9A227] text-white py-8 px-4 shadow-sm relative">
          <span className="text-[10px] uppercase tracking-[0.2em] text-[#C9A227] font-sans font-black block mb-1">
            UNITHEL ACADEMY ALUMNI HQ
          </span>
          <h1 className="font-serif text-xl sm:text-2xl font-black uppercase tracking-wide">
            Get in Touch
          </h1>
          <p className="max-w-sm mx-auto text-[11px] text-gray-300 mt-1 font-sans leading-relaxed">
            Connect with Unithel Academy executive administrators, request membership details, or propose collaborative mentorship initiatives.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          
          {/* Contact Details Column */}
          <div className="md:col-span-5 bg-white p-4 border border-gray-200 shadow-sm space-y-5">
            <h2 className="font-serif font-bold text-sm text-[#0A1F44] uppercase tracking-wide border-b pb-1.5 border-gray-100">
              HQ Coordinates
            </h2>

            <div className="space-y-4 text-[11px] font-sans text-gray-600">
              <div className="flex items-start space-x-2.5">
                <MapPin className="h-4.5 w-4.5 text-[#C9A227] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold uppercase text-[#0A1F44]">Physical Address</h4>
                  <p className="mt-0.5 leading-normal">UNITHEL ACADEMY, Opolo Yenagoa Bayelsa State</p>
                </div>
              </div>

              <div className="flex items-start space-x-2.5">
                <Mail className="h-4.5 w-4.5 text-[#C9A227] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold uppercase text-[#0A1F44]">Electronic Inquiry</h4>
                  <p className="mt-0.5">info@scholarcircle.org</p>
                  <p className="text-gray-400">Response within 24 operational hours</p>
                </div>
              </div>
            </div>

            {/* Direct WhatsApp Call-to-action */}
            <div className="p-4 bg-[#F5F1E8] border border-[#C9A227]/25 text-center space-y-2.5">
              <Compass className="h-5 w-5 text-[#C9A227] mx-auto" />
              <h4 className="font-serif font-bold text-xs text-[#0A1F44] uppercase tracking-wider">Official WhatsApp Group</h4>
              <p className="text-[10px] text-gray-500 font-sans leading-normal">
                Join our official WhatsApp group community for real-time announcements, discussion, and direct networking.
              </p>
              <div>
                <a
                  href={whatsAppGroupLink}
                  target="_blank"
                  referrerPolicy="no-referrer"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] tracking-wider uppercase transition-colors shadow-sm"
                  style={{ minHeight: '44px' }}
                >
                  <MessageSquare className="h-3.5 w-3.5 text-white fill-current shrink-0" />
                  <span>Join WhatsApp Group</span>
                </a>
              </div>
            </div>
          </div>

          {/* Contact Form Column */}
          <div className="md:col-span-7 bg-white p-4 border border-gray-200 shadow-sm relative">
            <h2 className="font-serif font-bold text-sm text-[#0A1F44] uppercase tracking-wide border-b pb-1.5 border-gray-100 mb-3">
              Send a Message
            </h2>

            {submitted && (
              <div className="absolute inset-0 bg-white/95 z-10 flex flex-col items-center justify-center p-4 text-center space-y-3">
                <CheckCircle className="h-10 w-10 text-emerald-500 animate-bounce" />
                <h3 className="font-serif font-bold text-base text-[#0A1F44] uppercase tracking-wide">
                  Message Dispatched!
                </h3>
                <p className="text-xs text-gray-500 font-sans max-w-xs mx-auto">
                  Your communication has been registered with the administrative team. We will get back to you shortly.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="px-4 py-1.5 text-[10px] uppercase tracking-widest bg-[#0D2B4E] text-white font-bold"
                >
                  Send Another
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3 font-sans text-[11px]">
              <div>
                <label className="block font-bold uppercase text-[#0A1F44] tracking-wider mb-0.5">Your Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. John Smith"
                  className="w-full bg-[#F5F1E8] border border-gray-300 px-3 py-2 focus:outline-none focus:border-[#C9A227] text-xs rounded-none"
                />
              </div>

              <div>
                <label className="block font-bold uppercase text-[#0A1F44] tracking-wider mb-0.5">Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john@example.com"
                  className="w-full bg-[#F5F1E8] border border-gray-300 px-3 py-2 focus:outline-none focus:border-[#C9A227] text-xs rounded-none"
                />
              </div>

              <div>
                <label className="block font-bold uppercase text-[#0A1F44] tracking-wider mb-0.5">Subject</label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Inquiry Topic"
                  className="w-full bg-[#F5F1E8] border border-gray-300 px-3 py-2 focus:outline-none focus:border-[#C9A227] text-xs rounded-none"
                />
              </div>

              <div>
                <label className="block font-bold uppercase text-[#0A1F44] tracking-wider mb-0.5">Message Body</label>
                <textarea
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Detail your requirements here..."
                  className="w-full bg-[#F5F1E8] border border-gray-300 px-3 py-2 focus:outline-none focus:border-[#C9A227] text-xs rounded-none"
                />
              </div>

              <div className="pt-1.5">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#0A1F44] text-white hover:bg-[#C9A227] hover:text-[#0A1F44] transition-colors font-bold uppercase tracking-widest text-[10px]"
                >
                  Send Message
                </button>
              </div>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
}
