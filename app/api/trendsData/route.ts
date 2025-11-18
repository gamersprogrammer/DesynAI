import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function GET() {
  try {
    // Use OpenAI to fetch trending design patterns dynamically
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an AI that provides current UI/UX trend analysis with numerical data for visualization.",
        },
        {
          role: "user",
          content:
            "Generate a JSON array of monthly AI design trend data with 'month' and 'usage' fields for visualization. Base it on design popularity growth patterns from the past six months.",
        },
      ],
      max_tokens: 200,
    });

    // Try to parse AI's response as JSON
    let data;
    try {
      data = JSON.parse(completion.choices[0].message?.content ?? "[]");
    } catch {
      // Fallback simulated data if AI response isn’t JSON
      data = [
        { month: "May", usage: 40 },
        { month: "Jun", usage: 55 },
        { month: "Jul", usage: 70 },
        { month: "Aug", usage: 90 },
        { month: "Sep", usage: 110 },
        { month: "Oct", usage: 130 },
      ];
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error fetching OpenAI trend data:", error);
    return NextResponse.json(
      { error: "Failed to fetch trend data" },
      { status: 500 }
    );
  }
  
}
