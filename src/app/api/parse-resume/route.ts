import { NextRequest, NextResponse } from "next/server";
import { PDFParse } from "pdf-parse";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    const parser = new PDFParse({ data: buffer });
    const pdfData = await parser.getText();
    const text = pdfData.text;
    await parser.destroy();

    const parsedData: any = {
      person: {},
      skills: [],
      experiences: [],
      education: []
    };

    const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    if (emailMatch) {
      parsedData.person.email = emailMatch[0];
    }

    const linkedInMatch = text.match(/linkedin\.com\/in\/([a-zA-Z0-9-]+)/i);
    if (linkedInMatch) {
      parsedData.person.linkedIn = `https://www.linkedin.com/in/${linkedInMatch[1]}`;
    }

    const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
    if (lines.length > 0) {
      for (const line of lines) {
        if (line.length > 2 && line.length < 50 && !/contact|resume|curriculum|cv|summary|skills|experience/i.test(line)) {
          parsedData.person.name = line;
          const nameParts = line.split(/\s+/);
          parsedData.person.firstName = nameParts[0] || "";
          parsedData.person.lastName = nameParts.slice(1).join(" ") || "";
          break;
        }
      }
    }

    const commonSkills = [
      "React", "Node", "MongoDB", "Express", "TypeScript", "JavaScript", "Python", "Java", "C++",
      "Next.js", "Docker", "AWS", "Firebase", "SQL", "Git", "HTML", "CSS", "UI/UX", "IoT", "Power BI",
      "n8n", "LLM", "Prompt Engineering", "Canva", "Microcontrollers", "Data Science", "Data Analytics"
    ];
    for (const skill of commonSkills) {
      const escaped = skill.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      if (new RegExp(`\\b${escaped}\\b`, "i").test(text)) {
        parsedData.skills.push(skill);
      }
    }

    const experienceKeywords = ["KIET SMARTCITY LAB", "MENTNEO", "Unified Mentor", "Emertxe"];
    experienceKeywords.forEach(comp => {
      if (text.toUpperCase().includes(comp.toUpperCase())) {
        const idx = text.toUpperCase().indexOf(comp.toUpperCase());
        const snippet = text.substring(idx, idx + 600);
        const snippetLines = snippet.split("\n").map(l => l.trim()).filter(Boolean);
        if (snippetLines.length > 1) {
          const company = comp;
          let role = snippetLines[1];
          let timeframe = "2025 - Present";
          const dateMatch = snippet.match(/(?:January|February|March|April|May|June|July|August|September|October|November|December|\b[0-9]{4}\b).+?Present|.+?(?:1 year|month|months)/i);
          if (dateMatch) {
            timeframe = dateMatch[0].trim();
          }
          parsedData.experiences.push({
            company,
            role,
            timeframe,
            achievements: snippetLines.slice(2, 6).filter(l => l.length > 15)
          });
        }
      }
    });

    return NextResponse.json(parsedData, { status: 200 });

  } catch (error: any) {
    console.error("parse-resume error:", error);
    return NextResponse.json({ error: error.message || "Failed to parse PDF resume" }, { status: 500 });
  }
}
