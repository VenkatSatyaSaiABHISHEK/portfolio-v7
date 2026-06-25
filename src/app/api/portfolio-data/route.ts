import { NextRequest, NextResponse } from "next/server";
import { getPortfolioData, savePortfolioData } from "@/utils/portfolioData";
import * as cookie from "cookie";

export async function GET() {
  try {
    const data = await getPortfolioData();
    return NextResponse.json(data, {
      status: 200,
      headers: {
        "Cache-Control": "no-store, max-age=0, must-revalidate",
      },
    });
  } catch (error) {
    console.error("GET /api/portfolio-data failed:", error);
    return NextResponse.json({ error: "Failed to fetch portfolio data" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieHeader = request.headers.get("cookie") || "";
    const cookies = cookie.parse(cookieHeader);

    if (cookies.authToken !== "authenticated") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const result = await savePortfolioData(data);

    if (result.success) {
      return NextResponse.json({ success: true }, { status: 200 });
    } else {
      return NextResponse.json({ error: result.error || "Failed to save portfolio data" }, { status: 500 });
    }
  } catch (error) {
    console.error("POST /api/portfolio-data failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
