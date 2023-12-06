import {
  ContactFormSchema,
  type ContactFormType,
} from "@components/ContactForm";
import type { APIRoute } from "astro";

type TurnstileChallengeResponse = {
  success: boolean;
  "error-codes": string[];
};

type TurnstileChallengeSuccess = TurnstileChallengeResponse & {
  challenge_ts: string;
  hostname: string;
  cdata: string;
  action: string;
};

export const prerender = false;

export async function GET() {
  let number = Math.random();
  return new Response(
    JSON.stringify({
      number,
      message: `Here's a random number: ${number}`,
    })
  );
}

export const POST: APIRoute = async ({ request }) => {
  const message: ContactFormType = await request.json();
  console.log(message);

  // Form validation with Zod
  const validation = ContactFormSchema.safeParse(message);

  if (!validation.success) {
    return new Response(
      "Form is invalid. Please double-check all required fields.",
      {
        status: 400,
      }
    );
  }

  // CAPTCHA validation for Turnstile
  const ip = request.headers.get("CF-Connecting-IP");

  let captchaData = new FormData();
  captchaData.append("secret", import.meta.env.TURNSTILE_SECRET_KEY);
  captchaData.append("response", message.captchaToken);
  if (ip) captchaData.append("remoteip", ip);

  const challenge = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      body: captchaData,
    }
  );
  const challengeResult: TurnstileChallengeResponse = await challenge.json();

  if (!challengeResult.success) {
    return new Response("Captcha verification failed. Please try again.", {
      status: 400,
    });
  }

  // Send email

  return new Response();
};
