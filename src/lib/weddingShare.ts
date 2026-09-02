/**
 * CandyInvito Wedding Invitation Formatted Share Message Generator
 * Creates beautifully formatted WhatsApp / SMS / Email invitation announcements
 */

export interface WeddingShareDetails {
  coupleNames: string;
  weddingDate?: string;
  weddingTime?: string;
  venueName?: string;
  venueAddress?: string;
  invitationUrl: string;
  mapsUrl?: string;
  customNote?: string;
}

export function extractWeddingShareDetails(
  invitation: any,
  originUrl?: string,
): WeddingShareDetails {
  const content = invitation?.content || {};
  const origin =
    originUrl ||
    (typeof window !== "undefined"
      ? window.location.origin
      : "https://candyinvito.vercel.app");

  // Extract couple names
  let coupleNames =
    invitation?.couple_names ||
    invitation?.title ||
    "";

  if (!coupleNames || coupleNames === "New Couple" || coupleNames === "Wedding Invitation") {
    const p1 = content.couple?.partner1 || content.hero?.groomName || content.hero?.brideName || "";
    const p2 = content.couple?.partner2 || content.hero?.partner2 || "";
    if (p1 && p2) {
      coupleNames = `${p1} ❤️ ${p2}`;
    } else if (p1) {
      coupleNames = p1;
    } else if (content.hero?.title) {
      coupleNames = content.hero.title;
    } else {
      coupleNames = "Our Wedding Celebration";
    }
  }

  // Extract primary wedding event date and time
  const primaryEvent =
    (content.events && Array.isArray(content.events) && content.events[0]) ||
    (content.schedule && Array.isArray(content.schedule) && content.schedule[0]) ||
    {};

  const weddingDate =
    content.hero?.date ||
    primaryEvent.date ||
    content.eventsDate ||
    content.date ||
    "";

  const weddingTime =
    primaryEvent.time ||
    content.hero?.time ||
    content.time ||
    "";

  // Extract venue details
  const venueName =
    content.venue?.name ||
    primaryEvent.venue ||
    primaryEvent.location ||
    content.location ||
    "";

  const venueAddress =
    content.venue?.address ||
    content.venue?.city ||
    primaryEvent.address ||
    "";

  // Extract Google Maps URL
  let mapsUrl =
    content.venue?.mapsUrl ||
    content.venue?.mapUrl ||
    content.venue?.locationUrl ||
    primaryEvent.mapsUrl ||
    "";

  if (!mapsUrl && (venueName || venueAddress)) {
    const query = [venueName, venueAddress].filter(Boolean).join(" ");
    mapsUrl = `https://maps.google.com/?q=${encodeURIComponent(query)}`;
  }

  const slug = invitation?.slug || "";
  const invitationUrl = slug ? `${origin}/i/${slug}` : origin;

  return {
    coupleNames,
    weddingDate,
    weddingTime,
    venueName,
    venueAddress,
    invitationUrl,
    mapsUrl,
  };
}

export function formatWeddingShareMessage(details: WeddingShareDetails): string {
  const couple = details.coupleNames || "Our Wedding";

  const lines: string[] = [
    "You’re warmly invited to celebrate our wedding! 💍",
    "",
    couple,
    "",
  ];

  if (details.weddingDate) {
    lines.push(`📅 ${details.weddingDate}`);
  }
  if (details.weddingTime) {
    lines.push(`🕚 ${details.weddingTime}`);
  }

  const venueFull = [details.venueName, details.venueAddress].filter(Boolean).join(", ");
  if (venueFull) {
    lines.push(`📍 ${venueFull}`);
  }

  if (details.weddingDate || details.weddingTime || venueFull) {
    lines.push("");
  }

  lines.push("🌐 Invitation:");
  lines.push(details.invitationUrl);
  lines.push("");

  if (details.mapsUrl) {
    lines.push("📍 Maps:");
    lines.push(details.mapsUrl);
    lines.push("");
  }

  if (details.customNote) {
    lines.push(details.customNote);
    lines.push("");
  }

  lines.push(
    "Your presence and blessings will mean the world to us. We look forward to celebrating with you! 💛",
  );

  return lines.join("\n");
}
