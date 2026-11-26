-- =====================================================================
-- 05_public_api.sql  |  One read-only call for the public portfolio site
-- Run after 01-04 in Supabase SQL Editor (safe to re-run).
-- The function runs with the CALLER's rights (security invoker), so row
-- level security still applies; it also filters on `visible` itself and
-- returns an explicit column whitelist (never `select *`).
-- =====================================================================

create or replace function public.get_site_content()
returns jsonb
language sql stable security invoker
set search_path = public
as $$
  select jsonb_build_object(
    'version',
      (select version from public.content_version where id = 1),
    'settings',
      (select jsonb_build_object(
          'logo_text', s.logo_text, 'brand_name', s.brand_name,
          'nav_cta_label', s.nav_cta_label, 'hero', s.hero,
          'footer', s.footer, 'theme', s.theme, 'seo', s.seo)
         from public.site_settings s where s.id = 1),
    'profile',
      (select jsonb_build_object(
          'full_name', p.full_name, 'headline', p.headline, 'summary', p.summary,
          'email', p.email, 'phone', p.phone, 'location', p.location,
          'avatar_url', p.avatar_url, 'resume_url', p.resume_url)
         from public.public_profile p limit 1),
    'sections',
      coalesce((select jsonb_agg(jsonb_build_object(
          'id', x.id, 'slug', x.slug, 'type', x.type, 'nav_label', x.nav_label,
          'eyebrow', x.eyebrow, 'title', x.title, 'subtitle', x.subtitle,
          'content', x.content, 'position', x.position, 'show_in_nav', x.show_in_nav)
          order by x.position)
         from public.sections x where x.visible), '[]'::jsonb),
    'social_links',
      coalesce((select jsonb_agg(jsonb_build_object(
          'id', x.id, 'label', x.label, 'url', x.url, 'icon', x.icon)
          order by x.position)
         from public.social_links x where x.visible), '[]'::jsonb),
    'overview_rows',
      coalesce((select jsonb_agg(jsonb_build_object(
          'id', x.id, 'label', x.label, 'value', x.value) order by x.position)
         from public.overview_rows x where x.visible), '[]'::jsonb),
    'competencies',
      coalesce((select jsonb_agg(jsonb_build_object(
          'id', x.id, 'text', x.text) order by x.position)
         from public.competencies x where x.visible), '[]'::jsonb),
    'skill_domains',
      coalesce((select jsonb_agg(jsonb_build_object(
          'id', x.id, 'title', x.title, 'tools', x.tools, 'status', x.status)
          order by x.position)
         from public.skill_domains x where x.visible), '[]'::jsonb),
    'projects',
      coalesce((select jsonb_agg(jsonb_build_object(
          'id', x.id, 'kicker', x.kicker, 'title', x.title, 'summary', x.summary,
          'outcome', x.outcome, 'tagline', x.tagline, 'bullets', x.bullets,
          'tech', x.tech, 'github_url', x.github_url, 'live_url', x.live_url,
          'cover_url', x.cover_url, 'files', x.files, 'featured', x.featured)
          order by x.position)
         from public.projects x where x.visible), '[]'::jsonb),
    'education',
      coalesce((select jsonb_agg(jsonb_build_object(
          'id', x.id, 'degree', x.degree, 'institution', x.institution,
          'score_label', x.score_label, 'score', x.score, 'note', x.note)
          order by x.position)
         from public.education x where x.visible), '[]'::jsonb),
    'certifications',
      coalesce((select jsonb_agg(jsonb_build_object(
          'id', x.id, 'title', x.title, 'issuer', x.issuer,
          'start_date', x.start_date, 'end_date', x.end_date,
          'credential_url', x.credential_url, 'featured', x.featured)
          order by x.position)
         from public.certifications x where x.visible), '[]'::jsonb),
    'publications',
      coalesce((select jsonb_agg(jsonb_build_object(
          'id', x.id, 'title', x.title, 'venue', x.venue,
          'published_on', x.published_on, 'summary', x.summary,
          'reference', x.reference, 'url', x.url) order by x.position)
         from public.publications x where x.visible), '[]'::jsonb)
  );
$$;

revoke execute on function public.get_site_content() from public;
grant  execute on function public.get_site_content() to anon, authenticated;
