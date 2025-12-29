import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ success: true, message: "Logged out" });

  response.cookies.set("token", "", { maxAge: 0, path: "/" });
  response.cookies.set("userName", "", { maxAge: 0, path: "/" });
  response.cookies.set("email", "", { maxAge: 0, path: "/" });
  response.cookies.set("phone", "", { maxAge: 0, path: "/" });
  response.cookies.set("role", "", { maxAge: 0, path: "/" });

  return response;
}
