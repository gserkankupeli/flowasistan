// In-browser stand-in for the Supabase client, used in demo mode only.
// It implements just the subset of the query builder the pages call, on top of
// fictional in-memory data. Nothing here talks to the network.

import { getLang } from '../i18n';
import { createDemoDb, categoryId, newId, INCOMING, type DemoDb, type Row } from './data';

let db: DemoDb = createDemoDb();
let incomingIndex = 0;

type Listener = { table: string; cb: (payload: unknown) => void };
interface DemoChannel {
    name: string;
    handlers: Listener[];
    on: (type: string, filter: { table?: string }, cb: (payload: unknown) => void) => DemoChannel;
    subscribe: () => DemoChannel;
    unsubscribe: () => Promise<'ok'>;
}
const channels = new Map<string, DemoChannel>();

function emit(table: string) {
    const targets: Listener[] = [];
    channels.forEach(ch => ch.handlers.forEach(h => { if (h.table === table) targets.push(h); }));
    setTimeout(() => targets.forEach(h => h.cb({ table })), 0);
}

function isL10n(value: unknown): value is { tr: string; en: string } {
    return !!value && typeof value === 'object' && !Array.isArray(value)
        && Object.keys(value).length === 2 && 'tr' in value && 'en' in value;
}

// Deep copy that also resolves bilingual fields to the active language
function materialize(value: any): any {
    if (isL10n(value)) return value[getLang()];
    if (Array.isArray(value)) return value.map(materialize);
    if (value && typeof value === 'object') {
        const out: Row = {};
        for (const key of Object.keys(value)) out[key] = materialize(value[key]);
        return out;
    }
    return value;
}

const pickFields = (row: Row | undefined, fields: string[]) =>
    row ? Object.fromEntries(fields.map(f => [f, row[f]])) : null;

// Mirrors the embedded selects the pages use: customers ( ... ), categories ( ... )
function withRelations(table: string, row: Row): Row {
    if (table === 'chatbot_conversations') {
        return {
            ...row,
            customers: pickFields(db.customers.find(c => c.id === row.customer_id), ['first_name', 'last_name', 'phone']),
            categories: pickFields(db.categories.find(c => c.id === row.category_id), ['name', 'color']),
        };
    }
    if (table === 'appointments') {
        return {
            ...row,
            customers: pickFields(db.customers.find(c => c.id === row.customer_id), ['first_name', 'last_name', 'phone']),
        };
    }
    return row;
}

// The urgent_callbacks view: open conversations waiting for a human
function urgentCallbacks(): Row[] {
    const waiting = [categoryId('callback'), categoryId('urgent')];
    return db.chatbot_conversations
        .filter(c => c.status === 'active' && waiting.includes(c.category_id))
        .sort((a, b) => String(b.last_message_at).localeCompare(String(a.last_message_at)))
        .map(c => {
            const customer = db.customers.find(x => x.id === c.customer_id);
            const category = db.categories.find(x => x.id === c.category_id);
            return {
                conversation_id: c.id,
                customer_id: c.customer_id,
                first_name: customer?.first_name ?? null,
                last_name: customer?.last_name ?? null,
                phone: customer?.phone ?? null,
                telegram_id: null,
                konusma_ozeti: c.summary,
                durum: category?.name ?? null,
                renk_kodu: category?.color ?? null,
                son_mesaj_tarihi: c.last_message_at,
            };
        });
}

function rowsOf(table: string): Row[] {
    if (table === 'urgent_callbacks') return urgentCallbacks();
    if (!db[table]) db[table] = [];
    return db[table];
}

// Column defaults from schema.sql that the pages rely on after an insert
const TABLE_DEFAULTS: Record<string, Row> = {
    customers: { email: null, last_interaction_date: null, total_interactions: 0, status: 'active' },
    notifications: { is_read: false, is_archived: false, read_at: null },
};

interface Result { data: any; error: null; count: number | null }

class DemoQuery implements PromiseLike<Result> {
    private op: 'select' | 'insert' | 'update' | 'delete' = 'select';
    private filters: ((row: Row) => boolean)[] = [];
    private sort: { column: string; ascending: boolean } | null = null;
    private max: number | null = null;
    private payload: any = null;
    private head = false;
    private one = false;
    private table: string;

    constructor(table: string) {
        this.table = table;
    }

    select(_columns?: string, options?: { count?: string; head?: boolean }) {
        if (options?.head) this.head = true;
        return this;
    }
    insert(rows: Row | Row[]) { this.op = 'insert'; this.payload = Array.isArray(rows) ? rows : [rows]; return this; }
    update(patch: Row) { this.op = 'update'; this.payload = patch; return this; }
    delete() { this.op = 'delete'; return this; }
    eq(column: string, value: unknown) { this.filters.push(row => row[column] === value); return this; }
    neq(column: string, value: unknown) { this.filters.push(row => row[column] !== value); return this; }
    in(column: string, values: unknown[]) { this.filters.push(row => values.includes(row[column])); return this; }
    gte(column: string, value: any) { this.filters.push(row => row[column] >= value); return this; }
    lte(column: string, value: any) { this.filters.push(row => row[column] <= value); return this; }
    order(column: string, options?: { ascending?: boolean }) { this.sort = { column, ascending: options?.ascending ?? true }; return this; }
    limit(count: number) { this.max = count; return this; }
    single() { this.one = true; return this; }
    maybeSingle() { this.one = true; return this; }

    private matches(row: Row) {
        return this.filters.every(f => f(row));
    }

