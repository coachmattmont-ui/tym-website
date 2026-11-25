const DROP = new Set(['dealer', 'dealerCost', 'fr', 'cost', 'msrp', 'email', 'phone', 'address']);

function text(value, max) {
  return String(value || '').replace(/[\r\n\t]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);
}

function httpsUrl(raw) {
  try {
    const url = new URL(String(raw || '').trim());
    if (url.protocol !== 'https:') return '';
    return url.toString();
  } catch (e) {
    return '';
  }
}

export const DEFAULT_SCHEDULING_URL = 'https://calendly.com/smartdesigns/quick-call-project-review';

export function leadDestinations(env) {
  const src = env || {};
  return {
    webhook: httpsUrl(src.YT_LEAD_WEBHOOK_URL),
    scheduling: httpsUrl(src.YT_SCHEDULING_URL) || DEFAULT_SCHEDULING_URL
  };
}

function dollars(n) {
  const v = Math.round((Number(n) || 0) * 100) / 100;
  const cents = Math.round(v * 100) % 100 !== 0;
  return '$' + v.toLocaleString('en-US', { minimumFractionDigits: cents ? 2 : 0, maximumFractionDigits: 2 });
}

export function schedulingLink(base, lead) {
  const url = new URL(base);
  const name = lead.contact.name;
  const email = lead.contact.email;
  if (name) url.searchParams.set('name', name);
  if (email) url.searchParams.set('email', email);
  const note = 'Layout quote: ' + lead.quote.projectName + '. Total ' + dollars(lead.quote.total) + '. Control: ' + (lead.quote.control || 'Not selected') + '.';
  url.searchParams.set('a1', note.slice(0, 400));
  return url.toString();
}

function cleanLine(line) {
  const qty = Number(line && line.qty);
  const tbd = !!(line && line.tbd);
  const unit = tbd ? null : Number(line && line.unit);
  const total = tbd || !Number.isFinite(unit) ? null : Math.round(unit * (Number.isFinite(qty) && qty > 0 ? qty : 1) * 100) / 100;
  return {
    name: text(line && line.name, 160) || 'Item',
    qty: Number.isFinite(qty) && qty > 0 ? qty : 1,
    unit: tbd || !Number.isFinite(unit) ? null : Math.round(unit * 100) / 100,
    total,
    tbd
  };
}

export function cleanLead(body) {
  const src = body && typeof body === 'object' ? body : {};
  const contact = src.contact && typeof src.contact === 'object' ? src.contact : src;
  const quote = src.quote && typeof src.quote === 'object' ? src.quote : {};
  const floors = Array.isArray(quote.floors) ? quote.floors.slice(0, 20).map(floor => ({
    name: text(floor && floor.name, 80),
    rooms: Array.isArray(floor && floor.rooms) ? floor.rooms.slice(0, 40).map(room => ({
      name: text(room && room.name, 80) || 'Unassigned',
      subtotal: Number(room && room.subtotal) || 0,
      lines: Array.isArray(room && room.lines) ? room.lines.slice(0, 80).map(cleanLine) : []
    })) : []
  })) : [];
  const whole = quote.wholeHome && typeof quote.wholeHome === 'object' ? quote.wholeHome : {};
  const lead = {
    source: 'layout-quote',
    contact: {
      name: text(contact.name, 80),
      email: text(contact.email, 120),
      phone: text(contact.phone, 40),
      preferredTime: text(contact.preferredTime || contact.when, 120),
      notes: text(contact.notes, 600)
    },
    quote: {
      projectName: text(quote.projectName, 120) || 'Project',
      control: text(quote.control, 40),
      date: text(quote.date, 40),
      total: Number(quote.total) || 0,
      tbdCount: Number(quote.tbdCount) || 0,
      floors,
      wholeHome: {
        subtotal: Number(whole.subtotal) || 0,
        lines: Array.isArray(whole.lines) ? whole.lines.slice(0, 40).map(cleanLine) : []
      }
    }
  };
  DROP.forEach(key => { delete lead[key]; delete lead.quote[key]; });
  return lead;
}

export function leadReady(lead) {
  if (!lead.contact.name) return 'Add your name.';
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(lead.contact.email)) return 'Enter a valid email.';
  return '';
}
