import { useEffect, useMemo } from 'react'
import { Hero } from '../components/Hero'
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
    <>
      <Hero />
      {orderedSections.map((section, idx) => (
        <RegisteredSection
          key={section.id}
          section={section}
          displayNumber={String(idx + 1).padStart(2, '0')}
        />
      ))}
    </>
  )
}

export default PortfolioHomePage
