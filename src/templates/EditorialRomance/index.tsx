import React, { useState } from "react";
import { IconRenderer } from "../../components/IconRenderer";
import { EditableText, EditableImage } from "../../components/builder";
import {
  Reveal,
  BackgroundVideo,
  HeroMedia,
  BackgroundAudio,
  Gallery,
  RsvpModal,
} from "../../components/premium";

export interface EditorialRomanceProps {
  data: any;
  invitationId?: string;
}

export default function EditorialRomance({ data, invitationId }: EditorialRomanceProps) {
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
    <div className="bg-[#FAF9F6] text-[#1A1A1A] min-h-screen">
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Inter:wght@300;400;500;600&display=swap');
        
        .editorial-theme {
          --color-bg: #FAF9F6;
          --color-text: #1A1A1A;
          --color-muted: #8E8B85;
          --color-accent: #E5E0D8;
        }

        .editorial-theme .font-display { 
          font-family: 'Playfair Display', serif; 
        }
        
        .editorial-theme .font-body { 
          font-family: 'Inter', sans-serif; 
        }

        .editorial-theme .text-eyebrow {
          font-family: 'Inter', sans-serif;
          text-transform: uppercase;
          letter-spacing: 0.3em;
          font-size: 0.65rem;
          font-weight: 500;
          color: var(--color-muted);
        }
        
        .editorial-theme .vertical-text {
          writing-mode: vertical-rl;
          transform: rotate(180deg);
        }
      `,
        }}
      />

      <div className="editorial-theme font-body selection:bg-[#1A1A1A] selection:text-white">
        <BackgroundAudio src={hero?.audio_url} autoPlay position="bottom-left" />

        {/* 1. HERO SECTION */}
        <section id="hero" className="relative min-h-[100svh] flex flex-col justify-between overflow-hidden bg-[#1A1A1A]">
          <HeroMedia
            type={hero?.video_url ? 'video' : 'image'}
            src={hero?.video_url || hero?.image_url}
            fallbackSrc="https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070&auto=format&fit=crop"
            overlay="bg-black/40"
          />

          <div className="relative z-20 w-full p-6 md:p-12 flex justify-between items-start">
            <Reveal animation="fade" delay={0.2}>
              <EditableText path="hero.subtitle" defaultText="THE WEDDING" className="text-eyebrow text-white/70" as="div" />
            </Reveal>
            <Reveal animation="fade" delay={0.4}>
              <div className="text-right">
                <EditableText path="hero.title" defaultText="12.10.2026" className="text-eyebrow text-white/70" as="div" />
                {hero?.auspicious_time && (
                  <EditableText path="hero.auspicious_time" defaultText="Muhurtham 10:30 AM" className="text-eyebrow text-white/50 mt-2 block" as="div" />
                )}
              </div>
            </Reveal>
          </div>

          <div className="relative z-20 px-6 md:px-12 pb-16 md:pb-24 max-w-7xl mx-auto w-full">
            <Reveal animation="fade-up" delay={0.6} duration={1.5} className="flex flex-col">
              <div className="font-display text-[#FAF9F6] text-6xl md:text-8xl lg:text-[10rem] leading-[0.85] tracking-tight uppercase">
                <EditableText path="couple.partnerA.name" defaultText="Arjun" className="block text-left" />
              </div>
              <div className="font-display text-[#FAF9F6]/50 text-4xl md:text-6xl lg:text-8xl italic leading-none my-2 ml-12 md:ml-32">
                &
              </div>
              <div className="font-display text-[#FAF9F6] text-6xl md:text-8xl lg:text-[10rem] leading-[0.85] tracking-tight uppercase text-right">
                <EditableText path="couple.partnerB.name" defaultText="Priya" className="block" />
              </div>
            </Reveal>
          </div>

          <Reveal animation="fade" delay={2} duration={2} className="absolute bottom-6 left-6 z-20 hidden md:block">
            <div className="text-eyebrow text-white/50 animate-pulse flex flex-col items-center gap-4">
              <span className="vertical-text">SCROLL</span>
              <span className="w-px h-12 bg-white/30"></span>
            </div>
          </Reveal>
        </section>

        {/* 2. COUPLE SECTION */}
        <section id="couple" className="py-24 md:py-32 px-6 md:px-12 bg-[#FAF9F6]">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-16 items-center">
              <Reveal animation="fade-up" duration={1.2} className="md:col-span-7 aspect-[3/4] md:aspect-[4/5] overflow-hidden relative">
                <EditableImage path="couple.partnerB.image_url" defaultSrc="https://images.unsplash.com/photo-1546804784-816d920ffa1d?q=80&w=800&auto=format&fit=crop" className="w-full h-auto object-contain grayscale hover:grayscale-0 transition-all duration-1000" />
              </Reveal>

              <div className="md:col-span-5 flex flex-col justify-center h-full pt-12 md:pt-0">
                <Reveal animation="fade-up" delay={0.2}>
                  <div className="text-eyebrow mb-6">THE BRIDE & GROOM</div>
                  <h2 className="font-display text-4xl md:text-6xl text-[#1A1A1A] leading-tight mb-8">
                    Two souls <br /><span className="italic text-[#8E8B85]">intertwined</span>.
                  </h2>
                </Reveal>

                <Reveal animation="fade-up" delay={0.4} className="ml-auto w-3/4 aspect-square overflow-hidden mb-8 hidden md:block">
                  <EditableImage path="couple.partnerA.image_url" defaultSrc="https://images.unsplash.com/photo-1520854221256-17451cc331bf?q=80&w=800&auto=format&fit=crop" className="w-full h-auto object-contain" />
                </Reveal>

                <Reveal animation="fade-up" delay={0.6} className="space-y-6">
                  <div>
                    <EditableText path="couple.partnerB.name" defaultText="Priya Sharma" as="h3" className="font-display text-2xl uppercase tracking-widest mb-1" />
                    <EditableText path="couple.partnerB.role" defaultText="Bride" as="p" className="text-eyebrow mb-1" />
                    <EditableText path="couple.partnerB.parents" defaultText="Daughter of Mr. & Mrs. Sharma" as="p" className="text-xs text-[#8E8B85] font-light mb-2" />
                    <EditableText path="couple.partnerB.description" defaultText="An eye for architecture and a heart for timeless romance." as="p" className="text-xs text-[#8E8B85] font-light italic" />
                  </div>
                  <div>
                    <EditableText path="couple.partnerA.name" defaultText="Arjun Verma" as="h3" className="font-display text-2xl uppercase tracking-widest mb-1" />
                    <EditableText path="couple.partnerA.role" defaultText="Groom" as="p" className="text-eyebrow mb-1" />
                    <EditableText path="couple.partnerA.parents" defaultText="Son of Mr. & Mrs. Verma" as="p" className="text-xs text-[#8E8B85] font-light mb-2" />
                    <EditableText path="couple.partnerA.description" defaultText="Quietly confident. Prefers a martini over champagne." as="p" className="text-xs text-[#8E8B85] font-light italic" />
                  </div>
                </Reveal>
              </div>
            </div>
          </div>
        </section>

        {/* 3. STORY TIMELINE */}
        {story && story.length > 0 && (
          <section id="story" className="py-24 md:py-32 px-6 md:px-12 bg-[#1A1A1A] text-[#FAF9F6]">
             <div className="max-w-7xl mx-auto">
               <Reveal animation="fade-up" className="mb-20 md:mb-32">
                 <div className="text-eyebrow text-white/50 mb-4">CHAPTERS</div>
                 <h2 className="font-display text-5xl md:text-7xl leading-tight">Our <span className="italic text-white/50">History</span></h2>
               </Reveal>

               <div className="space-y-24 md:space-y-40">
                 {story.map((item: any, i: number) => (
                   <Reveal key={item.id || i} animation="fade-up" className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-16 items-center">
                     <div className={`md:col-span-6 ${i % 2 === 1 ? 'md:order-2' : ''}`}>
                       <div className="aspect-[4/3] overflow-hidden">
                         <EditableImage path={`story[${i}].image_url`} defaultSrc="https://images.unsplash.com/photo-1522673607200-164d1b6ce486?q=80&w=2070&auto=format&fit=crop" className="w-full h-auto object-contain grayscale opacity-80" />
                       </div>
                     </div>
                     <div className={`md:col-span-5 ${i % 2 === 1 ? 'md:order-1 md:col-start-2' : 'md:col-start-8'}`}>
                       <EditableText path={`story[${i}].year`} defaultText="2021" as="p" className="text-eyebrow text-white/50 mb-4" />
                       <EditableText path={`story[${i}].title`} defaultText="The Meeting" as="h3" className="font-display text-3xl md:text-4xl mb-6" />
                       <EditableText path={`story[${i}].content`} defaultText="A beautiful moment captured in time." as="p" className="text-sm font-light text-white/70 leading-relaxed" />
                     </div>
                   </Reveal>
                 ))}
               </div>
             </div>
          </section>
        )}

        {/* 4. EVENTS */}
        {events && events.length > 0 && (
          <section id="events" className="py-24 md:py-32 px-6 md:px-12 bg-[#FAF9F6]">
            <div className="max-w-7xl mx-auto">
              <Reveal animation="fade-up" className="mb-16 md:mb-24 flex flex-col md:flex-row md:items-end justify-between border-b border-[#1A1A1A]/10 pb-8">
                <div>
                  <div className="text-eyebrow mb-4">THE ITINERARY</div>
                  <h2 className="font-display text-5xl md:text-7xl leading-tight">Weekend <span className="italic text-[#8E8B85]">Events</span></h2>
                </div>
              </Reveal>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-x-24 md:gap-y-32">
                {events.map((evt: any, i: number) => (
                  <Reveal key={evt.id || i} animation="fade-up" delay={i % 2 === 0 ? 0 : 0.2} className="flex flex-col">
                    <div className="aspect-[4/5] overflow-hidden mb-8">
                       <EditableImage path={`events[${i}].image_url`} defaultSrc="https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070&auto=format&fit=crop" className="w-full h-auto object-contain grayscale hover:grayscale-0 transition-all duration-700" />
                    </div>
                    
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <div className="text-[#1A1A1A] mb-4">
                          <IconRenderer icon={evt.icon || "clock"} size={24} />
                        </div>
                        <EditableText path={`events[${i}].title`} defaultText="The Ceremony" as="h3" className="font-display text-3xl mb-2" />
                        <EditableText path={`events[${i}].venue_name`} defaultText="Grand Hall" as="p" className="text-sm italic text-[#8E8B85]" />
                      </div>
                      <div className="text-right">
                        <EditableText path={`events[${i}].date`} defaultText="Sat, Oct 24" as="p" className="text-eyebrow" />
                        <EditableText path={`events[${i}].time`} defaultText="4:00 PM" as="p" className="font-display text-xl" />
                      </div>
                    </div>
                    
                    <EditableText path={`events[${i}].description`} defaultText="Join us for a beautiful ceremony." as="p" className="text-sm font-light text-[#8E8B85] leading-relaxed border-t border-[#1A1A1A]/10 pt-6" />
                  </Reveal>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* 5. GALLERY */}
        {gallery?.enabled && gallery.images?.length > 0 && (
          <section id="gallery" className="py-24 md:py-32 px-6 md:px-12 bg-[#1A1A1A] text-[#FAF9F6]">
            <div className="max-w-7xl mx-auto">
              <Reveal animation="fade-up" className="mb-16">
                <div className="text-eyebrow text-white/50 mb-4">MEMORIES</div>
                <h2 className="font-display text-4xl md:text-6xl">The <span className="italic text-white/50">Gallery</span></h2>
              </Reveal>
              <Reveal animation="fade-up" delay={0.2}>
                <Gallery items={gallery.images.map((g: any, i: number) => ({ url: g.image_url, caption: g.alt, path: `gallery.images[${i}].image_url` }))} layout="masonry" />
              </Reveal>
            </div>
          </section>
        )}

        {/* 6. LIVESTREAM */}
        {livestream?.enabled && (
          <section id="livestream" className="py-24 px-6 bg-[#FAF9F6] border-y border-[#1A1A1A]/10 text-center">
            <div className="max-w-2xl mx-auto">
              <div className="text-eyebrow mb-6">VIRTUAL ATTENDANCE</div>
              <EditableText path="livestream.title" defaultText="Join us Live" as="h2" className="font-display text-4xl mb-6" />
              <EditableText path="livestream.message" defaultText="For those who cannot make it, we invite you to join us virtually." as="p" className="text-sm text-[#8E8B85] font-light mb-8" />
              {livestream.url && (
                <a href={livestream.url} target="_blank" rel="noopener noreferrer" className="inline-block px-10 py-4 bg-[#1A1A1A] text-white text-xs uppercase tracking-widest font-medium hover:bg-[#8E8B85] transition-colors">
                  Open Livestream
                </a>
              )}
            </div>
          </section>
        )}

        {/* 7. VENUE & CONTACT */}
        {(venue?.enabled || contact?.enabled) && (
          <section id="venue" className="py-24 md:py-32 px-6 md:px-12 bg-[#FAF9F6]">
            <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 md:gap-24 items-center">
              {venue?.enabled && (
                <Reveal animation="fade-up">
                  <div className="text-eyebrow mb-6">THE LOCATION</div>
                  <EditableText path="venue.name" defaultText="The Rosewood Hotel" as="h3" className="font-display text-4xl md:text-5xl mb-6" />
                  <EditableText path="venue.address" defaultText="London, UK" as="p" className="text-sm font-light text-[#8E8B85] whitespace-pre-wrap leading-relaxed mb-8" />
                  
                  <div className="aspect-[4/3] w-full overflow-hidden mb-8">
                    <EditableImage path="venue.image_url" defaultSrc="https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070&auto=format&fit=crop" className="w-full h-auto object-contain grayscale" />
                  </div>
                  
                  <div className="flex gap-6">
                    {venue.map_query && (
                      <a href={`https://maps.google.com/?q=${encodeURIComponent(venue.map_query)}`} target="_blank" rel="noopener noreferrer" className="text-xs uppercase tracking-widest border-b border-[#1A1A1A] pb-1 hover:text-[#8E8B85] transition-colors">
                        View Map
                      </a>
                    )}
                  </div>
                </Reveal>
              )}
              
              {contact?.enabled && (
                <Reveal animation="fade-up" delay={0.2} className="bg-[#E5E0D8] p-12 h-full flex flex-col justify-center">
                  <div className="text-eyebrow mb-6 text-[#1A1A1A]/60">INQUIRIES</div>
                  <h3 className="font-display text-3xl mb-8">Contact</h3>
                  <div className="space-y-6 text-sm font-light">
                    <div>
                      <span className="block text-xs uppercase tracking-widest text-[#1A1A1A]/50 mb-1">Phone</span>
                      <EditableText path="contact.phone" defaultText="+1 234 567 890" as="p" />
                    </div>
                    <div>
                      <span className="block text-xs uppercase tracking-widest text-[#1A1A1A]/50 mb-1">Email</span>
                      <EditableText path="contact.email" defaultText="hello@couple.com" as="p" />
                    </div>
                  </div>
                </Reveal>
              )}
            </div>
          </section>
        )}

        {/* 8. RSVP */}
        {rsvp?.enabled && (
          <section id="rsvp" className="py-32 md:py-48 px-6 bg-[#1A1A1A] text-[#FAF9F6] text-center">
            <Reveal animation="fade-up" className="max-w-2xl mx-auto">
              <div className="text-eyebrow text-white/50 mb-8">ATTENDANCE</div>
              <EditableText path="rsvp.title" defaultText="RSVP" as="h2" className="font-display text-6xl md:text-8xl mb-8" />
              <EditableText path="rsvp.deadline" defaultText="Please respond by October 1st" as="p" className="text-sm font-light text-white/70 mb-12" />
              <button onClick={() => setShowRsvp(true)} className="px-12 py-5 bg-white text-[#1A1A1A] text-xs uppercase tracking-widest font-medium hover:bg-[#E5E0D8] transition-colors">
                Submit Reply
              </button>
            </Reveal>
          </section>
        )}

        {/* 9. FOOTER */}
        {footer?.enabled && (
          <section id="footer" className="py-24 px-6 bg-[#FAF9F6] text-center">
            <Reveal animation="fade-up">
              <EditableText path="footer.initials" defaultText="S & P" as="h2" className="font-display text-4xl mb-6 italic" />
              <EditableText path="footer.text" defaultText="The End." as="p" className="text-eyebrow" />
            </Reveal>
          </section>
        )}
      </div>

      <RsvpModal isOpen={showRsvp} onClose={() => setShowRsvp(false)} invitationId={invitationId || ''} theme="light" />
    </div>
  );
}

