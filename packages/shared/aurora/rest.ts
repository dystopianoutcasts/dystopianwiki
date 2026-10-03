// Minimal PostgREST client for the `aurora` schema, shared by the ingest Edge
// Function (Deno) and the backfill CLI (tsx). `fetch` only, no runtime-specific
// APIs, so it behaves identically in both.
//
// It exists so the profile headers live in exactly one place. `aurora` is not
// PostgREST's default schema, so every request must carry Accept-Profile (reads)
// or Content-Profile (writes); omit one and PostgREST looks in `public` and
// answers 404 "Could not find the table". Writing that by hand twice is how the
// backfill ends up silently pointed at the wrong schema.

export type Row = Record<string, unknown>;

/** Options of AuroraRest.upsert. */
export interface UpsertOptions {
  /** On a key conflict keep the stored row (resolution=ignore-duplicates). */
  ignoreDuplicates?: boolean;
}

export interface RestOptions {
  /** Project URL, with or without a trailing slash. */
  url: string;
  /**
   * Service key. On a project with legacy API keys disabled this must be the
   * secret key (sb_secret_...); the legacy service_role JWT is rejected.
   */
  serviceKey: string;
  schema?: string;
  fetchImpl?: typeof fetch;
}

export class AuroraRest {
  private readonly base: string;
  private readonly schema: string;
  private readonly doFetch: typeof fetch;

  constructor(private opts: RestOptions) {
    this.base = `${opts.url.replace(/\/+$/, '')}/rest/v1`;
    this.schema = opts.schema ?? 'aurora';
    this.doFetch = opts.fetchImpl ?? fetch;
  }

  private headers(extra: Record<string, string>): Record<string, string> {
    return {
      apikey: this.opts.serviceKey,
      Authorization: `Bearer ${this.opts.serviceKey}`,
      'Content-Type': 'application/json',
      ...extra,
    };
  }

  private async check(res: Response, what: string): Promise<void> {
    if (res.ok) return;
    const body = (await res.text()).slice(0, 300);
    throw new Error(`${what}: ${res.status} ${body}`);
  }

  /**
   * Insert, merging on conflict when `onConflict` names the key columns.
   * Pass an empty string for append-only tables such as player_position_history.
   * `ignoreDuplicates` skips conflicting rows instead of merging them (034's
   * kill_events, whose key is the event itself).
   */
  async upsert(table: string, rows: Row[], onConflict: string, opts?: UpsertOptions): Promise<void> {
    if (rows.length === 0) return;
    const qs = onConflict ? `?on_conflict=${encodeURIComponent(onConflict)}` : '';
    const resolution = opts?.ignoreDuplicates === true ? 'ignore-duplicates' : 'merge-duplicates';
    const res = await this.doFetch(`${this.base}/${table}${qs}`, {
      method: 'POST',
      headers: this.headers({
        'Content-Profile': this.schema,
        Prefer: onConflict
          ? `resolution=${resolution},return=minimal`
          : 'return=minimal',
      }),
      body: JSON.stringify(rows),
    });
    await this.check(res, `upsert ${table}`);
  }

  async select<T = unknown>(path: string): Promise<T[]> {
    const res = await this.doFetch(`${this.base}/${path}`, {
      headers: this.headers({ 'Accept-Profile': this.schema }),
    });
    await this.check(res, `select ${path}`);
    return (await res.json()) as T[];
  }

  async patch(path: string, body: Row): Promise<void> {
    const res = await this.doFetch(`${this.base}/${path}`, {
      method: 'PATCH',
      headers: this.headers({ 'Content-Profile': this.schema, Prefer: 'return=minimal' }),
      body: JSON.stringify(body),
    });
    await this.check(res, `patch ${path}`);
  }

  async delete(path: string): Promise<void> {
    const res = await this.doFetch(`${this.base}/${path}`, {
      method: 'DELETE',
      headers: this.headers({ 'Content-Profile': this.schema, Prefer: 'return=minimal' }),
    });
    await this.check(res, `delete ${path}`);
  }

  /** Returns the function's JSON result (a scalar function answers a bare `true`), or null for an empty body. */
  async rpc(fn: string, args: Row): Promise<unknown> {
    const res = await this.doFetch(`${this.base}/rpc/${fn}`, {
      method: 'POST',
      headers: this.headers({ 'Content-Profile': this.schema }),
      body: JSON.stringify(args),
    });
    await this.check(res, `rpc ${fn}`);
    const text = await res.text();
    return text === '' ? null : JSON.parse(text);
  }
}

/**
 * PostgREST list literal. Every value is quoted and escaped, because a PZ
 * username is free text and an unquoted comma or quote silently changes which
 * rows a filter matches.
 */
export function inList(values: string[]): string {
  const quoted = values.map((v) => `"${v.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`);
  return `(${quoted.join(',')})`;
}
