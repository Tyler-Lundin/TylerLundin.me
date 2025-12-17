// Forward-compat shim: re-export from the services source-of-truth module.
// Prefer importing from `@/services` directly in new code.
export type { Service } from '@/services'
export { services } from '@/services'
