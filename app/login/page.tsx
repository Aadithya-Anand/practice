"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import {
  Loader2,
  ChevronRight,
  CarFront,
  Mail,
  Lock,
  Zap,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const formSchema = z.object({
  email: z.string().email("Invalid Email"),
  password: z.string().min(6, "Password too short"),
});

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [hovering, setHovering] = useState(false);
  const router = useRouter();
  const { refetch } = useAuth();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
        credentials: "include",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        toast.error(data?.error ?? "Invalid email or password");
        return;
      }

      const data = (await res.json()) as {
        user: { id: string; email: string; role?: string };
      };

      // Optionally store basic user info for UI; auth is cookie-based.
      if (typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      await refetch();
      toast.success("Welcome back 🚗", {
        description: "You are now logged in to Vandi.",
      });
      router.push(data.user?.role === "driver" ? "/driver" : "/book");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden">
      {/* Background Video */}
      <div className="absolute inset-0 -z-20">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="h-full w-full object-cover brightness-110"
        >
          <source
            src="/vecteezy_timelapse-of-traffic-at-night-around-bangkok-city-in-thailand_2719941.mp4"
            type="video/mp4"
          />
        </video>
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Floating Glow */}
      <motion.div
        animate={{ y: [0, -25, 0] }}
        transition={{ duration: 6, repeat: Infinity }}
        className="absolute h-[600px] w-[600px] rounded-full bg-orange-500/10 blur-[150px]"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 w-full max-w-[460px] px-4"
      >
        <motion.div
          animate={{
            boxShadow: hovering
              ? "0 0 80px rgba(249,115,22,0.5)"
              : "0 0 40px rgba(249,115,22,0.2)",
          }}
          className="relative overflow-hidden rounded-[32px] border border-white/20 bg-black/70 p-10 backdrop-blur-2xl transition-all duration-500"
        >
          {/* Branding */}
          <div className="mb-10 flex flex-col items-center text-center">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 6 }}
              className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-500 text-white"
            >
              <CarFront size={32} strokeWidth={2.5} />
            </motion.div>

            <h1 className="text-4xl font-black tracking-tight text-white">
              VANDI<span className="text-orange-500">.</span>
            </h1>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs text-white">
                      Email
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white" />
                        <Input
                          {...field}
                          className="h-14 rounded-xl border-white/10 bg-white/5 pl-16 text-white placeholder:text-white/50 focus:border-orange-500"
                          placeholder="abc@gmail.com"
                        />
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Password */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs text-white">
                      Password
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white" />
                        <Input
                          type="password"
                          {...field}
                          className="h-14 rounded-xl border-white/10 bg-white/5 pl-16 text-white placeholder:text-white/50 focus:border-orange-500"
                          placeholder="••••••••"
                        />
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Button */}
              <Button
                type="submit"
                disabled={isLoading}
                onMouseEnter={() => setHovering(true)}
                onMouseLeave={() => setHovering(false)}
                className="group relative h-14 w-full overflow-hidden rounded-xl bg-orange-500 font-bold text-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    Initiate Ignition
                    <ChevronRight size={18} />
                  </div>
                )}
              </Button>
            </form>
          </Form>

          <div className="mt-8 space-y-2 text-center text-sm text-white">
            <p>
              <Link href="/signup" className="hover:text-orange-400">
                Not registered?{" "}
                <span className="text-orange-500 underline">
                  Enroll in fleet
                </span>
              </Link>
            </p>
            <p>
              <Link href="/driver/signup" className="hover:text-orange-400">
                Want to drive?{" "}
                <span className="text-orange-500 underline">
                  Sign up as driver
                </span>
              </Link>
            </p>
          </div>
        </motion.div>

        <div className="mt-6 flex justify-between text-xs text-white">
          <div className="flex items-center gap-1">
            <Zap size={14} className="text-orange-500" />
            v4.0.2
          </div>
        </div>
      </motion.div>
    </div>
  );
}
