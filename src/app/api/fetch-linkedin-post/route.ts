import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const urlString = request.nextUrl.searchParams.get("url");
    if (!urlString) {
      return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
    }

    const parsedUrl = new URL(urlString);
    if (!parsedUrl.hostname.includes("linkedin.com")) {
      return NextResponse.json({ error: "Only LinkedIn links are allowed" }, { status: 400 });
    }

    const res = await fetch(urlString, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
      },
    });

    if (!res.ok) {
      return NextResponse.json({ error: `Failed to fetch from LinkedIn: ${res.status}` }, { status: 500 });
    }

    const html = await res.text();

    function decodeHTMLEntities(text: string): string {
      if (!text) return "";
      return text
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'")
        .replace(/&#39;/g, "'")
        .replace(/&nbsp;/g, " ");
    }

    const getMetaTag = (property: string): string => {
      const match = html.match(new RegExp(`<meta[^>]*property=["']${property}["'][^>]*content=["']([^"']+)["']`, 'i')) ||
                    html.match(new RegExp(`<meta[^>]*content=["']([^"']+)["'][^>]*property=["']${property}["']`, 'i')) ||
                    html.match(new RegExp(`<meta[^>]*name=["']${property}["'][^>]*content=["']([^"']+)["']`, 'i'));
      return match ? match[1] : "";
    };

    const title = decodeHTMLEntities(getMetaTag("og:title") || getMetaTag("title") || "LinkedIn Post Project");
    const description = decodeHTMLEntities(getMetaTag("og:description") || "Project imported from LinkedIn post.");
    const image = decodeHTMLEntities(getMetaTag("og:image") || "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800");

    return NextResponse.json({
      title: title.replace(/ \| LinkedIn/i, "").trim(),
      description: description.trim(),
      image,
      url: urlString,
    }, { status: 200 });

  } catch (error: any) {
    console.error("fetch-linkedin-post error:", error);
    return NextResponse.json({ error: error.message || "Failed to process LinkedIn post" }, { status: 500 });
  }
}
