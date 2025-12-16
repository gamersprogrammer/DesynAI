import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { prompt, mode = "text" } = await req.json();

    let systemPrompt = "";
    if (mode === "code") {
      systemPrompt = `
        You are a skilled frontend engineer. Generate production-ready code based on the user's request.
        Use clean, commented, and readable syntax.
        If HTML/CSS/JS is requested, return only the code — no explanations.
      `;
    } else {
      systemPrompt = `
        You are a creative AI designer. Generate clear, structured, and visual design ideas from text prompts.
      `;
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
    });

    const result = completion.choices[0].message.content;
    return NextResponse.json({ result });
  } catch (error) {
    console.error("OpenAI Error:", error);
    return NextResponse.json({ error: "Failed to generate response." }, { status: 500 });
  }
}
