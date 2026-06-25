import { Column, Heading, Meta, Schema } from "@once-ui-system/core";
import { Mailchimp } from "@/components";
import { Posts } from "@/components/blog/Posts";
import { baseURL } from "@/resources";
import { getPortfolioData } from "@/utils/portfolioData";

export async function generateMetadata() {
  const data = await getPortfolioData();
  return Meta.generate({
    title: data.blog.title,
    description: data.blog.description,
    baseURL: baseURL,
    image: `/api/og/generate?title=${encodeURIComponent(data.blog.title)}`,
    path: data.blog.path,
  });
}

export default async function Blog() {
  const portfolioData = await getPortfolioData();
  const { blog, person, newsletter } = portfolioData;
  return (
    <Column maxWidth="m" paddingTop="24">
      <Schema
        as="blogPosting"
        baseURL={baseURL}
        title={blog.title}
        description={blog.description}
        path={blog.path}
        image={`/api/og/generate?title=${encodeURIComponent(blog.title)}`}
        author={{
          name: person.name,
          url: `${baseURL}/blog`,
          image: (person.avatar && person.avatar.startsWith("http")) ? person.avatar : `${baseURL}${person.avatar || "/images/avatar.jpg"}`,
        }}
      />
      <Heading marginBottom="l" variant="heading-strong-xl" marginLeft="24">
        {blog.title}
      </Heading>
      <Column fillWidth flex={1} gap="40">
        <Posts range={[1, 1]} thumbnail person={person} />
        <Posts range={[2, 3]} columns="2" thumbnail direction="column" person={person} />
        <Mailchimp marginBottom="l" newsletter={newsletter} />
        <Heading as="h2" variant="heading-strong-xl" marginLeft="l">
          Earlier posts
        </Heading>
        <Posts range={[4]} columns="2" person={person} />
      </Column>
    </Column>
  );
}
