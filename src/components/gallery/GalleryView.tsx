"use client";

import { Media, MasonryGrid } from "@once-ui-system/core";
import { gallery as staticGallery } from "@/resources";

interface GalleryViewProps {
  gallery?: typeof staticGallery;
}

export default function GalleryView({ gallery: propGallery }: GalleryViewProps) {
  const gallery = propGallery || staticGallery;
  return (
    <MasonryGrid columns={2} s={{ columns: 1 }}>
      {gallery.images.map((image, index) => (
        <Media
          enlarge
          priority={index < 10}
          sizes="(max-width: 560px) 100vw, 50vw"
          key={index}
          radius="m"
          aspectRatio={image.orientation === "horizontal" ? "16 / 9" : "3 / 4"}
          src={image.src}
          alt={image.alt}
        />
      ))}
    </MasonryGrid>
  );
}
