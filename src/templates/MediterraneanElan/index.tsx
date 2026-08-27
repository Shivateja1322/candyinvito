import React, { useState, useEffect } from "react";
import { IconRenderer } from "../../components/IconRenderer";
import { EditableText, EditableImage } from "../../components/builder";
import {
  Reveal,
  HeroMedia,
  Gallery,
  BackgroundAudio,
  RsvpModal,
} from "../../components/premium";

export interface MediterraneanElanProps {
  data: any;
  invitationId?: string;
}

export default function MediterraneanElan({ data, invitationId }: MediterraneanElanProps) {
  const [showRsvp, setShowRsvp] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
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

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="mediterranean-theme bg-[#F3EEE5] text-[#252321] min-h-screen selection:bg-[#183746]/20 selection:text-[#183746] overflow-x-hidden">
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @import url('https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Manrope:wght@300;400;500;600&display=swap');
        
        .mediterranean-theme {
          font-family: 'Manrope', sans-serif;
        }
        
        .mediterranean-theme .font-display {
          font-family: 'Libre Baskerville', serif;
        }

        html {
          scroll-behavior: smooth;
        }
        
        .wave-divider {
          width: 100%;
          height: 30px;
          background: url('data:image/svg+xml;utf8,<svg viewBox="0 0 120 28" xmlns="http://www.w3.org/2000/svg"><path d="M0 14c20 0 40-14 60-14s40 14 60 14 40-14 60-14 40 14 60 14v14H0V14z" fill="%23183746" opacity="0.05"/></svg>') repeat-x;
        }
      `,
        }}
      />

      <BackgroundAudio src={hero?.audio_url} autoPlay position="bottom-right" />

      {/* NAVIGATION */}
      <nav
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-700 pointer-events-none ${scrolled ? "bg-[#FCFAF5]/90 backdrop-blur-md py-4 shadow-sm border-b border-[#DED2C0]/50 text-[#183746]" : "bg-transparent py-8 text-[#FCFAF5]"}`}
      >
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center pointer-events-auto">
          <div className="font-display tracking-[0.1em] text-lg md:text-xl">
             <EditableText path="couple.partnerA.name" defaultText="C" as="span" /> & <EditableText path="couple.partnerB.name" defaultText="E" as="span" />
          </div>
          <div className="hidden md:flex gap-12 text-xs uppercase tracking-[0.2em] font-medium">
            <a href="#story" className="hover:text-[#A66A52] transition-colors">Our Story</a>
            <a href="#events" className="hover:text-[#A66A52] transition-colors">Itinerary</a>
            <a href="#gallery" className="hover:text-[#A66A52] transition-colors">Gallery</a>
            <a href="#venue" className="hover:text-[#A66A52] transition-colors">Venue</a>
          </div>
          <div className="md:hidden font-sans uppercase tracking-[0.2em] text-xs">Menu</div>
        </div>
      </nav>

      {/* 1. HERO SECTION */}
      <section id="hero" className="relative h-[100svh] w-full bg-[#183746] overflow-hidden flex flex-col justify-center items-center">
        <div className="absolute inset-0 w-full h-full opacity-90">
          <HeroMedia
            type={hero?.video_url ? 'video' : 'image'}
            src={hero?.video_url || hero?.image_url}
            fallbackSrc="https://images.unsplash.com/photo-1533256059153-277d34509cc1?q=80&w=2070&auto=format&fit=crop"
            overlay="bg-black/30"
          />
        </div>

        <div className="relative z-10 text-center px-6 text-[#FCFAF5] max-w-4xl w-full">
          <Reveal animation="fade-up" duration={1.5}>
            <EditableText path="hero.subtitle" defaultText="JOIN US IN CELEBRATING" as="p" className="text-xs md:text-sm font-sans uppercase tracking-[0.3em] md:tracking-[0.5em] mb-12 opacity-90 font-medium text-[#DED2C0]" />
          </Reveal>
          
          <Reveal animation="fade-up" duration={1.5} delay={0.4}>
            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl mb-8 leading-tight">
               <EditableText path="couple.partnerA.name" defaultText="Chloe" className="block" />
               <span className="block italic text-[#A66A52] font-display text-4xl md:text-5xl my-4">&</span>
               <EditableText path="couple.partnerB.name" defaultText="Elias" className="block" />
            </h1>
          </Reveal>

          <Reveal animation="fade-up" duration={1.5} delay={0.8}>
            <EditableText path="hero.title" defaultText="September 10th, 2026" as="p" className="text-sm md:text-base font-display italic mt-12 mb-4" />
            {hero?.auspicious_time && (
              <EditableText path="hero.auspicious_time" defaultText="Muhurtham: 10:30 AM" as="p" className="text-xs md:text-sm uppercase tracking-widest mt-4 text-[#DED2C0]" />
            )}
            <div className="w-16 h-px bg-[#A66A52] mx-auto mt-6"></div>
          </Reveal>
        </div>
      </section>

      {/* 2. COUPLE SECTION */}
      <section id="couple" className="py-24 md:py-40 px-6 bg-[#FCFAF5]">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 md:gap-24 items-center">
          <Reveal animation="fade-right" className="flex flex-col items-center md:items-start text-center md:text-left">
            <div className="w-full max-w-[400px] aspect-[4/5] overflow-hidden mb-10 shadow-lg relative rounded-br-[80px] rounded-tl-[80px]">
               <EditableImage path="couple.partnerA.image_url" defaultSrc="https://images.unsplash.com/photo-1546804784-816d920ffa1d?q=80&w=800&auto=format&fit=crop" className="w-full h-auto object-contain" />
            </div>
            <EditableText path="couple.partnerA.role" defaultText="The Bride" as="p" className="text-[#A66A52] text-xs uppercase tracking-widest font-semibold mb-3" />
            <EditableText path="couple.partnerA.name" defaultText="Chloe Grace" as="h3" className="font-display text-3xl text-[#183746] mb-3" />
            <EditableText path="couple.partnerA.parents" defaultText="Daughter of Mark & Lisa Grace" as="p" className="text-sm text-[#252321]/60 italic mb-4" />
            <EditableText path="couple.partnerA.description" defaultText="A lover of ocean breezes and late-night conversations." as="p" className="text-sm font-light text-[#252321]/80 leading-relaxed max-w-sm" />
          </Reveal>

          <Reveal animation="fade-left" delay={0.2} className="flex flex-col items-center md:items-start text-center md:text-left md:mt-32">
            <div className="w-full max-w-[400px] aspect-[4/5] overflow-hidden mb-10 shadow-lg relative rounded-bl-[80px] rounded-tr-[80px]">
               <EditableImage path="couple.partnerB.image_url" defaultSrc="https://images.unsplash.com/photo-1520854221256-17451cc331bf?q=80&w=800&auto=format&fit=crop" className="w-full h-auto object-contain" />
            </div>
            <EditableText path="couple.partnerB.role" defaultText="The Groom" as="p" className="text-[#A66A52] text-xs uppercase tracking-widest font-semibold mb-3" />
            <EditableText path="couple.partnerB.name" defaultText="Elias Thorne" as="h3" className="font-display text-3xl text-[#183746] mb-3" />
            <EditableText path="couple.partnerB.parents" defaultText="Son of David & Elena Thorne" as="p" className="text-sm text-[#252321]/60 italic mb-4" />
            <EditableText path="couple.partnerB.description" defaultText="Always seeking the next adventure along the coast." as="p" className="text-sm font-light text-[#252321]/80 leading-relaxed max-w-sm" />
          </Reveal>
        </div>
      </section>

      {/* 3. STORY TIMELINE */}
      {story && story.length > 0 && (
        <section id="story" className="py-24 md:py-40 px-6 bg-[#183746] text-[#FCFAF5]">
          <div className="max-w-5xl mx-auto">
            <Reveal animation="fade-up" className="text-center mb-24">
              <h2 className="font-display text-4xl md:text-5xl mb-6">Our Journey</h2>
              <div className="w-16 h-px bg-[#A66A52] mx-auto"></div>
            </Reveal>

            <div className="space-y-32">
              {story.map((item: any, i: number) => (
                <Reveal key={item.id || i} animation="fade-up" className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">
                  <div className={`${i % 2 === 1 ? 'md:order-2' : ''}`}>
                    <div className="aspect-[4/3] overflow-hidden shadow-2xl rounded-tr-[60px] rounded-bl-[60px]">
                       <EditableImage path={`story[${i}].image_url`} defaultSrc="https://images.unsplash.com/photo-1522673607200-164d1b6ce486?q=80&w=2070&auto=format&fit=crop" className="w-full h-auto object-contain opacity-90" />
                    </div>
                  </div>
                  <div className={`flex flex-col justify-center ${i % 2 === 1 ? 'md:order-1 text-left md:text-right md:items-end' : 'text-left md:items-start'}`}>
                    <EditableText path={`story[${i}].year`} defaultText="2022" as="p" className="font-display text-[#DED2C0] text-3xl mb-4" />
                    <EditableText path={`story[${i}].title`} defaultText="A Chance Encounter" as="h3" className="font-sans text-xl uppercase tracking-widest mb-6" />
                    <EditableText path={`story[${i}].content`} defaultText="We met under the Mediterranean sun." as="p" className="font-light text-[#FCFAF5]/80 leading-relaxed" />
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 4. EVENTS SECTION */}
      {events && events.length > 0 && (
        <section id="events" className="py-24 md:py-40 px-6 bg-[#F3EEE5] relative">
          <div className="wave-divider absolute top-0 left-0"></div>
          <div className="max-w-7xl mx-auto pt-12">
            <Reveal animation="fade-up" className="text-center mb-20 md:mb-32">
              <h2 className="font-display text-4xl md:text-5xl text-[#183746] mb-6">The Itinerary</h2>
              <p className="text-sm font-sans uppercase tracking-[0.2em] text-[#A66A52]">Join us for the weekend</p>
            </Reveal>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
              {events.map((evt: any, i: number) => (
                <Reveal key={evt.id || i} animation="fade-up" delay={i * 0.1}>
                  <div className="bg-[#FCFAF5] shadow-lg flex flex-col text-center border-t-8 border-[#183746] h-full transition-transform hover:-translate-y-2">
                    <div className="p-8 md:p-12 flex-1 flex flex-col">
                      <div className="text-[#A66A52] mb-6 flex justify-center">
                        <IconRenderer icon={evt.icon || "sun"} size={32} />
                      </div>
                      <EditableText path={`events[${i}].title`} defaultText="Welcome Dinner" as="h3" className="font-display text-2xl text-[#183746] mb-2" />
                      <div className="h-px w-12 bg-[#DED2C0] mx-auto my-4" />
                      
                      <EditableText path={`events[${i}].date`} defaultText="Sept 10" as="p" className="font-sans text-xs uppercase tracking-[0.2em] text-[#183746] font-semibold mb-2" />
                      <EditableText path={`events[${i}].time`} defaultText="7:00 PM" as="p" className="font-sans text-[#252321] mb-2" />
                      <EditableText path={`events[${i}].venue_name`} defaultText="The Terrace" as="p" className="font-sans font-medium text-[#183746] mb-6" />
                      
                      <EditableText path={`events[${i}].description`} defaultText="Join us for drinks and sunset views." as="p" className="font-light text-[#252321]/70 italic text-sm flex-1" />
                    </div>
                    
                    <div className="aspect-[21/9] w-full overflow-hidden border-t border-[#DED2C0]/30">
                       <EditableImage path={`events[${i}].image_url`} defaultSrc="https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070&auto=format&fit=crop" className="w-full h-auto object-contain opacity-90" />
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 5. GALLERY */}
      {gallery?.enabled && gallery.images?.length > 0 && (
        <section id="gallery" className="py-24 md:py-40 px-6 bg-[#183746] text-[#FCFAF5]">
          <div className="max-w-7xl mx-auto">
            <Reveal animation="fade-up" className="text-center mb-16 md:mb-24">
              <h2 className="font-display text-4xl md:text-5xl mb-6">Moments</h2>
              <div className="w-16 h-px bg-[#A66A52] mx-auto"></div>
            </Reveal>
            <Reveal animation="fade-up" delay={0.2}>
              <Gallery items={gallery.images.map((g: any, i: number) => ({ url: g.image_url, caption: g.alt, path: `gallery.images[${i}].image_url` }))} layout="masonry" />
            </Reveal>
          </div>
        </section>
      )}

      {/* 6. LIVESTREAM */}
      {livestream?.enabled && (
        <section id="livestream" className="py-24 px-6 bg-[#A66A52] text-[#FCFAF5] text-center shadow-inner">
          <div className="max-w-2xl mx-auto">
            <EditableText path="livestream.title" defaultText="Celebrate with us Online" as="h2" className="font-display text-3xl md:text-4xl mb-6" />
            <EditableText path="livestream.message" defaultText="We would love for you to join us virtually." as="p" className="text-[#FCFAF5]/90 mb-10 font-light" />
            {livestream.url && (
              <a href={livestream.url} target="_blank" rel="noopener noreferrer" className="inline-block px-12 py-4 bg-[#FCFAF5] text-[#A66A52] text-xs uppercase tracking-[0.2em] font-bold hover:bg-[#183746] hover:text-[#FCFAF5] transition-colors rounded-sm shadow-md">
                View Livestream
              </a>
            )}
          </div>
        </section>
      )}

      {/* 7. VENUE & CONTACT */}
      {(venue?.enabled || contact?.enabled) && (
        <section id="venue" className="py-24 md:py-40 px-6 bg-[#FCFAF5]">
          <div className="max-w-6xl mx-auto">
            <Reveal animation="fade-up" className="text-center mb-20">
              <h2 className="font-display text-4xl md:text-5xl text-[#183746] mb-6">Location</h2>
              <div className="w-16 h-px bg-[#A66A52] mx-auto"></div>
            </Reveal>

            <div className="grid md:grid-cols-2 gap-16 md:gap-24 items-center">
              {venue?.enabled && (
                <Reveal animation="fade-right">
                  <div className="aspect-square w-full rounded-tr-[100px] rounded-bl-[100px] overflow-hidden shadow-2xl">
                    <EditableImage path="venue.image_url" defaultSrc="https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070&auto=format&fit=crop" className="w-full h-auto object-contain" />
                  </div>
                </Reveal>
              )}
              
              <Reveal animation="fade-left" className="flex flex-col justify-center text-center md:text-left">
                {venue?.enabled && (
                  <div className="mb-12">
                    <EditableText path="venue.name" defaultText="Villa Cimbrone" as="h3" className="font-display text-3xl text-[#183746] mb-4" />
                    <EditableText path="venue.address" defaultText="Ravello, Amalfi Coast, Italy" as="p" className="text-[#252321]/70 whitespace-pre-wrap leading-relaxed mb-6 font-light" />
                    <div className="flex gap-6 justify-center md:justify-start">
                      {venue.map_query && <a href={`https://maps.google.com/?q=${encodeURIComponent(venue.map_query)}`} target="_blank" rel="noopener noreferrer" className="text-xs uppercase tracking-widest text-[#A66A52] hover:text-[#183746] border-b border-[#A66A52] pb-1 font-semibold">Map</a>}
                    </div>
                  </div>
                )}
                
                {contact?.enabled && (
                  <div className="bg-[#F3EEE5] p-8 border-l-4 border-[#183746] text-left">
                    <h4 className="font-display text-2xl text-[#183746] mb-6">Concierge</h4>
                    <div className="space-y-4">
                      <div>
                        <span className="block text-[10px] uppercase tracking-widest text-[#252321]/50 mb-1">Phone</span>
                        <EditableText path="contact.phone" defaultText="+39 123 456 7890" as="p" className="text-[#252321] font-medium" />
                      </div>
                      <div>
                        <span className="block text-[10px] uppercase tracking-widest text-[#252321]/50 mb-1">Email</span>
                        <EditableText path="contact.email" defaultText="ciao@couple.com" as="p" className="text-[#252321] font-medium" />
                      </div>
                    </div>
                  </div>
                )}
              </Reveal>
            </div>
          </div>
        </section>
      )}

      {/* 8. RSVP */}
      {rsvp?.enabled && (
        <section id="rsvp" className="py-32 md:py-48 px-6 bg-[#183746] text-[#FCFAF5] text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10 mix-blend-overlay"></div>
          <Reveal animation="fade-up" className="relative z-10 max-w-2xl mx-auto">
            <EditableText path="rsvp.title" defaultText="Repondez S'il Vous Plait" as="h2" className="font-display text-4xl md:text-6xl mb-8" />
            <EditableText path="rsvp.deadline" defaultText="Please respond by August 15" as="p" className="font-sans text-xs md:text-sm uppercase tracking-[0.2em] mb-12 text-[#DED2C0]" />
            <button onClick={() => setShowRsvp(true)} className="px-16 py-5 bg-[#A66A52] text-[#FCFAF5] text-xs uppercase tracking-[0.2em] font-semibold hover:bg-[#FCFAF5] hover:text-[#183746] transition-colors shadow-lg">
              RSVP Now
            </button>
          </Reveal>
        </section>
      )}

      {/* 9. FOOTER */}
      {footer?.enabled && (
        <section id="footer" className="py-24 px-6 bg-[#F3EEE5] text-center border-t border-[#DED2C0]/50">
          <Reveal animation="fade-up">
            <EditableText path="footer.initials" defaultText="C & E" as="h2" className="font-display text-4xl mb-6 text-[#183746]" />
            <div className="w-8 h-px bg-[#A66A52] mx-auto mb-6"></div>
            <EditableText path="footer.text" defaultText="Amore Mio." as="p" className="font-sans text-[10px] uppercase tracking-[0.3em] text-[#252321]/60" />
          </Reveal>
        </section>
      )}

      <RsvpModal isOpen={showRsvp} onClose={() => setShowRsvp(false)} invitationId={invitationId || ''} theme="light" />
    </div>
  );
}

