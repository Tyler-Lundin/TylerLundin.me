// A tiny adapter that prefers real zod if installed, otherwise falls back to a
// minimal, zod-like validator used only for runtime input checks.

type SafeParseResult<T> = { success: true; data: T } | { success: false; error: { message: string } }

function lite_string() {
  return {
    _type: 'string',
    optional() { const base = this; return { ...base, _optional: true } },
    min(n: number) { const base = this; return { ...base, _min: n } },
    default(v: string) { const base = this; return { ...base, _default: v } },
    parse(v: any) { if (v == null) throw new Error('Required'); if (typeof v !== 'string') throw new Error('Expected string'); return v },
  }
}

function lite_number() {
  return {
    _type: 'number',
    optional() { const base = this; return { ...base, _optional: true } },
    min(n: number) { const base = this; return { ...base, _min: n } },
    max(n: number) { const base = this; return { ...base, _max: n } },
    parse(v: any) { if (v == null) throw new Error('Required'); if (typeof v !== 'number' || Number.isNaN(v)) throw new Error('Expected number'); return v },
  }
}

function lite_boolean() {
  return {
    _type: 'boolean',
    optional() { const base = this; return { ...base, _optional: true } },
    parse(v: any) { if (v == null) throw new Error('Required'); if (typeof v !== 'boolean') throw new Error('Expected boolean'); return v },
  }
}

function lite_enum(vals: string[]) {
  return {
    _type: 'enum',
    _vals: vals,
    optional() { const base = this; return { ...base, _optional: true } },
    parse(v: any) { if (v == null) throw new Error('Required'); if (!vals.includes(String(v))) throw new Error('Invalid enum'); return String(v) },
  }
}

function lite_array(of: any) {
  return {
    _type: 'array',
    _of: of,
    optional() { const base = this; return { ...base, _optional: true } },
    nonempty() { const base = this; return { ...base, _nonempty: true } },
    parse(v: any) {
      const self: any = this as any
      if (!Array.isArray(v)) throw new Error('Expected array')
      if (self._nonempty && v.length === 0) throw new Error('Array must be non-empty')
      return v.map((x) => (self._of?.parse ? self._of.parse(x) : x))
    },
  }
}

function lite_object(shape: Record<string, any>) {
  return {
    _type: 'object',
    _shape: shape,
    _passthrough: false as boolean,
    _optional: false as boolean,
    passthrough() { const base = this as any; base._passthrough = true; return base },
    partial() { return this },
    optional() { const base = this as any; base._optional = true; return base },
    parse(v: any) {
      const self: any = this as any
      if (typeof v !== 'object' || v == null || Array.isArray(v)) throw new Error('Expected object')
      // If requested passthrough or shape is empty, accept any object as-is
      if (self._passthrough || !shape || Object.keys(shape).length === 0) return v
      const out: any = {}
      for (const k of Object.keys(shape)) {
        const s = shape[k]
        const has = Object.prototype.hasOwnProperty.call(v, k)
        if (!has) {
          if (s && s._optional) continue
          if (s && s._default !== undefined) { out[k] = s._default; continue }
          throw new Error(`Missing ${k}`)
        }
        try { out[k] = s.parse ? s.parse((v as any)[k]) : (v as any)[k] } catch (e: any) { throw new Error(`${k}: ${e?.message || 'invalid'}`) }
      }
      return out
    },
    safeParse(v: any): SafeParseResult<any> {
      try { return { success: true, data: this.parse(v) } } catch (e: any) { return { success: false, error: { message: String(e?.message || 'Invalid') } } }
    },
  }
}

function lite_safeParse<T>(schema: any, v: any): SafeParseResult<T> {
  if (schema && schema.safeParse) return schema.safeParse(v)
  try { return { success: true, data: schema.parse(v) } } catch (e: any) { return { success: false, error: { message: String(e?.message || 'Invalid') } } }
}

export type Z = {
  string: typeof lite_string
  number: typeof lite_number
  boolean: typeof lite_boolean
  enum: typeof lite_enum
  array: typeof lite_array
  object: typeof lite_object
  safeParse: typeof lite_safeParse
}

const lite: Z = { string: lite_string, number: lite_number, boolean: lite_boolean, enum: lite_enum, array: lite_array, object: lite_object, safeParse: lite_safeParse }

let cached: any = null
export async function getZ(): Promise<Z> {
  if (cached) return cached
  // Attempt dynamic import of real zod without bundler resolution issues.
  try {
    const dynamicImport = new Function('m', 'return import(m)')
    const mod: any = await (dynamicImport as any)('zod')
    cached = { ...mod.z, safeParse: (schema: any, v: any) => schema.safeParse(v) }
    return cached
  } catch {
    cached = lite
    return cached
  }
}
