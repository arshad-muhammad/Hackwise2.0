import React from 'react';

export default async function Head({ params }) {
  const id = params?.id;
  let memberName = '';
  let memberRole = '';

  try {
    if (id) {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/committee-members/${id}`, {
        // Ensure this can be cached at build-time but also revalidated
        next: { revalidate: 60 },
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.member) {
          memberName = data.member.name || '';
          memberRole = data.member.role || '';
        }
      }
    }
  } catch (e) {
    // fail silently and fall back to generic title
  }

  const hasName = memberName && memberName.trim().length > 0;
  const title = hasName
    ? `Hackwise 2.0 | ${memberName} – ${memberRole || 'Organizing Committee'}`
    : id
    ? `Hackwise 2.0 | Committee Member #${id}`
    : 'Hackwise 2.0 | Committee Member Portfolio';

  const description = hasName
    ? `Explore the portfolio of ${memberName}${
        memberRole ? ` – ${memberRole}` : ''
      } at Hackwise 2.0: experience, projects, skills, achievements, and more from the organizing committee.`
    : 'Discover the detailed portfolio of a Hackwise 2.0 organizing committee member – including role, experience, projects, skills, achievements, and more.';

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="robots" content="index,follow" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="profile" />
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
    </>
  );
}


