import type { Bundle, Service } from './types'

export type ExpandedBundle = Bundle & { services: Service[] }

export function expandBundle(bundle: Bundle, allServices: Service[]): ExpandedBundle {
  const map = new Map(allServices.map((s) => [s.slug, s]))
  const services = bundle.serviceSlugs
    .map((slug) => map.get(slug))
    .filter((s): s is Service => Boolean(s))
  return { ...bundle, services }
}

