"use client";

import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Link from "next/link";
import { motion } from "framer-motion";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const formSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(1, "Name is required"),
  phone: z.string().optional(),
  vehicleType: z.enum(["MINI", "SEDAN", "SUV"]),
  vehicleNumber: z.string().min(1, "Vehicle number is required"),
  licenseNumber: z.string().min(1, "License number is required"),
});

export default function DriverSignupPage() {
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      name: "",
      phone: "",
      vehicleType: "SEDAN",
      vehicleNumber: "",
      licenseNumber: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const res = await fetch("/api/auth/driver-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
        credentials: "include",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        toast.error(data?.error ?? "Could not create driver account");
        return;
      }

      toast.success("Driver account created 🚗", {
        description: "Log in to start accepting rides.",
      });
      router.push("/login");
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 px-4 py-10">
      <div className="pointer-events-none absolute -top-32 -right-32 h-72 w-72 rounded-full bg-orange-500/10 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="relative z-10 w-full max-w-md"
      >
        <Card className="border-zinc-700 bg-zinc-900/80 text-white">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-semibold tracking-tight">
              Become a Vandi driver
            </CardTitle>
            <CardDescription className="text-zinc-400">
              Sign up with your vehicle details to start earning.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-zinc-300">Email</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="driver@example.com"
                          type="email"
                          className="h-11 rounded-xl border-zinc-600 bg-zinc-800 text-white placeholder:text-zinc-500"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-amber-400" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-zinc-300">Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          className="h-11 rounded-xl border-zinc-600 bg-zinc-800 text-white placeholder:text-zinc-500"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-amber-400" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-zinc-300">Full name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="John Doe"
                          className="h-11 rounded-xl border-zinc-600 bg-zinc-800 text-white placeholder:text-zinc-500"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-amber-400" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-zinc-300">Phone (optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="+91 98765 43210"
                          className="h-11 rounded-xl border-zinc-600 bg-zinc-800 text-white placeholder:text-zinc-500"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-amber-400" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="vehicleType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-zinc-300">Vehicle type</FormLabel>
                      <FormControl>
                        <select
                          {...field}
                          className="h-11 w-full rounded-xl border border-zinc-600 bg-zinc-800 px-4 text-white"
                        >
                          <option value="MINI">Mini</option>
                          <option value="SEDAN">Sedan</option>
                          <option value="SUV">SUV</option>
                        </select>
                      </FormControl>
                      <FormMessage className="text-amber-400" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="vehicleNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-zinc-300">Vehicle number</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="KA 01 AB 1234"
                          className="h-11 rounded-xl border-zinc-600 bg-zinc-800 text-white placeholder:text-zinc-500"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-amber-400" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="licenseNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-zinc-300">License number</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="DL1234567890123"
                          className="h-11 rounded-xl border-zinc-600 bg-zinc-800 text-white placeholder:text-zinc-500"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-amber-400" />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="h-11 w-full rounded-xl bg-orange-500 text-white hover:bg-orange-600"
                >
                  Create driver account
                </Button>
              </form>
            </Form>

            <div className="mt-4 text-center text-sm text-zinc-400">
              Already have an account?{" "}
              <Link href="/login" className="font-semibold text-orange-400 hover:text-orange-300">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
