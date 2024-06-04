import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";

import RegisterInput from "./RegisterInput";
import { useRegisterMutation } from "@/slices/usersApiSlice";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Slide, toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

type ErrorResponse = {
  status: number;
  data: {
    error: string;
    success: boolean;
    errors: any[];
  };
};

function isErrorReponse(obj: any): obj is ErrorResponse {
  return (
    obj &&
    typeof obj.status === "number" &&
    obj.data &&
    typeof obj.data.error === "string" &&
    typeof obj.data.success === "boolean" &&
    Array.isArray(obj.data.errors)
  );
}

export const registerFormSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  userName: z.string().min(2).max(30),
  fullName: z.string().min(2).max(50),
  avatar: z.any().refine(
    (files) => {
      return Array.from(files).every((file) => file instanceof File);
    },
    { message: "Expected a file" }
  ),
  coverImage: z
    .any()
    .refine(
      (files) => {
        return Array.from(files).every((file) => file instanceof File);
      },
      { message: "Expected a file" }
    )
    .optional(),
});

const RegisterForm = () => {
  const [register, { isLoading }] = useRegisterMutation();

  const navigate = useNavigate();

  // 1. Define your form.
  const form = useForm<z.infer<typeof registerFormSchema>>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      email: "",
    },
  });

  // 2. Define a submit handler.
  const onSubmit = async (userData: z.infer<typeof registerFormSchema>) => {
    try {
      toast.info(`User Registration in progress..."`);
      await register({ ...userData }).unwrap();

      toast.success("User Registered.");

      setTimeout(() => navigate("/login"), 2000);

      console.log("user registered successfully");
    } catch (err: unknown) {
      if (isErrorReponse(err)) {
        console.error("error registering user", err);
        toast.error(`${err?.data?.error}`);
      }
    }
  };

  return (
    <Form {...form}>
      <div className="flex justify-center items-center h-screen">
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8 w-full max-w-sm"
        >
          <div className="flex gap-4">
            <RegisterInput
              type="text"
              name="fullName"
              label="Full Name"
              placeholder="Ex. John Doe"
              control={form.control}
            />
            <RegisterInput
              type="text"
              name="userName"
              label="Username"
              placeholder="Ex. John333"
              control={form.control}
            />
          </div>
          <RegisterInput
            type="email"
            name="email"
            label="Email"
            placeholder="Enter your email"
            control={form.control}
          />
          <RegisterInput
            type="password"
            name="password"
            label="Password"
            placeholder="Enter your password"
            control={form.control}
          />
          <RegisterInput
            type="file"
            name="avatar"
            label="Profile Picture"
            control={form.control}
          />
          <RegisterInput
            type="file"
            name="coverImage"
            label="Cover Image"
            control={form.control}
          />

          <div className="flex flex-col gap-1">
            <Button
              type="submit"
              className="text-16 rounded-lg font-semibold text-white dark:text-gray-900  shadow-form"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  &nbsp;Loading...
                </>
              ) : (
                "Register"
              )}
            </Button>
          </div>
        </form>
        <ToastContainer
          autoClose={2000}
          hideProgressBar={true}
          position="bottom-left"
          theme="dark"
          transition={Slide}
          stacked
        />
      </div>
    </Form>
  );
};

export default RegisterForm;
