import { useForm, type SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Turnstile from "react-turnstile";
import { Fragment, type ReactNode } from "react";

export const ContactFormSchema = z.object({
  name: z.string().min(1, "Enter your name."),
  email: z.string().email("Enter a valid email address."),
  subject: z.string().optional(),
  body: z.string().min(75, "Include a message of at least 75 characters."),
  captchaToken: z.string(),
});

export type ContactFormType = z.infer<typeof ContactFormSchema>;

export function ContactForm() {
  const {
    watch,
    register,
    handleSubmit,
    setValue,
    setError,
    formState: { errors, isSubmitSuccessful },
  } = useForm<ContactFormType>({
    defaultValues: {
      email: "",
      body: "",
      name: "",
      subject: "",
      captchaToken: "",
    },
    resolver: zodResolver(ContactFormSchema),
  });

  const messageLength = watch("body").length;

  const onSubmit: SubmitHandler<ContactFormType> = async (values) => {
    const result = await fetch(`/message`, {
      method: "POST",
      body: JSON.stringify(values),
    });

    if (!result.ok) {
      const error = await result.text();
      setError("root", { message: error });
    }
  };

  if (isSubmitSuccessful) {
    return (
      <div className="flex flex-col gap-3 mt-3">
        <div className="flex gap-1 items-baseline self-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 512 512"
            className="fill-teal-900 dark:fill-teal-200 h-4 w-4 lg:h-6 lg:w-6"
          >
            {/* Font Awesome Free 6.5.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2023 Fonticons, Inc. */}
            <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209L241 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L335 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z" />
          </svg>
          <p className="text-teal-800 dark:text-teal-200 font-bold text-center text-2xl lg:text-4xl">
            Message Sent Successfully!
          </p>
        </div>
        <p>
          We have received your message and will respond in 3-5 business days,
          if not sooner. Thank you for your interest in Black Meredith Press.
        </p>
      </div>
    );
  }

  return (
    <Fragment>
      <p>
        If you would like more information on Black Meredith Press or our
        authors, please contact us with the form below.
      </p>

      <form
        noValidate
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-1 md:grid-cols-2 gap-4 gap-y-8 mt-8"
      >
        <label className="flex flex-col gap-2">
          Name{" "}
          <input
            className="bg-zinc-200/90 dark:bg-zinc-700 rounded-lg px-4 py-1"
            {...register("name")}
          />
          <ErrorMessage>{errors.name?.message}</ErrorMessage>
        </label>

        <label className="flex flex-col gap-2">
          Email{" "}
          <input
            type="email"
            className="bg-zinc-200/90 dark:bg-zinc-700 rounded-lg px-4 py-1"
            {...register("email")}
          />
          <ErrorMessage>{errors.email?.message}</ErrorMessage>
        </label>
        <label className="flex flex-col gap-2 md:col-span-2">
          Subject (optional){" "}
          <input
            className="bg-zinc-200/90 dark:bg-zinc-700 rounded-lg px-4 py-1"
            {...register("subject")}
          />
        </label>
        <label className="flex flex-col gap-2 md:col-span-2">
          <span>
            Message {messageLength < 75 && `(${messageLength}/75 characters)`}
          </span>

          <textarea
            className="bg-zinc-200/90 dark:bg-zinc-700 rounded-lg w-full h-32 px-4"
            {...register("body")}
          />
          <ErrorMessage>{errors.body?.message}</ErrorMessage>
        </label>
        <div className="flex flex-col gap-2 md:col-span-2">
          <Turnstile
            sitekey={import.meta.env.PUBLIC_TURNSTILE_SITE_KEY}
            onVerify={(token) => setValue("captchaToken", token)}
          />
          <input type="hidden" {...register("captchaToken")} />
          <ErrorMessage>{errors.root?.message}</ErrorMessage>
        </div>
        <input
          type="submit"
          value="Send"
          className="border border-zinc-400 rounded-lg p-2 text-left w-fit md:col-span-2 cursor-pointer"
        />
      </form>
    </Fragment>
  );
}

function ErrorMessage({ children }: { children: ReactNode }) {
  if (!children) return "";

  return (
    <p className="flex gap-1 items-center text-lg lg:text-xl text-rose-900 dark:text-rose-200">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 512 512"
        className="h-4 w-4 fill-rose-900 dark:fill-rose-200"
      >
        {/* Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. */}
        <path d="M256 32c14.2 0 27.3 7.5 34.5 19.8l216 368c7.3 12.4 7.3 27.7 .2 40.1S486.3 480 472 480H40c-14.3 0-27.6-7.7-34.7-20.1s-7-27.8 .2-40.1l216-368C228.7 39.5 241.8 32 256 32zm0 128c-13.3 0-24 10.7-24 24V296c0 13.3 10.7 24 24 24s24-10.7 24-24V184c0-13.3-10.7-24-24-24zm32 224a32 32 0 1 0 -64 0 32 32 0 1 0 64 0z" />
      </svg>
      &nbsp;
      {children}
    </p>
  );
}
