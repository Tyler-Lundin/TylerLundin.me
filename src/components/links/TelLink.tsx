'use client'

import { track } from '@vercel/analytics'

function normalizeTel(phone: string) {
  return phone.replace(/[^+\d]/g, '')
}

export default function TelLink({ phone, label }: { phone: string; label?: string }) {
  const href = `tel:${normalizeTel(phone)}`
  const text = label || phone
  return (
    <a
      href={href}
      onClick={() => {
        try { track('tel_click', { page: 'spokane-web-developer', phone }) } catch {}
      }}
      className="underline"
    >
      {text}
    </a>
  )
}

