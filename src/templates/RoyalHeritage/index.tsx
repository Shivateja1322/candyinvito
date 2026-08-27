import React, { useState } from "react";
import { IconRenderer } from "../../components/IconRenderer";
import { EditableText, EditableImage } from "../../components/builder";
import {
  Reveal,
  HeroMedia,
  Gallery,
  LocationCard,
  BackgroundAudio,
  Typography,
  SectionHeading,
  RsvpModal,
} from "../../components/premium";

export interface RoyalHeritageProps {
  data: any;
  invitationId?: string;
}

export default function RoyalHeritage({ data, invitationId }: RoyalHeritageProps) {
  const [showRsvp, setShowRsvp] = useState(false);
  
  const hero = data?.hero || {};
  const couple = data?.couple || {};
  const story = data?.story || [];
  const events = data?.events || [];
  const venue = data?.venue || { enabled: true };
  const gallery = data?.gallery || { enabled: false, images: [] };
  const livestream = data?.livestream || { enabled: false };
  const contact = data?.contact || { enabled: true };
  const rsvp = data?.rsvp || { enabled: true };
  const footer = data?.footer || { enabled: true };

  return (
    <div className="bg-[#FAF9F6] text-[#2C2C2C] min-h-screen selection:bg-[#D4AF37]/30 selection:text-[#6B151E] overflow-x-hidden">
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Great+Vibes&family=Outfit:wght@300;400;500;600&display=swap');
        
        .royal-theme {
          --color-maroon: #6B151E;
          --color-maroon-dark: #500F16;
          --color-gold: #D4AF37;
          --color-ivory: #FDFBF7;
          --color-surface: #F5F0E6;
        }

        .font-serif { font-family: 'Cormorant Garamond', serif; }
        .font-script { font-family: 'Great Vibes', cursive; }
        .font-sans { font-family: 'Outfit', sans-serif; }

        .vine-divider {
          height: 40px;
          background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 40'><path d='M0 20 Q 50 0 100 20 T 200 20' stroke='%23D4AF37' fill='none' stroke-width='1'/><circle cx='100' cy='20' r='3' fill='%23D4AF37'/></svg>");
          background-repeat: repeat-x;
          background-size: 200px 40px;
          opacity: 0.4;
        }
        
        .gold-frame {
          position: relative;
          border: 1px solid rgba(212, 175, 55, 0.4);
          padding: 2rem;
        }
        
        .gold-frame::before,
        .gold-frame::after {
          content: '';
          position: absolute;
          width: 24px;
          height: 24px;
          border: 2px solid #D4AF37;
        }
        
        .gold-frame::before {
          top: -6px;
          left: -6px;
          border-right: none;
          border-bottom: none;
        }
        
        .gold-frame::after {
          bottom: -6px;
          right: -6px;
          border-left: none;
          border-top: none;
        }

        .timeline-line {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          width: 1px;
          height: 100%;
          background: linear-gradient(to bottom, transparent, #D4AF37, transparent);
        }
      `,
        }}
      />

      <div className="royal-theme font-sans">
        <BackgroundAudio src={hero?.audio_url} autoPlay position="bottom-right" />

        {/* 1. HERO SECTION */}
        <section id="hero" className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden bg-[#6B151E]">
          <HeroMedia
            type={hero?.video_url ? 'video' : 'image'}
            src={hero?.video_url || hero?.image_url}
            fallbackSrc="https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=1974&auto=format&fit=crop"
            overlay="bg-gradient-to-b from-[#6B151E]/60 via-[#6B151E]/40 to-[#6B151E]/80"
          />

          <div className="relative z-20 text-center px-6 w-full max-w-4xl mx-auto flex flex-col items-center justify-center h-full pt-16 pb-24">
            <Reveal animation="fade-up" delay={0.2} duration={1.2}>
              <EditableText path="hero.subtitle" defaultText="Sri Shubhamasthu · Kalyanamasthu" className="text-[#D4AF37] font-sans tracking-[0.4em] text-[10px] md:text-xs uppercase mb-8 block" />
            </Reveal>

            <Reveal animation="fade-up" delay={0.6} duration={1.2}>
              <Typography variant="decorative" className="text-[#D4AF37] text-4xl md:text-5xl mb-4 block">
                Wedding Invitation
              </Typography>
            </Reveal>

            <Reveal animation="fade-up" delay={1.0} duration={1.2} className="w-full">
              <h1 className="font-serif text-[#FDFBF7] text-5xl md:text-8xl lg:text-9xl font-light leading-none flex flex-col items-center justify-center gap-2">
                <EditableText path="couple.partnerA.name" defaultText="Arjun" as="span" />
                <span className="text-[#D4AF37] font-script text-6xl md:text-8xl my-2">&</span>
                <EditableText path="couple.partnerB.name" defaultText="Priya" as="span" />
              </h1>
            </Reveal>

            <Reveal animation="fade-up" delay={1.4} duration={1.2} className="mt-8 flex items-center gap-4 text-[#FDFBF7]/90">
              <span className="h-px w-12 bg-[#D4AF37]" />
              <span className="font-sans tracking-[0.3em] uppercase text-[10px] md:text-xs">Are Getting Married</span>
              <span className="h-px w-12 bg-[#D4AF37]" />
            </Reveal>

            <Reveal animation="fade-up" delay={1.6} duration={1.2}>
              <EditableText path="hero.title" defaultText="Thursday, 20th December 2026" className="mt-8 text-[#FDFBF7] font-serif text-2xl md:text-3xl italic block" />
              
              {hero?.auspicious_time && (
                <EditableText path="hero.auspicious_time" defaultText="Muhurtham: 10:30 AM" className="mt-6 text-[#D4AF37] font-sans text-xs uppercase tracking-widest block" />
              )}
            </Reveal>
          </div>
        </section>

        <div className="vine-divider bg-[#FAF9F6]"></div>

        {/* 2. COUPLE SECTION */}
        <section id="couple" className="py-24 md:py-32 px-6 bg-[#FAF9F6]">
          <SectionHeading title="Two Souls, One Journey" subtitle="The Couple" theme="light" />

          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 md:gap-24 items-center mt-16">
            <Reveal animation="fade-up">
              <div className="gold-frame bg-[#F5F0E6] text-center p-8 md:p-12">
                <div className="w-32 md:w-48 aspect-[3/4] mx-auto mb-8 relative border-2 border-[#D4AF37] p-1 bg-white">
                   <EditableImage path="couple.partnerA.image_url" defaultSrc="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1287&auto=format&fit=crop" className="w-full h-auto object-contain" />
                </div>
                <EditableText path="couple.partnerA.role" defaultText="The Groom" as="p" className="text-[10px] font-sans uppercase tracking-[0.4em] text-[#D4AF37] mb-4" />
                <EditableText path="couple.partnerA.name" defaultText="Arjun Rao" as="h3" className="font-serif text-4xl md:text-5xl text-[#6B151E] mb-4" />
                <EditableText path="couple.partnerA.parents" defaultText="Son of Mr. & Mrs. Rao" as="p" className="text-xs font-sans text-[#70655B] uppercase tracking-widest mb-4" />
                <EditableText path="couple.partnerA.description" defaultText="A man of honor and respect." as="p" className="text-sm font-sans text-[#70655B] italic leading-relaxed" />
              </div>
            </Reveal>

            <Reveal animation="fade-up" delay={0.2}>
              <div className="gold-frame bg-[#F5F0E6] text-center p-8 md:p-12">
                <div className="w-32 md:w-48 aspect-[3/4] mx-auto mb-8 relative border-2 border-[#D4AF37] p-1 bg-white">
                   <EditableImage path="couple.partnerB.image_url" defaultSrc="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1364&auto=format&fit=crop" className="w-full h-auto object-contain" />
                </div>
                <EditableText path="couple.partnerB.role" defaultText="The Bride" as="p" className="text-[10px] font-sans uppercase tracking-[0.4em] text-[#D4AF37] mb-4" />
                <EditableText path="couple.partnerB.name" defaultText="Priya Sharma" as="h3" className="font-serif text-4xl md:text-5xl text-[#6B151E] mb-4" />
                <EditableText path="couple.partnerB.parents" defaultText="Daughter of Mr. & Mrs. Sharma" as="p" className="text-xs font-sans text-[#70655B] uppercase tracking-widest mb-4" />
                <EditableText path="couple.partnerB.description" defaultText="A beautiful soul full of grace." as="p" className="text-sm font-sans text-[#70655B] italic leading-relaxed" />
              </div>
            </Reveal>
          </div>
        </section>

        <div className="vine-divider bg-[#FAF9F6]"></div>

        {/* 3. STORY TIMELINE */}
        {story && story.length > 0 && (
          <section id="story" className="py-24 md:py-32 px-6 bg-[#6B151E] text-[#FDFBF7] relative">
            <SectionHeading title="How Our Paths Crossed" subtitle="Our Journey" theme="dark" />
            
            <div className="max-w-4xl mx-auto mt-20 relative">
              <div className="timeline-line hidden md:block"></div>
              <div className="space-y-24">
                {story.map((item: any, i: number) => (
                  <Reveal key={item.id || i} animation="fade-up" className="relative flex flex-col md:flex-row items-center justify-between z-10 gap-8 md:gap-0">
                    <div className={`w-full md:w-5/12 ${i % 2 === 0 ? "md:text-right" : "md:order-2 md:text-left"}`}>
                      <EditableText path={`story[${i}].year`} defaultText="2022" as="p" className="font-script text-3xl text-[#D4AF37] mb-2" />
                      <EditableText path={`story[${i}].title`} defaultText="The Beginning" as="h3" className="font-serif text-2xl md:text-3xl mb-4" />
                      <EditableText path={`story[${i}].content`} defaultText="Our story began beautifully." as="p" className="font-sans text-sm font-light text-[#FDFBF7]/80 leading-relaxed" />
                    </div>
                    
                    <div className={`w-full md:w-5/12 ${i % 2 === 0 ? "md:order-2" : "md:order-1"}`}>
                      <div className="gold-frame bg-[#500F16] p-2 aspect-video overflow-hidden">
                         <EditableImage path={`story[${i}].image_url`} defaultSrc="https://images.unsplash.com/photo-1520854221256-17451cc331bf?q=80&w=2070&auto=format&fit=crop" className="w-full h-auto object-contain opacity-80 hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* 4. EVENTS SECTION */}
        {events && events.length > 0 && (
          <section id="events" className="py-24 md:py-32 px-6 bg-[#FAF9F6]">
            <SectionHeading title="Join Our Celebrations" subtitle="The Events" theme="light" />

            <div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
              {events.map((evt: any, i: number) => (
                <Reveal key={evt.id || i} animation="fade-up" delay={i * 0.2}>
                  <div className="bg-white border border-[#D4AF37]/30 shadow-lg h-full flex flex-col text-center">
                    <div className="aspect-[4/3] w-full overflow-hidden border-b border-[#D4AF37]/30 relative">
                       <EditableImage path={`events[${i}].image_url`} defaultSrc="https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070&auto=format&fit=crop" className="w-full h-auto object-contain" />
                    </div>
                    <div className="p-8 flex-1 flex flex-col">
                      <div className="text-[#6B151E] mb-4 flex justify-center">
                        <IconRenderer icon={evt.icon || "flower"} size={32} />
                      </div>
                      <EditableText path={`events[${i}].title`} defaultText="The Ceremony" as="h3" className="font-serif text-3xl text-[#6B151E] mb-6" />
                      
                      <div className="flex flex-col gap-3 font-sans text-sm text-[#70655B] mb-6 flex-1">
                        <EditableText path={`events[${i}].date`} defaultText="20th December" as="p" className="font-semibold uppercase tracking-widest text-[#D4AF37]" />
                        <EditableText path={`events[${i}].time`} defaultText="10:30 AM" as="p" />
                        <EditableText path={`events[${i}].venue_name`} defaultText="Taj Falaknuma Palace" as="p" className="font-medium" />
                      </div>

                      <div className="h-px w-12 bg-[#D4AF37]/30 mx-auto mb-6" />
                      <EditableText path={`events[${i}].description`} defaultText="Join us for the auspicious moment." as="p" className="font-sans text-sm italic text-[#70655B]" />
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </section>
        )}

        <div className="vine-divider bg-[#FAF9F6]"></div>

        {/* 5. GALLERY */}
        {gallery?.enabled && gallery.images?.length > 0 && (
          <section id="gallery" className="py-24 md:py-32 px-6 bg-[#FAF9F6]">
            <SectionHeading title="Moments of Joy" subtitle="The Gallery" theme="light" />
            <Reveal animation="fade-up" className="mt-16">
              <div className="max-w-7xl mx-auto gold-frame bg-[#F5F0E6] p-4 md:p-8">
                <Gallery items={gallery.images.map((g: any, i: number) => ({ url: g.image_url, caption: g.alt, path: `gallery.images[${i}].image_url` }))} layout="masonry" />
              </div>
            </Reveal>
          </section>
        )}

        {/* 6. LIVESTREAM */}
        {livestream?.enabled && (
          <section id="livestream" className="py-24 px-6 bg-[#6B151E] text-center border-y border-[#D4AF37]/30">
            <div className="max-w-2xl mx-auto text-[#FDFBF7]">
              <EditableText path="livestream.title" defaultText="Bless Us From Afar" as="h2" className="font-serif text-4xl mb-6 text-[#D4AF37]" />
              <EditableText path="livestream.message" defaultText="Join our virtual ceremony." as="p" className="font-sans text-sm font-light mb-10" />
              {livestream.url && (
                <a href={livestream.url} target="_blank" rel="noopener noreferrer" className="inline-block px-12 py-4 border border-[#D4AF37] text-[#D4AF37] font-sans text-xs uppercase tracking-widest hover:bg-[#D4AF37] hover:text-[#6B151E] transition-colors">
                  Join Livestream
                </a>
              )}
            </div>
          </section>
        )}

        {/* 7. VENUE & CONTACT */}
        {(venue?.enabled || contact?.enabled) && (
          <section id="venue" className="py-24 md:py-32 px-6 bg-[#FAF9F6]">
            <SectionHeading title="Where & When" subtitle="Location & Contact" theme="light" />

            <div className="max-w-5xl mx-auto mt-16 grid md:grid-cols-2 gap-12">
              {venue?.enabled && (
                <Reveal animation="fade-right">
                  <div className="gold-frame bg-white h-full p-8 flex flex-col text-center">
                    <EditableImage path="venue.image_url" defaultSrc="https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070&auto=format&fit=crop" className="w-full aspect-video object-contain mb-8" />
                    <EditableText path="venue.name" defaultText="Taj Falaknuma Palace" as="h3" className="font-serif text-3xl text-[#6B151E] mb-4" />
                    <EditableText path="venue.address" defaultText="Engine Bowli, Hyderabad" as="p" className="font-sans text-[#70655B] whitespace-pre-wrap leading-loose mb-8 flex-1" />
                    <div className="flex gap-4 justify-center">
                      {venue.map_query && <a href={`https://maps.google.com/?q=${encodeURIComponent(venue.map_query)}`} target="_blank" rel="noopener noreferrer" className="text-xs uppercase tracking-widest text-[#D4AF37] hover:text-[#6B151E] font-semibold border-b border-[#D4AF37] pb-1">Map</a>}
                    </div>
                  </div>
                </Reveal>
              )}
              {contact?.enabled && (
                <Reveal animation="fade-left">
                  <div className="gold-frame bg-[#6B151E] h-full p-8 flex flex-col text-center text-[#FDFBF7] justify-center items-center gap-6">
                    <Typography variant="decorative" className="text-[#D4AF37] text-4xl mb-4">Contact Us</Typography>
                    <div className="font-sans text-sm tracking-widest uppercase flex flex-col gap-4">
                      <EditableText path="contact.phone" defaultText="+91 98765 43210" as="p" />
                      <EditableText path="contact.email" defaultText="weddings@royal.com" as="p" />
                    </div>
                  </div>
                </Reveal>
              )}
            </div>
          </section>
        )}

        {/* 8. RSVP */}
        {rsvp?.enabled && (
          <section id="rsvp" className="py-32 px-6 bg-[#6B151E] text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[#500F16]/50"></div>
            <Reveal animation="fade-up" className="relative z-10 max-w-2xl mx-auto text-[#FDFBF7]">
              <EditableText path="rsvp.title" defaultText="Your Presence" as="h2" className="font-serif text-6xl md:text-7xl mb-8 text-[#D4AF37]" />
              <EditableText path="rsvp.deadline" defaultText="Kindly RSVP by 1st December" as="p" className="font-sans text-xs uppercase tracking-[0.4em] mb-12 opacity-80" />
              <button onClick={() => setShowRsvp(true)} className="px-12 py-4 bg-[#D4AF37] text-[#6B151E] font-sans text-xs uppercase font-bold tracking-widest hover:bg-[#FDFBF7] transition-colors">
                Confirm Attendance
              </button>
            </Reveal>
          </section>
        )}

        {/* 9. FOOTER */}
        {footer?.enabled && (
          <section id="footer" className="py-24 px-6 text-center bg-[#FAF9F6] border-t border-[#D4AF37]/30">
            <Reveal animation="fade-up">
              <EditableText path="footer.initials" defaultText="S & P" as="h2" className="font-script text-6xl mb-6 text-[#6B151E]" />
              <EditableText path="footer.text" defaultText="With love and blessings." as="p" className="font-sans text-xs uppercase tracking-widest text-[#70655B]" />
            </Reveal>
          </section>
        )}
      </div>
      
      <RsvpModal isOpen={showRsvp} onClose={() => setShowRsvp(false)} invitationId={invitationId || ''} theme="light" />
    </div>
  );
}

