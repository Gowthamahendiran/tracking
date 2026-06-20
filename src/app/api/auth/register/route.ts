import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "lifetracker-jwt-secret-session-key-998877";

export async function POST(request: Request) {
  try {
    const { name, age, email, password } = await request.json();

    if (!name || !age || !email || !password) {
      return NextResponse.json(
        { error: "Please fill in all fields (Name, Age, Email, Password)." },
        { status: 400 }
      );
    }

    if (!adminDb) {
      return NextResponse.json(
        { error: "Firebase Admin is not configured. Run in Mock Mode." },
        { status: 500 }
      );
    }

    // Check if user already exists
    const usersRef = adminDb.collection("users");
    const snapshot = await usersRef.where("email", "==", email.toLowerCase().trim()).get();
    
    if (!snapshot.empty) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Save to Firestore
    const userDocRef = usersRef.doc();
    const newUser = {
      uid: userDocRef.id,
      name: name.trim(),
      age: parseInt(age, 10) || 18,
      email: email.toLowerCase().trim(),
      passwordHash,
      createdAt: new Date().toISOString(),
    };

    await userDocRef.set(newUser);

    // Generate JWT Session Token
    const token = jwt.sign(
      { email: newUser.email, name: newUser.name, uid: newUser.uid },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Create response
    const response = NextResponse.json(
      { success: true, user: { name: newUser.name, email: newUser.email } },
      { status: 201 }
    );

    // Set secure HttpOnly cookie
    response.cookies.set({
      name: "session_token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Register Error:", error);
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
