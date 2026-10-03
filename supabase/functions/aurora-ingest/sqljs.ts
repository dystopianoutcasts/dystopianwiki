// sql.js loader for aurora-ingest, with the wasm bytes read asynchronously.
//
// Called with no `wasmBinary`, npm:sql.js@1.14.2's loader takes its Node branch
// and reads dist/sql-wasm.wasm (658,410 bytes) with fs.readFileSync inside an
// async callback. The edge runtime logs every run, at error level, "WARNING: Do
// not use Deno.readFileSync inside the async callback ... will be disallowed in
// the future". Harmless while it is only a warning; the day it is disallowed
// players.db stops being read. So the bytes are found and read here with
// Deno.readFile, and handed to init({ wasmBinary }), which skips the loader's read.
//
// Two ways to find the file are tried, first that works (T60 Do step 3):
//   'require.resolve'      createRequire(import.meta.url).resolve(...) from node:module
//   'import.meta.resolve'  import.meta.resolve('npm:sql.js@1.14.2/...'), a file: URL
//                          when the npm package lives on a file system
// Neither needs a supabase/config.toml static_files entry: the file is the npm
// package's own, which the deploy already bundles (the loader reads it today). If
// both fail, the loader is called as before ('loader') and the warning stays; the
// `wasm` field of the run's playersdb log line says which way was taken.
//
// Loaded lazily, like ssh2 in sftp.ts, so a load failure is a catchable error
// with its message rather than a dead function at boot.

import { createRequire } from 'node:module';
import type { SqlJsStatic } from '../../../packages/shared/aurora/playersdb.ts';

export type WasmSource = 'require.resolve' | 'import.meta.resolve' | 'loader';

export interface LoadedSqlJs {
  SQL: SqlJsStatic;
  wasm: WasmSource;
}

const SQL_JS_WASM = 'sql.js/dist/sql-wasm.wasm';
const SQL_JS_WASM_NPM = 'npm:sql.js@1.14.2/dist/sql-wasm.wasm';

let loaded: Promise<LoadedSqlJs> | null = null;

/** The wasm bytes and how they were found, or null when neither way works here. */
export async function readSqlJsWasm(): Promise<{ bytes: Uint8Array; wasm: WasmSource } | null> {
  try {
    const path = createRequire(import.meta.url).resolve(SQL_JS_WASM);
    return { bytes: await Deno.readFile(path), wasm: 'require.resolve' };
  } catch {
    // fall through to the next way
  }
  try {
    const url = new URL(import.meta.resolve(SQL_JS_WASM_NPM));
    if (url.protocol === 'file:') return { bytes: await Deno.readFile(url), wasm: 'import.meta.resolve' };
  } catch {
    // fall through to the loader's own read
  }
  return null;
}

async function load(): Promise<LoadedSqlJs> {
  const mod = await import('npm:sql.js@1.14.2');
  const init = (mod.default ?? mod) as (cfg?: unknown) => Promise<SqlJsStatic>;
  const found = await readSqlJsWasm();
  if (found !== null) {
    return { SQL: await init({ wasmBinary: found.bytes }), wasm: found.wasm };
  }
  return { SQL: await init(), wasm: 'loader' };
}

/** sql.js, initialised once per isolate. A failed load is retried on the next call. */
export function loadSqlJs(): Promise<LoadedSqlJs> {
  if (!loaded) {
    loaded = load().catch((err) => {
      loaded = null;
      throw err;
    });
  }
  return loaded;
}
