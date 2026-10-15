import { useRef } from 'react'
import { useScrollReveal } from '@/hooks/useScrollReveal'
import { Hero } from './sections/Hero'
import { Manifesto } from './sections/Manifesto'
import { DemoShowcase } from './sections/DemoShowcase'
import { HowItWorks } from './sections/HowItWorks'
import { Features } from './sections/Features'
import { Pricing } from './sections/Pricing'
import { Faq } from './sections/Faq'
import { FinalCta } from './sections/FinalCta'

export default function LandingPage() {
  const ref = useRef<HTMLDivElement>(null)
  useScrollReveal(ref)
  return (
    <div ref={ref}>
      <Hero />
      <Manifesto />
      <DemoShowcase />
      <HowItWorks />
      <Features />
      <Pricing />
      <Faq />
      <FinalCta />
    </div>
  )
}
