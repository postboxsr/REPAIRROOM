-- Development foundation. No live data is accepted by this milestone.
CREATE EXTENSION IF NOT EXISTS btree_gist;
CREATE TABLE stations (
 id uuid PRIMARY KEY, name text NOT NULL,
 data_kind text NOT NULL CHECK (data_kind IN ('demo','test'))
);
CREATE TABLE service_offers (
 id text PRIMARY KEY, vehicle_name text NOT NULL,
 amount_cents integer NOT NULL CHECK (amount_cents > 0),
 currency text NOT NULL DEFAULT 'EUR' CHECK (currency = 'EUR'),
 duration_minutes integer NOT NULL CHECK (duration_minutes BETWEEN 1 AND 240),
 data_kind text NOT NULL CHECK (data_kind IN ('demo','test'))
);
CREATE TABLE service_windows (
 id uuid PRIMARY KEY, station_id uuid NOT NULL REFERENCES stations(id),
 starts_at timestamptz NOT NULL, ends_at timestamptz NOT NULL CHECK (ends_at > starts_at),
 data_kind text NOT NULL CHECK (data_kind IN ('demo','test')),
 UNIQUE (station_id, starts_at),
 EXCLUDE USING gist (station_id WITH =, tstzrange(starts_at, ends_at, '[)') WITH &&)
);
CREATE TABLE window_offers (
 window_id uuid NOT NULL REFERENCES service_windows(id),
 offer_id text NOT NULL REFERENCES service_offers(id), PRIMARY KEY(window_id,offer_id)
);
CREATE TABLE bookings (
 id uuid PRIMARY KEY, window_id uuid NOT NULL REFERENCES service_windows(id),
 offer_id text NOT NULL REFERENCES service_offers(id),
 status text NOT NULL CHECK (status IN ('pending_payment','confirmed','cancelled','expired','completed')),
 amount_cents integer NOT NULL CHECK (amount_cents > 0),
 currency text NOT NULL CHECK (currency = 'EUR'), vehicle_snapshot jsonb NOT NULL,
 management_token_hash text NOT NULL UNIQUE CHECK (management_token_hash ~ '^[a-f0-9]{64}$'),
 hold_expires_at timestamptz NOT NULL, created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
 updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),
 data_kind text NOT NULL CHECK (data_kind IN ('demo','test'))
);
CREATE UNIQUE INDEX one_active_booking_per_window ON bookings(window_id)
 WHERE status IN ('pending_payment','confirmed');
CREATE INDEX pending_expiry ON bookings(hold_expires_at) WHERE status='pending_payment';
CREATE TABLE simulated_payment_events (
 event_id text PRIMARY KEY CHECK (length(event_id) BETWEEN 1 AND 128),
 booking_id uuid NOT NULL UNIQUE REFERENCES bookings(id),
 amount_cents integer NOT NULL CHECK (amount_cents > 0), currency text NOT NULL CHECK (currency='EUR'),
 received_at timestamptz NOT NULL DEFAULT clock_timestamp()
);
CREATE TABLE booking_events (
 id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 booking_id uuid NOT NULL REFERENCES bookings(id),
 kind text NOT NULL CHECK (kind IN ('reserved','expired','payment_simulated','cancelled')),
 created_at timestamptz NOT NULL DEFAULT clock_timestamp()
);
