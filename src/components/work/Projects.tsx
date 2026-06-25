import { getPosts } from "@/utils/utils";
import { Column } from "@once-ui-system/core";
import { ProjectCard } from "@/components";
import { getPortfolioData } from "@/utils/portfolioData";

interface ProjectsProps {
  range?: [number, number?];
  exclude?: string[];
}

export async function Projects({ range, exclude }: ProjectsProps) {
  let allMDXProjects = getPosts(["src", "app", "work", "projects"]);
  const data = await getPortfolioData();
  const dbProjects = data.projects || [];

  const formattedDbProjects = dbProjects.map((proj: any) => ({
    slug: proj.slug,
    content: proj.content || "",
    metadata: {
      title: proj.metadata?.title || "",
      summary: proj.metadata?.summary || "",
      image: proj.metadata?.image || "",
      images: proj.metadata?.images || [],
      tag: proj.metadata?.tag || "",
      team: proj.metadata?.team || [],
      link: proj.metadata?.link || "",
      publishedAt: proj.metadata?.publishedAt || new Date().toISOString()
    }
  }));

  const mdxFiltered = allMDXProjects.filter(p => !formattedDbProjects.some(dbP => dbP.slug === p.slug));
  let allProjects = [...formattedDbProjects, ...mdxFiltered];

  // Exclude by slug (exact match)
  if (exclude && exclude.length > 0) {
    allProjects = allProjects.filter((post) => !exclude.includes(post.slug));
  }

  const sortedProjects = allProjects.sort((a, b) => {
    return new Date(b.metadata.publishedAt).getTime() - new Date(a.metadata.publishedAt).getTime();
  });

  const displayedProjects = range
    ? sortedProjects.slice(range[0] - 1, range[1] ?? sortedProjects.length)
    : sortedProjects;

  return (
    <Column fillWidth gap="xl" marginBottom="40" paddingX="l">
      {displayedProjects.map((post, index) => (
        <ProjectCard
          priority={index < 2}
          key={post.slug}
          href={`/work/${post.slug}`}
          images={post.metadata.images}
          title={post.metadata.title}
          description={post.metadata.summary}
          content={post.content}
          avatars={post.metadata.team?.map((member: any) => ({ src: member.avatar || "/images/avatar.jpg" })) || []}
          link={post.metadata.link || ""}
        />
      ))}
    </Column>
  );
}
