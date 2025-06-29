import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
    apiKey: process.env.NEXT_PUBLIC_OPENAI_KEY,
});

export async function POST(req){
    try {
        const {prompt} = await req.json() 
        
        if (!prompt) {
            return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
        }

        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{role: "user", content: prompt}],
        });

        return NextResponse.json({ 
            success: true,
            answer: response.choices[0].message.content 
        });
    } catch (error) {
        console.error("OpenAI API Error:", error);
        return NextResponse.json({ 
            error: "Failed to get response from OpenAI",
            details: error.message 
        }, { status: 500 });
    }
}