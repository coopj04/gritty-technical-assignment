import OpenAI from "openai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type PromptRequest = { prompt: string };
type PromptResponse =
  | { ok: true; output: string }
  | { ok: false; error: string };

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  try {
    // sanity check without printing the key
    console.log("OPENAI_API_KEY present?", Boolean(process.env.OPENAI_API_KEY));

    const body = (await req.json()) as PromptRequest;
    const prompt = body?.prompt?.trim();

    if (!prompt) {
      return NextResponse.json<PromptResponse>(
        { ok: false, error: "Prompt cannot be empty." },
        { status: 400 }
      );
    }

    const response = await client.responses.create({
      model: "gpt-5.2",
      input: prompt,
    });

    return NextResponse.json<PromptResponse>({
      ok: true,
      output: response.output_text ?? "",
    });
  } catch (err: unknown) {
    console.error("OpenAI error:", err);

    if (err instanceof OpenAI.APIError) {
      return NextResponse.json<PromptResponse>(
        { ok: false, error: `${err.status}: ${err.message}` },
        { status: err.status ?? 500 }
      );
    }

    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json<PromptResponse>(
      { ok: false, error: msg || "Server error" },
      { status: 500 }
    );
  }
}
