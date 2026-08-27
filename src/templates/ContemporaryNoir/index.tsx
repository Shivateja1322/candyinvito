import React, { useState } from "react";
import { IconRenderer } from "../../components/IconRenderer";
import { EditableText, EditableImage } from "../../components/builder";
import {
  Reveal,
  StaggerContainer,
  StaggerItem,
  HeroMedia,
  Gallery,
  BackgroundAudio,
  LocationCard,
  RsvpModal,
} from "../../components/premium";
import { Menu, X } from "lucide-react";

export interface ContemporaryNoirProps {
  data: any;
  invitationId?: string;
}

export default function ContemporaryNoir({ data, invitationId }: ContemporaryNoirProps) {
  const [showRsvp, setShowRsvp] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

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
    <div className="noir-theme bg-[#0A0A0A] text-[#F2EEE7] min-h-screen selection:bg-[#B7A27A]/30 selection:text-[#F2EEE7] overflow-x-hidden">
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @import url('https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400;0,6..96,700;1,6..96,400&family=Inter:wght@300;400;500&display=swap');
        
        .noir-theme {
          font-family: 'Inter', sans-serif;
        }
        
        .noir-theme .font-display {
          font-family: 'Bodoni Moda', serif;
        }

        html {
          scroll-behavior: smooth;
        }
      `,
        }}
      />

      <BackgroundAudio src={hero?.audio_url} autoPlay position="bottom-right" />

      {/* NAVIGATION */}
      <nav className="fixed top-0 left-0 w-full z-50 py-8 px-6 mix-blend-difference pointer-events-none">
        <div className="max-w-7xl mx-auto flex justify-between items-center pointer-events-auto">
          <EditableText
            path="couple.partnerA.name"
            defaultText="J"
            as="a"
            className="font-display italic text-2xl tracking-widest text-[#F2EEE7] hover:text-[#B7A27A] transition-colors"
          />
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-[#F2EEE7] hover:text-[#B7A27A] transition-colors p-2"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* 1. HERO SECTION */}
      <section id="hero" className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden">
        <HeroMedia
          type={hero?.video_url ? "video" : "image"}
          src={hero?.video_url || hero?.image_url}
          fallbackSrc="https://images.unsplash.com/photo-1571266028243-cb40fce7573b?q=80&w=2070&auto=format&fit=crop"
          overlay="bg-[#0A0A0A]/40"
        />

        <div className="relative z-10 w-full h-full flex flex-col justify-between py-12 md:py-16 px-6">
          <div className="w-full text-center mt-20">
            <Reveal animation="fade-up" duration={1.5}>
              <EditableText
                path="hero.subtitle"
                defaultText="THE WEDDING OF"
                as="p"
                className="font-sans font-medium text-[10px] md:text-xs tracking-[0.5em] md:tracking-[0.8em] text-[#F2EEE7]/80 uppercase"
              />
            </Reveal>
          </div>

          <div className="w-full text-center pb-20">
            <Reveal animation="fade-up" duration={1.5} delay={0.4}>
              <h1 className="font-display text-[clamp(4rem,10vw,8rem)] leading-[1.1] text-[#F2EEE7] font-light mb-4 break-words max-w-full">
                <EditableText
                  path="couple.partnerA.name"
                  defaultText="James"
                  as="span"
                />
                <span className="block font-display italic text-[#B7A27A] text-[clamp(2rem,5vw,5rem)] my-2 md:my-4">
                  &
                </span>
                <EditableText
                  path="couple.partnerB.name"
                  defaultText="Sophia"
                  as="span"
                />
              </h1>
            </Reveal>

            <Reveal animation="fade-up" duration={1.5} delay={0.8}>
              <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-12 mt-12">
                <EditableText
                  path="hero.title"
                  defaultText="OCTOBER 24, 2026"
                  as="p"
                  className="text-[10px] md:text-xs font-sans font-light uppercase tracking-[0.4em] text-[#F2EEE7]/80"
                />
                <span className="hidden md:block w-12 h-px bg-[#B7A27A]/30"></span>
                <EditableText
                  path="venue.name"
                  defaultText="THE NED, LONDON"
                  as="p"
                  className="text-[10px] md:text-xs font-sans font-light uppercase tracking-[0.4em] text-[#F2EEE7]/80"
                />
              </div>
              
              {hero?.auspicious_time && (
                 <div className="mt-8 border border-[#B7A27A]/30 p-6 inline-block">
                    <EditableText
                      path="hero.auspicious_time"
                      defaultText="Muhurtham: 10:30 AM"
                      as="p"
                      className="text-[10px] md:text-xs font-sans font-light uppercase tracking-[0.4em] text-[#B7A27A]"
                    />
                 </div>
              )}
            </Reveal>
          </div>
        </div>
      </section>

      {/* 2. COUPLE SECTION */}
      <section id="couple" className="py-32 md:py-48 px-6 bg-[#111111] relative overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-center gap-16 md:gap-24">
          <Reveal animation="fade-up" duration={1.5} className="w-full md:w-1/2 flex flex-col items-center text-center">
            <div className="w-[1px] h-24 bg-[#B7A27A]/30 mb-12"></div>
            <EditableText path="couple.partnerA.name" defaultText="James Arthur" as="h3" className="font-display text-4xl md:text-5xl mb-6 text-[#F2EEE7]" />
            <EditableText path="couple.partnerA.role" defaultText="Groom" as="p" className="font-sans font-medium text-[10px] uppercase tracking-[0.3em] text-[#B7A27A] mb-4" />
            <EditableText path="couple.partnerA.parents" defaultText="Son of John & Mary Arthur" as="p" className="font-sans font-light text-xs text-[#F2EEE7]/60 mb-6" />
            <EditableText path="couple.partnerA.description" defaultText="Quietly confident. Prefers a martini over champagne." as="p" className="font-sans font-light text-[#77736D] leading-relaxed max-w-sm" />
            <div className="mt-12 w-48 md:w-64 aspect-[3/4] relative p-2 border border-[#B7A27A]/20">
              <EditableImage path="couple.partnerA.image_url" defaultSrc="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1287&auto=format&fit=crop" className="w-full h-auto object-contain grayscale brightness-75" />
            </div>
          </Reveal>

          <Reveal animation="fade-up" duration={1.5} delay={0.4} className="w-full md:w-1/2 flex flex-col-reverse md:flex-col items-center text-center mt-16 md:mt-32">
            <div className="mt-12 md:mt-0 md:mb-12 w-48 md:w-64 aspect-[3/4] relative p-2 border border-[#B7A27A]/20">
              <EditableImage path="couple.partnerB.image_url" defaultSrc="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1364&auto=format&fit=crop" className="w-full h-auto object-contain grayscale brightness-75" />
            </div>
            <EditableText path="couple.partnerB.name" defaultText="Sophia Claire" as="h3" className="font-display text-4xl md:text-5xl mb-6 text-[#F2EEE7] mt-12 md:mt-0" />
            <EditableText path="couple.partnerB.role" defaultText="Bride" as="p" className="font-sans font-medium text-[10px] uppercase tracking-[0.3em] text-[#B7A27A] mb-4" />
            <EditableText path="couple.partnerB.parents" defaultText="Daughter of Robert & Emma Claire" as="p" className="font-sans font-light text-xs text-[#F2EEE7]/60 mb-6" />
            <EditableText path="couple.partnerB.description" defaultText="An eye for architecture and a heart for timeless romance." as="p" className="font-sans font-light text-[#77736D] leading-relaxed max-w-sm" />
            <div className="w-[1px] h-24 bg-[#B7A27A]/30 mt-12 hidden md:block"></div>
          </Reveal>
        </div>
      </section>

      {/* 3. STORY TIMELINE */}
      {story && story.length > 0 && (
        <section id="story" className="py-32 md:py-48 px-6 bg-[#0A0A0A]">
          <Reveal animation="fade-up" duration={1.2} className="text-center mb-24">
             <span className="font-display italic text-[#B7A27A] text-2xl md:text-3xl block mb-4">Chapter 01</span>
             <h2 className="font-sans font-light text-[10px] md:text-xs uppercase tracking-[0.5em] text-[#F2EEE7]">Our Story</h2>
          </Reveal>

          <div className="max-w-4xl mx-auto space-y-32">
            {story.map((item: any, i: number) => (
              <Reveal key={item.id || i} animation="fade-up" duration={1.5} className="flex flex-col md:flex-row items-center gap-12 text-center md:text-left">
                {i % 2 === 0 ? (
                  <>
                    <div className="w-full md:w-1/2">
                      <div className="aspect-[4/3] w-full overflow-hidden border border-[#111111] p-2">
                         <EditableImage path={`story[${i}].image_url`} defaultSrc="https://images.unsplash.com/photo-1520854221256-17451cc331bf?q=80&w=2070&auto=format&fit=crop" className="w-full h-auto object-contain grayscale opacity-80" />
                      </div>
                    </div>
                    <div className="w-full md:w-1/2 md:pl-12">
                      <EditableText path={`story[${i}].year`} defaultText="2021" as="p" className="font-display text-[#B7A27A] text-2xl italic mb-4" />
                      <EditableText path={`story[${i}].title`} defaultText="How We Met" as="h3" className="font-sans uppercase tracking-widest text-lg text-[#F2EEE7] mb-6" />
                      <EditableText path={`story[${i}].content`} defaultText="A brief story about this moment in time." as="p" className="text-[#77736D] leading-relaxed font-light text-sm" />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-full md:w-1/2 md:pr-12 md:text-right order-2 md:order-1">
                      <EditableText path={`story[${i}].year`} defaultText="2022" as="p" className="font-display text-[#B7A27A] text-2xl italic mb-4" />
                      <EditableText path={`story[${i}].title`} defaultText="The Engagement" as="h3" className="font-sans uppercase tracking-widest text-lg text-[#F2EEE7] mb-6" />
                      <EditableText path={`story[${i}].content`} defaultText="A brief story about this moment in time." as="p" className="text-[#77736D] leading-relaxed font-light text-sm" />
                    </div>
                    <div className="w-full md:w-1/2 order-1 md:order-2">
                      <div className="aspect-[4/3] w-full overflow-hidden border border-[#111111] p-2">
                         <EditableImage path={`story[${i}].image_url`} defaultSrc="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=2069&auto=format&fit=crop" className="w-full h-auto object-contain grayscale opacity-80" />
                      </div>
                    </div>
                  </>
                )}
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* 4. EVENTS */}
      {events && events.length > 0 && (
        <section id="events" className="py-32 md:py-48 px-6 bg-[#111111] relative">
          <div className="max-w-5xl mx-auto">
            <Reveal animation="fade-up" duration={1.2} className="text-center mb-32">
              <h2 className="font-display text-4xl md:text-6xl text-[#F2EEE7] font-light italic">The Itinerary</h2>
            </Reveal>

            <div className="space-y-32">
              {events.map((evt: any, i: number) => (
                <Reveal key={evt.id || i} animation="fade-up" duration={1.5} className="flex flex-col md:flex-row gap-8 md:gap-16 border-b border-[#1B1B1B] pb-32 last:border-0 last:pb-0">
                  <div className="w-full md:w-1/3 flex flex-col items-center md:items-start text-center md:text-left">
                    <EditableText path={`events[${i}].date`} defaultText="Oct 24" as="p" className="font-sans font-light text-[10px] uppercase tracking-[0.3em] text-[#77736D] mb-2" />
                    <EditableText path={`events[${i}].time`} defaultText="6:00 PM" as="p" className="font-sans font-light text-xl text-[#F2EEE7] mb-6" />
                  </div>

                  <div className="w-full md:w-2/3 text-center md:text-left">
                    <div className="mb-4 text-[#DCA963] flex justify-center md:justify-start">
                      <IconRenderer icon={evt.icon || "sparkles"} size={32} />
                    </div>
                    <EditableText path={`events[${i}].title`} defaultText="The Ceremony" as="h3" className="font-display text-3xl md:text-5xl mb-6 text-[#F2EEE7]" />
                    <EditableText path={`events[${i}].venue_name`} defaultText="The Grand Hall" as="p" className="font-sans font-medium text-[10px] uppercase tracking-[0.4em] text-[#F2EEE7] mb-6" />
                    <EditableText path={`events[${i}].description`} defaultText="Join us as we exchange vows. Black-tie attire requested." as="p" className="font-sans font-light text-[#77736D] leading-relaxed text-sm md:text-base max-w-md mx-auto md:mx-0 mb-8" />
                    
                    <div className="aspect-video w-full overflow-hidden border border-[#1B1B1B] p-2">
                       <EditableImage path={`events[${i}].image_url`} defaultSrc="https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070&auto=format&fit=crop" className="w-full h-auto object-contain grayscale opacity-80 hover:opacity-100 hover:grayscale-0 transition-all duration-700" />
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
        <section id="gallery" className="py-32 md:py-48 px-6 bg-[#0A0A0A]">
          <Reveal animation="fade-up" duration={1.2} className="text-center mb-16 md:mb-24">
            <h2 className="font-display text-4xl md:text-5xl text-[#F2EEE7] font-light italic">Night Archive</h2>
          </Reveal>
          <Reveal animation="fade-up" duration={1.5}>
            <div className="max-w-7xl mx-auto">
              <Gallery items={gallery.images.map((g: any, i: number) => ({ url: g.image_url, caption: g.alt, path: `gallery.images[${i}].image_url` }))} layout="masonry" />
            </div>
          </Reveal>
        </section>
      )}

      {/* 6. LIVESTREAM */}
      {livestream?.enabled && (
        <section id="livestream" className="py-32 px-6 bg-[#111111] text-center border-t border-[#1B1B1B]">
           <div className="max-w-2xl mx-auto">
              <EditableText path="livestream.title" defaultText="Join Virtually" as="h2" className="font-display text-4xl text-[#F2EEE7] mb-6" />
              <EditableText path="livestream.message" defaultText="We are broadcasting our special moment live." as="p" className="text-[#77736D] mb-12 font-light" />
              {livestream.url && (
                <a href={livestream.url} target="_blank" rel="noopener noreferrer" className="inline-block px-12 py-4 bg-[#DCA963] text-black font-sans text-xs uppercase tracking-widest hover:bg-white transition-colors">
                  Watch Live Stream
                </a>
              )}
           </div>
        </section>
      )}

      {/* 7. VENUE */}
      {venue?.enabled && (
        <section id="venue" className="py-32 md:py-48 px-6 bg-[#0A0A0A]">
          <div className="max-w-6xl mx-auto relative">
            <Reveal animation="fade-up" duration={1.5} className="aspect-[16/9] w-full overflow-hidden relative">
              <EditableImage path="venue.image_url" defaultSrc="https://images.unsplash.com/photo-1574360341773-45542a2080fa?q=80&w=2070&auto=format&fit=crop" className="w-full h-auto object-contain opacity-50 grayscale" />
            </Reveal>

            <Reveal animation="fade-up" duration={1.5} delay={0.4} className="relative -mt-24 md:-mt-48 z-10 bg-[#111111] border border-[#1B1B1B] p-12 md:p-20 max-w-2xl mx-auto text-center shadow-2xl">
              <EditableText path="venue.name" defaultText="The Rosewood" as="h2" className="font-display text-3xl md:text-4xl text-[#F2EEE7] mb-6 font-light" />
              <EditableText path="venue.address" defaultText="252 High Holborn\nLondon WC1V 7EN, UK" as="p" className="font-sans font-light text-[#77736D] text-sm mb-12 whitespace-pre-wrap leading-loose uppercase tracking-widest" />
              
              <div className="flex flex-col md:flex-row justify-center gap-8 md:gap-16 items-center">
                {venue.map_query && (
                  <a href={`https://maps.google.com/?q=${encodeURIComponent(venue.map_query)}`} target="_blank" rel="noopener noreferrer" className="font-sans font-light text-[10px] uppercase tracking-[0.3em] text-[#F2EEE7] hover:text-[#B7A27A] border-b border-[#1B1B1B] pb-2">
                    View Map
                  </a>
                )}
                {venue.gmap_link && (
                  <a href={venue.gmap_link} target="_blank" rel="noopener noreferrer" className="font-sans font-light text-[10px] uppercase tracking-[0.3em] text-[#F2EEE7] hover:text-[#B7A27A] border-b border-[#1B1B1B] pb-2">
                    Directions
                  </a>
                )}
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* 8. CONTACT */}
      {contact?.enabled && (
        <section id="contact" className="py-24 bg-[#111111] text-center px-6">
           <EditableText path="contact.phone" defaultText="+1 234 567 890" as="p" className="font-sans text-sm tracking-widest text-[#F2EEE7] mb-4 block" />
           <EditableText path="contact.email" defaultText="hello@couple.com" as="p" className="font-sans text-sm tracking-widest text-[#77736D] block" />
        </section>
      )}

      {/* 9. RSVP */}
      {rsvp?.enabled && (
        <section id="rsvp" className="py-40 md:py-64 bg-[#0A0A0A] text-[#F2EEE7] text-center px-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-[#111111]/50 mix-blend-overlay"></div>
          <Reveal animation="fade-up" duration={1.5} className="max-w-2xl mx-auto relative z-10">
            <EditableText path="rsvp.title" defaultText="RSVP" as="h2" className="font-display text-6xl md:text-8xl lg:text-9xl mb-12 text-[#F2EEE7] tracking-widest" />
            <EditableText path="rsvp.deadline" defaultText="Kindly reply by September 1st" as="p" className="font-sans font-light text-[10px] md:text-xs tracking-[0.4em] uppercase mb-16 text-[#77736D]" />
            <button onClick={() => setShowRsvp(true)} className="px-16 py-6 bg-transparent border border-[#F2EEE7] text-[#F2EEE7] font-sans text-[10px] font-medium uppercase tracking-[0.4em] hover:bg-[#F2EEE7] hover:text-[#0A0A0A] transition-all duration-500">
              Submit Response
            </button>
          </Reveal>
        </section>
      )}

      <RsvpModal isOpen={showRsvp} onClose={() => setShowRsvp(false)} invitationId={invitationId || ''} theme="dark" />

      {/* 10. FOOTER */}
      {footer?.enabled && (
        <section id="footer" className="py-32 px-6 text-center bg-[#0A0A0A] text-[#F2EEE7] border-t border-[#111111]">
          <Reveal animation="fade-up" duration={1.5}>
            <EditableText path="footer.initials" defaultText="J & S" as="h2" className="font-display text-4xl md:text-5xl mb-16 text-[#B7A27A] font-light" />
            <EditableText path="footer.text" defaultText="The End." as="p" className="font-sans font-light text-[10px] uppercase tracking-[1em] text-[#77736D]" />
          </Reveal>
        </section>
      )}
    </div>
  );
}

