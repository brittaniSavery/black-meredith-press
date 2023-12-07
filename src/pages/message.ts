import {
  ContactFormSchema,
  type ContactFormType,
} from "@components/ContactForm";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import type { APIRoute } from "astro";
import { fromEnv } from "@aws-sdk/credential-providers";

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

export const GET: APIRoute = async () => {
  return new Response();
};

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
  const sesClient = new SESClient({
    region: "us-west-2",
    credentials: fromEnv(),
  });

  const sendEmailCommand = new SendEmailCommand({
    Destination: { ToAddresses: [import.meta.env.DESTINATION_EMAIL] },
    Source: import.meta.env.SOURCE_EMAIL,
    ReplyToAddresses: [email],
    Message: {
      Subject: {
        Data: `Contact Form Message from ${name}${subject && `: ${subject}`}`,
        Charset: "UTF-8",
      },
      Body: {
        Text: {
          Data: `${name} just filled out the Contact Form on blackmeredithpress.com. Here is what they had to say:
          
          ${body}
          
          Just reply to this email and you'll be able to answer ${name} at ${email}.`,
          Charset: "UTF-8",
        },
      },
    },
  });

  try {
    await sesClient.send(sendEmailCommand);
    return new Response();
  } catch (error) {
    console.log(error);

    return new Response(
      "Unable to send email message. Please try again later.",
      { status: 400 }
    );
  }
};
