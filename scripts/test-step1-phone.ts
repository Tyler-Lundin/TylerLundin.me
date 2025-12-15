import { runStep1 } from '../src/lib/ankr/step1'

async function main() {
  const message = 'shows 509-555-0101 but it should be 509-555-0199'
  const res = await runStep1({ message })
  const ma: any = res.messageAnalysis as any
  const changes = Array.isArray(ma.changes) ? ma.changes : []
  const phoneChange = changes.find((c: any) => c.field === 'Phone Number')
  if (!phoneChange) {
    console.error('FAIL: No Phone Number change extracted.', { changes })
    process.exit(1)
  }
  const { current, desired, polarity } = phoneChange
  if (current !== '509-555-0101' || desired !== '509-555-0199') {
    console.error('FAIL: Extracted phone change mismatch.', { current, desired, polarity })
    process.exit(1)
  }
  const ccr = (ma.actionProposals || []).find((p: any) => p.name === 'CreateChangeRequest')
  if (!ccr || !Array.isArray(ccr.args?.changes) || ccr.args.changes.length === 0) {
    console.error('FAIL: CreateChangeRequest missing changes[] in args.', { ccr })
    process.exit(1)
  }
  console.log('PASS: Phone number extraction and CreateChangeRequest changes[] are correct.')
}

main().catch((err) => { console.error(err); process.exit(1) })

