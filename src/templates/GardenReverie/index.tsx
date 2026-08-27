import React, { useState } from "react";
import { IconRenderer } from "../../components/IconRenderer";
import { EditableText, EditableImage } from "../../components/builder";
import {
  Reveal,
  HeroMedia,
  Gallery,
  BackgroundAudio,
  RsvpModal,
} from "../../components/premium";

export interface GardenReverieProps {
  data: any;
  invitationId?: string;
}

export default function GardenReverie({ data, invitationId }: GardenReverieProps) {
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
    <div className="garden-theme bg-[#F7F4ED] text-[#26332B] min-h-screen selection:bg-[#A58B63]/20 selection:text-[#26332B]">
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @import url('https://fonts.googleapis.com/css2?family=Jost:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Marcellus&display=swap');
        
        .garden-theme {
          font-family: 'Jost', sans-serif;
        }
        
        .garden-theme .font-display {
          font-family: 'Marcellus', serif;
        }

        html {
          scroll-behavior: smooth;
        }
        
        .leaf-divider {
          background-image: url("data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2ZM12 18C8.68629 18 6 15.3137 6 12C6 8.68629 8.68629 6 12 6C15.3137 6 18 8.68629 18 12C18 15.3137 15.3137 18 12 18Z' fill='%23A58B63' fill-opacity='0.2'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: center;
          height: 24px;
        }
      `,
        }}
      />

      <BackgroundAudio src={hero?.audio_url} autoPlay position="bottom-right" />

      {/* FLOATING NAVIGATION */}
      <nav className="fixed top-0 left-0 w-full z-50 p-6 md:p-10 flex justify-between items-center transition-all duration-700 mix-blend-difference text-[#F7F4ED] pointer-events-none">
        <div className="font-display tracking-[0.2em] uppercase text-xs pointer-events-auto">
          <EditableText path="couple.partnerA.name" defaultText="E" as="span" /> & <EditableText path="couple.partnerB.name" defaultText="T" as="span" />
        </div>
      </nav>

      {/* 1. HERO SECTION */}
      <section id="hero" className="relative h-[100svh] w-full flex flex-col justify-end items-center pb-20 md:pb-32 overflow-hidden bg-[#26332B]">
        <div className="absolute inset-0 w-full h-full">
          <HeroMedia
            type={hero?.video_url ? 'video' : 'image'}
            src={hero?.video_url || hero?.image_url}
            fallbackSrc="https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070&auto=format&fit=crop"
            overlay="bg-black/30"
          />
        </div>

        <div className="relative z-10 text-center text-[#F7F4ED] w-full px-6 flex flex-col items-center">
          <Reveal animation="fade" duration={2} delay={0.5}>
            <EditableText path="hero.subtitle" defaultText="A WEDDING CELEBRATION" as="p" className="text-[10px] md:text-xs font-sans uppercase tracking-[0.4em] mb-6 md:mb-10 opacity-80" />
          </Reveal>

          <Reveal animation="fade-up" duration={2} delay={1}>
            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl mb-6 md:mb-10 leading-tight">
              <EditableText path="couple.partnerA.name" defaultText="Evelyn" as="span" />
              <span className="italic block font-serif text-[#A58B63] text-3xl md:text-5xl my-2">&</span>
              <EditableText path="couple.partnerB.name" defaultText="Thomas" as="span" />
            </h1>
          </Reveal>

          <Reveal animation="fade-up" duration={2} delay={1.5} className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-4 text-xs font-sans uppercase tracking-widest text-[#F7F4ED]/90">
              <EditableText path="hero.title" defaultText="Sept 15, 2026" as="span" />
              <span className="w-1 h-1 rounded-full bg-[#A58B63]"></span>
              <EditableText path="venue.name" defaultText="Villa d'Este" as="span" />
            </div>
            {hero?.auspicious_time && (
              <EditableText path="hero.auspicious_time" defaultText="10:30 AM" as="span" className="text-xs font-sans uppercase tracking-widest text-[#A58B63]" />
            )}
          </Reveal>
        </div>
      </section>

      {/* 2. COUPLE SECTION */}
      <section id="couple" className="py-24 md:py-40 px-6 bg-[#F7F4ED]">
        <div className="max-w-6xl mx-auto">
          <Reveal animation="fade-up" className="text-center mb-16 md:mb-24">
            <h2 className="font-display text-3xl md:text-5xl text-[#26332B] mb-6">The Couple</h2>
            <div className="leaf-divider"></div>
          </Reveal>

          <div className="flex flex-col md:flex-row gap-16 md:gap-24 items-center">
            <Reveal animation="fade-right" className="w-full md:w-1/2 flex flex-col items-center text-center">
              <div className="aspect-[3/4] w-full max-w-[320px] rounded-t-full overflow-hidden mb-10 shadow-xl border-4 border-white">
                <EditableImage path="couple.partnerA.image_url" defaultSrc="https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=1974&auto=format&fit=crop" className="w-full h-auto object-contain" />
              </div>
              <EditableText path="couple.partnerA.name" defaultText="Evelyn Rose" as="h3" className="font-display text-3xl mb-3 text-[#26332B]" />
              <EditableText path="couple.partnerA.role" defaultText="Bride" as="p" className="text-[#A58B63] font-sans text-xs uppercase tracking-widest mb-4" />
              <EditableText path="couple.partnerA.parents" defaultText="Daughter of Michael & Sarah Rose" as="p" className="text-sm text-[#26332B]/60 mb-6 italic" />
              <EditableText path="couple.partnerA.description" defaultText="Lover of nature and vintage books." as="p" className="font-sans font-light text-[#26332B]/70 leading-relaxed max-w-sm mx-auto" />
            </Reveal>

            <Reveal animation="fade-left" delay={0.2} className="w-full md:w-1/2 flex flex-col items-center text-center">
              <div className="aspect-[3/4] w-full max-w-[320px] rounded-t-full overflow-hidden mb-10 shadow-xl border-4 border-white">
                <EditableImage path="couple.partnerB.image_url" defaultSrc="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1287&auto=format&fit=crop" className="w-full h-auto object-contain" />
              </div>
              <EditableText path="couple.partnerB.name" defaultText="Thomas Blake" as="h3" className="font-display text-3xl mb-3 text-[#26332B]" />
              <EditableText path="couple.partnerB.role" defaultText="Groom" as="p" className="text-[#A58B63] font-sans text-xs uppercase tracking-widest mb-4" />
              <EditableText path="couple.partnerB.parents" defaultText="Son of David & Elizabeth Blake" as="p" className="text-sm text-[#26332B]/60 mb-6 italic" />
              <EditableText path="couple.partnerB.description" defaultText="Architect with a passion for sustainable design." as="p" className="font-sans font-light text-[#26332B]/70 leading-relaxed max-w-sm mx-auto" />
            </Reveal>
          </div>
        </div>
      </section>

      {/* 3. STORY SECTION */}
      {story && story.length > 0 && (
        <section id="story" className="py-24 md:py-40 px-6 bg-[#26332B] text-[#F7F4ED]">
          <div className="max-w-5xl mx-auto">
            <Reveal animation="fade-up" className="text-center mb-24">
              <h2 className="font-display text-3xl md:text-5xl mb-6">Our Journey</h2>
              <div className="w-16 h-px bg-[#A58B63] mx-auto"></div>
            </Reveal>

            <div className="space-y-24 md:space-y-32">
              {story.map((item: any, i: number) => (
                <Reveal key={item.id || i} animation="fade-up" className="grid md:grid-cols-2 gap-12 items-center">
                  <div className={`${i % 2 === 1 ? 'md:order-2' : ''}`}>
                    <div className="aspect-square md:aspect-[4/3] overflow-hidden rounded-bl-[100px] rounded-tr-[100px]">
                       <EditableImage path={`story[${i}].image_url`} defaultSrc="https://images.unsplash.com/photo-1522673607200-164d1b6ce486?q=80&w=2070&auto=format&fit=crop" className="w-full h-auto object-contain" />
                    </div>
                  </div>
                  <div className={`flex flex-col justify-center ${i % 2 === 1 ? 'md:order-1 text-left md:text-right md:items-end' : 'text-left md:items-start'}`}>
                    <EditableText path={`story[${i}].year`} defaultText="2022" as="p" className="font-display text-[#A58B63] text-2xl mb-4" />
                    <EditableText path={`story[${i}].title`} defaultText="When We Met" as="h3" className="font-sans text-xl uppercase tracking-widest mb-6" />
                    <EditableText path={`story[${i}].content`} defaultText="It all started in a coffee shop." as="p" className="font-light text-[#F7F4ED]/80 leading-relaxed max-w-sm" />
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 4. EVENTS SECTION */}
      {events && events.length > 0 && (
        <section id="events" className="py-24 md:py-40 px-6 bg-[#F7F4ED]">
          <div className="max-w-7xl mx-auto">
            <Reveal animation="fade-up" className="text-center mb-20">
              <h2 className="font-display text-3xl md:text-5xl text-[#26332B] mb-6">Celebrations</h2>
              <div className="leaf-divider"></div>
            </Reveal>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
              {events.map((evt: any, i: number) => (
                <Reveal key={evt.id || i} animation="fade-up" delay={i * 0.1}>
                  <div className="bg-white p-8 md:p-12 shadow-sm border border-[#26332B]/5 h-full flex flex-col text-center rounded-t-[60px]">
                    <div className="text-[#A58B63] mb-8 flex justify-center">
                      <IconRenderer icon={evt.icon || "flower"} size={32} />
                    </div>
                    <EditableText path={`events[${i}].title`} defaultText="Ceremony" as="h3" className="font-display text-2xl text-[#26332B] mb-6" />
                    <EditableText path={`events[${i}].date`} defaultText="Sept 15, 2026" as="p" className="font-sans text-xs uppercase tracking-widest text-[#A58B63] mb-2" />
                    <EditableText path={`events[${i}].time`} defaultText="4:00 PM" as="p" className="font-sans text-[#26332B] mb-4" />
                    <EditableText path={`events[${i}].venue_name`} defaultText="Villa Gardens" as="p" className="font-sans font-medium text-[#26332B] mb-6" />
                    <div className="h-px w-16 bg-[#A58B63]/30 mx-auto mb-6" />
                    <EditableText path={`events[${i}].description`} defaultText="Join us for our vows." as="p" className="font-light text-[#26332B]/70 italic text-sm mb-8 flex-1" />
                    <div className="aspect-square w-full rounded-full overflow-hidden mt-auto">
                       <EditableImage path={`events[${i}].image_url`} defaultSrc="https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070&auto=format&fit=crop" className="w-full h-auto object-contain" />
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
        <section id="gallery" className="py-24 md:py-40 px-6 bg-[#26332B] text-[#F7F4ED]">
          <div className="max-w-7xl mx-auto">
            <Reveal animation="fade-up" className="text-center mb-16">
              <h2 className="font-display text-3xl md:text-5xl mb-6">Gallery</h2>
              <div className="w-16 h-px bg-[#A58B63] mx-auto"></div>
            </Reveal>
            <Reveal animation="fade-up" delay={0.2}>
              <Gallery items={gallery.images.map((g: any, i: number) => ({ url: g.image_url, caption: g.alt, path: `gallery.images[${i}].image_url` }))} layout="masonry" />
            </Reveal>
          </div>
        </section>
      )}

      {/* 6. LIVESTREAM */}
      {livestream?.enabled && (
        <section id="livestream" className="py-24 px-6 bg-[#F7F4ED] text-center border-y border-[#26332B]/10">
          <div className="max-w-2xl mx-auto">
            <EditableText path="livestream.title" defaultText="Watch Online" as="h2" className="font-display text-3xl md:text-4xl text-[#26332B] mb-6" />
            <EditableText path="livestream.message" defaultText="Join our celebration from afar." as="p" className="text-[#26332B]/70 mb-10 font-light" />
            {livestream.url && (
              <a href={livestream.url} target="_blank" rel="noopener noreferrer" className="inline-block px-10 py-4 bg-[#26332B] text-white text-xs uppercase tracking-widest hover:bg-[#A58B63] transition-colors rounded-full">
                Join Livestream
              </a>
            )}
          </div>
        </section>
      )}

      {/* 7. VENUE & CONTACT */}
      {(venue?.enabled || contact?.enabled) && (
        <section id="venue" className="py-24 md:py-40 px-6 bg-[#F7F4ED]">
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-16">
            {venue?.enabled && (
              <Reveal animation="fade-right">
                <div className="text-center">
                  <div className="text-[#A58B63] mb-6 flex justify-center"><IconRenderer icon="map-pin" size={24} /></div>
                  <EditableText path="venue.name" defaultText="Villa d'Este" as="h3" className="font-display text-3xl text-[#26332B] mb-4" />
                  <EditableText path="venue.address" defaultText="Lake Como, Italy" as="p" className="text-[#26332B]/70 whitespace-pre-wrap leading-relaxed mb-8" />
                  
                  <div className="aspect-[4/3] rounded-t-full overflow-hidden mb-8 border-4 border-white shadow-lg">
                    <EditableImage path="venue.image_url" defaultSrc="https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070&auto=format&fit=crop" className="w-full h-auto object-contain" />
                  </div>
                  
                  <div className="flex gap-4 justify-center">
                    {venue.map_query && <a href={`https://maps.google.com/?q=${encodeURIComponent(venue.map_query)}`} target="_blank" rel="noopener noreferrer" className="text-xs uppercase tracking-widest text-[#A58B63] hover:text-[#26332B] border-b border-[#A58B63] pb-1">View Map</a>}
                  </div>
                </div>
              </Reveal>
            )}

            {contact?.enabled && (
              <Reveal animation="fade-left" className="flex flex-col justify-center items-center bg-white p-12 shadow-sm rounded-t-full border border-[#26332B]/5 text-center">
                <div className="text-[#A58B63] mb-6"><IconRenderer icon="phone" size={24} /></div>
                <h3 className="font-display text-3xl text-[#26332B] mb-8">Contact</h3>
                <div className="space-y-6">
                  <div>
                    <span className="block text-[10px] uppercase tracking-widest text-[#26332B]/50 mb-2">Phone</span>
                    <EditableText path="contact.phone" defaultText="+1 234 567 890" as="p" className="text-[#26332B]" />
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase tracking-widest text-[#26332B]/50 mb-2">Email</span>
                    <EditableText path="contact.email" defaultText="hello@couple.com" as="p" className="text-[#26332B]" />
                  </div>
                </div>
              </Reveal>
            )}
          </div>
        </section>
      )}

      {/* 8. RSVP */}
      {rsvp?.enabled && (
        <section id="rsvp" className="py-32 md:py-48 px-6 bg-[#26332B] text-[#F7F4ED] text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-black/20 mix-blend-overlay"></div>
          <Reveal animation="fade-up" className="relative z-10 max-w-2xl mx-auto">
            <EditableText path="rsvp.title" defaultText="Kindly RSVP" as="h2" className="font-display text-5xl md:text-7xl mb-8" />
            <EditableText path="rsvp.deadline" defaultText="Please reply by August 15" as="p" className="font-sans text-xs uppercase tracking-[0.3em] mb-12 text-[#A58B63]" />
            <button onClick={() => setShowRsvp(true)} className="px-12 py-5 bg-[#A58B63] text-white text-xs uppercase tracking-widest rounded-full hover:bg-white hover:text-[#26332B] transition-colors">
              Accept with Pleasure
            </button>
          </Reveal>
        </section>
      )}

      {/* 9. FOOTER */}
      {footer?.enabled && (
        <section id="footer" className="py-24 px-6 bg-[#F7F4ED] text-center">
          <Reveal animation="fade-up">
            <EditableText path="footer.initials" defaultText="E & T" as="h2" className="font-display text-4xl mb-6 text-[#26332B]" />
            <div className="leaf-divider mb-6"></div>
            <EditableText path="footer.text" defaultText="Thank you for sharing our joy." as="p" className="font-sans text-[10px] uppercase tracking-widest text-[#26332B]/60" />
          </Reveal>
        </section>
      )}

      <RsvpModal isOpen={showRsvp} onClose={() => setShowRsvp(false)} invitationId={invitationId || ''} theme="light" />
    </div>
  );
}

