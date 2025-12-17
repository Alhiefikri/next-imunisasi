"use client";

import React, { useState } from "react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "./ui/form";
import { Input } from "./ui/input";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { Spinner } from "./ui/spinner";
import Link from "next/link";
import { Separator } from "./ui/separator";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

const signInFormSchema = z.object({
  email: z.email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(3, { message: "Password must be at least 3  characters long" }),
});

type SignInFormValues = z.infer<typeof signInFormSchema>;

export default function SignForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<SignInFormValues>({
    resolver: zodResolver(signInFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: SignInFormValues) => {
    try {
      setIsLoading(true);
      await authClient.signIn.email(
        {
          email: values.email,
          password: values.password,
          callbackURL: "/",
        },
        {
          onSuccess: () => {
            router.push("/");
          },
          onError: (ctx) => {
            toast.error(ctx.error.message);
          },
        }
      );
    } catch (error) {
      console.error({ error });
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/",
    });
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Sign in to your Account</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            className="flex flex-col gap-6"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your email" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your password"
                      {...field}
                      type="password"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <Button type="submit" className="cursor-pointer">
              {isLoading ? <Spinner className="size-6" /> : "Sign In"}
            </Button>
            <p>
              Don't have an account?{" "}
              <Link href="/sign-up" className="text-blue-900">
                Sign up
              </Link>
            </p>

            <Separator />
            <Button type="button" className="text-[13px] cursor-pointer">
              Continue with Google
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
