import { Column, Heading, Meta, Schema } from "@once-ui-system/core";
import { baseURL } from "@/resources";
import { Projects } from "@/components/work/Projects";
import { getPortfolioData } from "@/utils/portfolioData";

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  const data = await getPortfolioData();
  return Meta.generate({
    title: data.work.title,
    description: data.work.description,
    baseURL: baseURL,
    image: `/api/og/generate?title=${encodeURIComponent(data.work.title)}`,
    path: data.work.path,
  });
}

export default async function Work() {
  const portfolioData = await getPortfolioData();
  const { work, person, about } = portfolioData;
  return (
    <Column maxWidth="m" paddingTop="24">
      <Schema
        as="webPage"
        baseURL={baseURL}
        path={work.path}
        title={work.title}
        description={work.description}
        image={`/api/og/generate?title=${encodeURIComponent(work.title)}`}
        author={{
          name: person.name,
          url: `${baseURL}${about.path}`,
          image: (person.avatar && person.avatar.startsWith("http")) ? person.avatar : `${baseURL}${person.avatar || "/images/avatar.jpg"}`,
        }}
      />
      <Heading marginBottom="l" variant="heading-strong-xl" align="center">
        {work.title}
      </Heading>
      <Projects />
    </Column>
  );
}
