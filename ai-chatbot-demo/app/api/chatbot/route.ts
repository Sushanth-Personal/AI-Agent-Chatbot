import { NextResponse } from "next/server";
import axios from "axios";
import { getUserByEmail, saveUser } from "@/utils/memory";

export async function POST(req: Request) {
  const { message, email }: { message: string; email: string } = await req.json();

  if (!message || !email) {
    return NextResponse.json(
      { error: "Message and email are required" },
      { status: 400 }
    );
  }

  let user = await getUserByEmail(email);
  if (!user) {
    user = { email, history: [], tripData: {} };
  }

  const newMessage = { role: "user", content: message };

  const systemPrompt = `
You are a smart AI information gathering assistant. You gather details by asking short and targeted questions. You should ask questions like an expert in the field user mentions.

What details must be collected depends on the goal of the user. If it is travel, collect details about the trip. Or if it is about dinner, collect details about the meal, restaurant, etc.

You must analyze the user's message **along with the conversation history** provided in the "chat_history" field. Use it to infer missing information, maintain context, and continue the flow naturally.

If the user provides a detail, include it in the "data" field of your response using key-value pairs.

You also have access to the following tool:
- saveUser(data): Use this whenever the user has given you an answer to a question, e.g., the user says they want to go to Maldives. You can use this tool to save the user data in your database.

Your response **must** be a JSON object with:
- "reply": a string message to the user
- "data": an object with any new information you parsed from the message
- "function_call": { "name": "saveUser", "arguments": { ... } }
- "chat_history": a concise summary or necessary context extracted from the ongoing conversation to help continue the interaction intelligently.

Respond only with this structured JSON. Do not include explanations.
  `.trim();

  // Prepare the compact chat history for context
  const chatHistory = user.history
    .map(({ role, content }) => `${role}: ${content}`)
    .join("\n");

  const userPayload = {
    role: "user",
    content: JSON.stringify({
      message,
      chat_history: chatHistory,
    }),
  };

  const messages = [
    { role: "system", content: systemPrompt },
    userPayload,
  ];

  try {
    const response = await axios.post(
      `${process.env.API_URL}`,
      {
        model: "Provider-7/gpt-4o-mini",
        messages,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.API_KEY}`,
        },
      }
    );

    console.log(JSON.stringify(response.data, null, 2));

    const assistantContent = response.data.choices[0].message.content;

    let parsed;
    try {
      parsed = JSON.parse(assistantContent);
    } catch (err) {
      console.error("❌ Failed to parse assistant content:", assistantContent);
      return NextResponse.json(
        { error: "Invalid format from assistant" },
        { status: 500 }
      );
    }

    const botReply = parsed.reply;
    const tripData = parsed.data || {};
    const functionCall = parsed.function_call;

    Object.entries(tripData).forEach(([key, value]) => {
      user.tripData[key] = value;
    });

    user.history.push(newMessage);
    user.history.push({ role: "assistant", content: botReply });

    if (functionCall?.name === "saveUser") {
      await saveUser(user);
    }

    return NextResponse.json(
      { response: botReply, data: user.tripData },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Error during assistant request:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
