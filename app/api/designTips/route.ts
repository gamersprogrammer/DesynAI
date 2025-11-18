import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function GET() {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an expert UI/UX designer that shares concise, practical design improvement tips for modern apps.",
        },
        {
          role: "user",
          content:
            "Generate 3 short, actionable AI-driven design tips for improving user interfaces today. Respond as a JSON array with 'title' and 'description'.",
        },
      ],
      max_tokens: 250,
    });

    const raw = completion.choices[0].message?.content ?? "[]";
    const jsonMatch = raw.match(/\[([\s\S]*?)\]/);
    const tips = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(raw);

    return NextResponse.json({ tips });
  } catch (error) {
    console.error("Error fetching design tips:", error);
    return NextResponse.json(
      { error: "Failed to fetch design tips" },
      { status: 500 }
    );
  }
}
