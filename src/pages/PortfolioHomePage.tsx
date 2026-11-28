import { useEffect, useMemo } from 'react'
import { Hero } from '../components/Hero'
import { ParallaxOrb } from '../components/ParallaxOrb'
import { RegisteredSection } from '../components/sections/SectionRegistry'
import { useContent } from '../context/contentContext'

export function PortfolioHomePage() {
  const { content } = useContent()

  useEffect(() => {
    const title =
      content.settings.seo.title?.trim() || content.settings.brand_name.trim() || 'Portfolio'
    document.title = title
  }, [content.settings.brand_name, content.settings.seo.title])

  const orderedSections = useMemo(
    () => [...content.sections].sort((a, b) => a.position - b.position),
    [content.sections],
  )

  return (
    <div className="relative overflow-x-clip">
      <ParallaxOrb depth={0.14} size="lg" positionClass="top-[28rem] -right-48" />
      <ParallaxOrb depth={0.22} size="md" positionClass="top-[95rem] -left-44" />
      <ParallaxOrb depth={0.18} size="sm" positionClass="bottom-72 -right-32" />
      <Hero />
      {orderedSections.map((section, idx) => (
        <RegisteredSection
          key={section.id}
          section={section}
          displayNumber={String(idx + 1).padStart(2, '0')}
        />
      ))}
    </div>
  )
}

export default PortfolioHomePage
