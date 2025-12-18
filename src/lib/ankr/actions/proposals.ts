import type { ActionName } from '@/lib/ankr/config'

export type ActionProposalPreset = {
  actions: Array<{ name: ActionName; weight: number }>
}

// Preset proposals aligned to common business/content fields
export const ACTION_PROPOSAL_PRESETS: Record<string, ActionProposalPreset> = {
  'Business Hours': {
    actions: [
      { name: 'UpdateSiteHours', weight: 0.9 },
      { name: 'PreviewChanges', weight: 0.7 },
    ],
  },
  'Pricing': {
    actions: [
      { name: 'CreateChangeRequest', weight: 0.8 },
      { name: 'PreviewChanges', weight: 0.7 },
    ],
  },
  'Phone Number': {
    actions: [
      { name: 'CreateChangeRequest', weight: 0.78 },
      { name: 'PreviewChanges', weight: 0.7 },
    ],
  },
  'Coupon/Promotion': {
    actions: [
      { name: 'CreateChangeRequest', weight: 0.76 },
      { name: 'PreviewChanges', weight: 0.7 },
    ],
  },
  'Gallery Photos': {
    actions: [
      { name: 'CreateChangeRequest', weight: 0.72 },
      { name: 'PreviewChanges', weight: 0.7 },
    ],
  },
}