    private finish(rows: Row[], count: number): Result {
        const data = rows.map(row => materialize(withRelations(this.table, row)));
        if (this.head) return { data: null, error: null, count };
        return { data: this.one ? (data[0] ?? null) : data, error: null, count };
    }

    private run(): Result {
        const table = this.table;

        if (this.op === 'insert') {
            const now = new Date().toISOString();
            const defaults = TABLE_DEFAULTS[table] ?? {};
            const inserted = (this.payload as Row[]).map(row => ({ id: newId(), created_at: now, ...defaults, ...row }));
            rowsOf(table).push(...inserted);
            emit(table);
            return this.finish(inserted, inserted.length);
        }

        if (this.op === 'update') {
            const targets = rowsOf(table).filter(row => this.matches(row));
            targets.forEach(row => Object.assign(row, this.payload));
            if (targets.length) emit(table);
            return this.finish(targets, targets.length);
        }

        if (this.op === 'delete') {
            const removed = rowsOf(table).filter(row => this.matches(row));
            db[table] = rowsOf(table).filter(row => !removed.includes(row));
            if (table === 'customers') {
                // same effect as ON DELETE CASCADE in schema.sql
                const ids = removed.map(row => row.id);
                for (const child of ['chatbot_conversations', 'appointments']) {
                    const before = rowsOf(child).length;
                    db[child] = rowsOf(child).filter(row => !ids.includes(row.customer_id));
                    if (db[child].length !== before) emit(child);
                }
            }
            if (removed.length) emit(table);
            return this.finish(removed, removed.length);
        }

        let rows = rowsOf(table).filter(row => this.matches(row));
        const count = rows.length;
        if (this.sort) {
            const { column, ascending } = this.sort;
            rows = [...rows].sort((a, b) => {
                const left = a[column] ?? '';
                const right = b[column] ?? '';
                const result = left < right ? -1 : left > right ? 1 : 0;
                return ascending ? result : -result;
            });
        }
        if (this.max !== null) rows = rows.slice(0, this.max);
        return this.finish(rows, count);
    }

    then<T1 = Result, T2 = never>(
        onfulfilled?: ((value: Result) => T1 | PromiseLike<T1>) | null,
        onrejected?: ((reason: unknown) => T2 | PromiseLike<T2>) | null
    ): PromiseLike<T1 | T2> {
        // small delay so loading states are visible, like a real round trip
        return new Promise<Result>(resolve => setTimeout(() => resolve(this.run()), 60)).then(onfulfilled, onrejected);
    }
}

function channel(name: string): DemoChannel {
    let existing = channels.get(name);
    if (!existing) {
        const created: DemoChannel = {
            name,
            handlers: [],
            on(_type, filter, cb) {
                created.handlers.push({ table: filter.table ?? '', cb });
                return created;
            },
            subscribe: () => created,
            unsubscribe: async () => {
                created.handlers = [];
                channels.delete(name);
                return 'ok';
            },
        };
        channels.set(name, created);
        existing = created;
    }
    return existing;
}

export const demoClient = {
    from: (table: string) => new DemoQuery(table),
    channel,
    removeChannel: (target: DemoChannel) => target.unsubscribe(),
};

const ALL_TABLES = ['customers', 'chatbot_conversations', 'call_analytics', 'appointments', 'notifications', 'urgent_callbacks'];

/** Throw away every change made in this browser session and start from the seed again. */
export function resetDemoData() {
    db = createDemoDb();
    incomingIndex = 0;
    ALL_TABLES.forEach(emit);
}

/**
 * Adds one scripted conversation as if it had just arrived from a channel webhook,
 * so the realtime feed can be seen moving. Returns false when the script is exhausted.
 */
export function simulateIncomingConversation(): boolean {
    const next = INCOMING[incomingIndex];
    if (!next) return false;
    incomingIndex += 1;

    const now = Date.now();
    const iso = (offsetMs = 0) => new Date(now - offsetMs).toISOString();
    const [first_name, last_name, phone] = next.customer;
    const customer = {
        id: newId(), first_name, last_name, phone, email: null,
        created_at: iso(), updated_at: iso(), last_interaction_date: iso(), total_interactions: 1, status: 'active',
    };
    db.customers.push(customer);

    const conversation = {
        id: newId(),
        customer_id: customer.id,
        platform_id: null,
        platform_type: next.platform,
        conversation_data: next.messages.map(([who, content], i) => ({
            role: who === 'u' ? 'user' : 'assistant', content, created_at: iso((next.messages.length - i) * 20_000),
        })),
        summary: next.summary,
        category_id: categoryId(next.category),
        status: next.status,
        collected_data: {},
        tags: [],
        priority: next.priority,
        created_at: iso(next.messages.length * 20_000),
        updated_at: iso(),
        first_message_at: iso(next.messages.length * 20_000),
        last_message_at: iso(),
        message_count: next.messages.length,
    };
    db.chatbot_conversations.push(conversation);

    const needsAction = next.category === 'callback' || next.category === 'urgent';
    db.notifications.push({
        id: newId(), user_id: null,
        type: needsAction ? 'urgent' : 'success',
        title: needsAction
            ? { tr: 'Yeni aksiyon bekleyen görüşme', en: 'New conversation needs action' }
            : { tr: 'Yeni görüşme tamamlandı', en: 'New conversation completed' },
        message: { tr: `${first_name} ${last_name}: ${next.summary.tr}`, en: `${first_name} ${last_name}: ${next.summary.en}` },
        link_url: null, is_read: false, is_archived: false, created_at: iso(), read_at: null,
    });

    ['customers', 'chatbot_conversations', 'notifications', 'urgent_callbacks'].forEach(emit);
    return true;
}
