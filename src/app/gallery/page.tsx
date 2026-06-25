import { Flex, Meta, Schema } from "@once-ui-system/core";
import GalleryView from "@/components/gallery/GalleryView";
import { baseURL } from "@/resources";
import { getPortfolioData } from "@/utils/portfolioData";

export async function generateMetadata() {
  const data = await getPortfolioData();
  return Meta.generate({
    title: data.gallery.title,
    description: data.gallery.description,
    baseURL: baseURL,
    image: `/api/og/generate?title=${encodeURIComponent(data.gallery.title)}`,
    path: data.gallery.path,
  });
}

export default async function Gallery() {
  const portfolioData = await getPortfolioData();
  const { gallery, person } = portfolioData;
  return (
    <Flex maxWidth="l">
      <Schema
        as="webPage"
        baseURL={baseURL}
        title={gallery.title}
        description={gallery.description}
        path={gallery.path}
        image={`/api/og/generate?title=${encodeURIComponent(gallery.title)}`}
        author={{
          name: person.name,
          url: `${baseURL}${gallery.path}`,
          image: (person.avatar && person.avatar.startsWith("http")) ? person.avatar : `${baseURL}${person.avatar || "/images/avatar.jpg"}`,
        }}
      />
      <GalleryView gallery={gallery} />
    </Flex>
  );
}
