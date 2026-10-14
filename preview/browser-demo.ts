/**
 * Isolated browser demo adapter. Copied into a temporary static-export project;
 * never imported by the ordinary server or PostgreSQL application.
 */
export type Booking = {
  id: string;
  token: string;
  vehicle: string;
  slot: string;
  price: number;
  status: 'confirmed' | 'cancelled';
  payment: 'simulated';
  created: string;
};

const storageKey = 'repairroom-browser-demo-v1';
const lockName = 'repairroom-browser-demo-bookings';
const tokenPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const vehicles = [
  { id: 'compact', name: 'Demo Kompakt · Benzin', price: 12900 },
  { id: 'touring', name: 'Demo Touring · Diesel', price: 15900 },
  { id: 'sport', name: 'Demo Sport · Benzin', price: 18900 },
];
type State = { version: 1; bookings: Booking[] };
let mutationQueue: Promise<unknown> = Promise.resolve();

function readState(): State {
  let stored: string | null;
  try {
    stored = localStorage.getItem(storageKey);
  } catch {
    throw Error('Bitte erlaube lokalen Browserspeicher, um die Testbuchung auszuprobieren.');
  }
  if (!stored) return { version: 1, bookings: [] };
  try {
    const state: State = JSON.parse(stored);
    if (state.version !== 1 || !Array.isArray(state.bookings) || !state.bookings.every(isBooking)) {
      throw Error('Invalid demo storage');
    }
    return state;
  } catch {
    throw Error('Der lokale Demo-Speicher ist ungültig. Lösche die Websitedaten dieser Browser-Demo und starte erneut.');
  }
}

function isBooking(value: Booking): boolean {
  return !!value && typeof value === 'object' &&
    typeof value.id === 'string' && tokenPattern.test(value.id) &&
    typeof value.token === 'string' && tokenPattern.test(value.token) &&
    typeof value.vehicle === 'string' &&
    vehicles.some(vehicle => vehicle.name === value.vehicle && vehicle.price === value.price) &&
    typeof value.slot === 'string' && Number.isFinite(Date.parse(value.slot)) &&
    (value.status === 'confirmed' || value.status === 'cancelled') &&
    value.payment === 'simulated' &&
    typeof value.created === 'string' && Number.isFinite(Date.parse(value.created));
}

function writeState(state: State) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(state));
  } catch {
    throw Error('Die Testbuchung konnte nicht im Browser gespeichert werden. Bitte erlaube lokalen Browserspeicher.');
  }
}

function availableSlots(state: State, now = Date.now()): string[] {
  const booked = new Set(state.bookings.filter(booking => booking.status === 'confirmed').map(booking => booking.slot));
  const slots: string[] = [];
  for (let day = 0; day < 7; day++) {
    const date = new Date(now);
    date.setUTCDate(date.getUTCDate() + day);
    date.setUTCMinutes(0, 0, 0);
    for (let hour = 9; hour < 17; hour++) {
      date.setUTCHours(hour);
      const slot = date.toISOString();
      if (date.getTime() > now && !booked.has(slot)) slots.push(slot);
    }
  }
  return slots;
}

function getVehicle(id: unknown) {
  const vehicle = vehicles.find(item => item.id === id);
  if (!vehicle) throw Error('Bitte ein unterstütztes Demo-Fahrzeug wählen.');
  return vehicle;
}

function getBooking(state: State, token: unknown): Booking {
  if (typeof token !== 'string' || !tokenPattern.test(token)) throw Error('Ungültiger Verwaltungslink.');
  const booking = state.bookings.find(item => item.token === token);
  if (!booking) throw Error('Diese Testbuchung wurde in diesem Browser nicht gefunden. Verwaltungslinks funktionieren nur im selben Browser; gelöschte Websitedaten entfernen die Buchung.');
  return booking;
}

function secureId(): string {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

async function mutate<T>(operation: () => T): Promise<T> {
  if (navigator.locks) return navigator.locks.request(lockName, operation);
  // Storage operations are synchronous; serialize this document on older browsers.
  const next = mutationQueue.then(operation, operation);
  mutationQueue = next.then(() => undefined, () => undefined);
  return next;
}

function response(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });
}

/** Response-compatible local replacement for the demo API. Never sends a request. */
export async function browserDemo(input: string, init?: RequestInit): Promise<Response> {
  try {
    const url = new URL(input, location.origin);
    if (url.origin !== location.origin || url.pathname !== '/api/demo') throw Error('Unbekannte Browser-Demo-Anfrage.');
    if (!init || !init.method || init.method === 'GET') {
      const state = readState();
      const token = url.searchParams.get('token');
      return response(token ? getBooking(state, token) : { vehicles, slots: availableSlots(state) });
    }
    if (init.method !== 'POST' || typeof init.body !== 'string') throw Error('Ungültige Browser-Demo-Anfrage.');
    const body: Record<string, unknown> = JSON.parse(init.body);
    if (!body || typeof body !== 'object') throw Error('Ungültige Browser-Demo-Anfrage.');
    if (body.action === 'quote') {
      const vehicle = getVehicle(body.vehicle);
      return response({ price: vehicle.price, slots: availableSlots(readState()) });
    }
    if (body.action === 'book') {
      return await mutate(() => {
        const vehicle = getVehicle(body.vehicle);
        const state = readState();
        if (typeof body.slot !== 'string' || !availableSlots(state).includes(body.slot)) {
          throw Error('Dieses Demo-Zeitfenster ist nicht mehr verfügbar. Bitte neu wählen.');
        }
        const booking: Booking = {
          id: secureId(), token: secureId(), vehicle: vehicle.name, slot: body.slot,
          price: vehicle.price, status: 'confirmed', payment: 'simulated', created: new Date().toISOString(),
        };
        state.bookings.push(booking);
        writeState(state);
        return response(booking);
      });
    }
    if (body.action === 'cancel') {
      return await mutate(() => {
        const state = readState();
        const booking = getBooking(state, body.token);
        if (booking.status !== 'cancelled') {
          booking.status = 'cancelled';
          writeState(state);
        }
        return response(booking);
      });
    }
    throw Error('Unbekannte Aktion.');
  } catch (error) {
    return response({ error: error instanceof Error ? error.message : 'Browser-Demo-Anfrage fehlgeschlagen.' }, 400);
  }
}
