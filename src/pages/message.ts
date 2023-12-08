import {
  ContactFormSchema,
  type ContactFormType,
} from "@components/ContactForm";
import type { APIRoute } from "astro";
import postmark from "postmark";

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

export const POST: APIRoute = async ({ request }) => {
  const message: ContactFormType = await request.json();

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
  const { captchaToken } = message;
  const ip = request.headers.get("CF-Connecting-IP");

  let captchaData = new FormData();
  captchaData.append("secret", import.meta.env.TURNSTILE_SECRET_KEY);
  captchaData.append("response", captchaToken);
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
  const { body, email, name, subject } = message;
  const client = new postmark.ServerClient(
    import.meta.env.POSTMARK_SERVER_API_KEY
  );

  const result = await client.sendEmail({
    From: import.meta.env.SOURCE_EMAIL,
    To: import.meta.env.DESTINATION_EMAIL,
    Subject: `Contact Form Message from ${name}${subject && `: ${subject}`}`,
    ReplyTo: email,
    TextBody: `${name} just filled out the Contact Form on blackmeredithpress.com. Here is what they had to say:
          
    ${body}
    
    Just reply to this email and you'll be able to answer ${name} at ${email}.`,
    MessageStream: "outbound",
  });

  if (result.ErrorCode) {
    return new Response(
      "Unable to send email message. Please try again later.",
      { status: 400 }
    );
  }

  return new Response();
};
