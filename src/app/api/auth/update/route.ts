import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminDb } from "@/lib/firebaseAdmin";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "lifetracker-jwt-secret-session-key-998877";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session_token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Not authenticated." },
        { status: 401 }
      );
    }

    // Verify current JWT
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (e) {
      return NextResponse.json(
        { error: "Invalid session." },
        { status: 401 }
      );
    }

    if (!adminDb) {
      return NextResponse.json(
        { error: "Firebase is not configured. Running in Mock Mode." },
        { status: 500 }
      );
    }

    const { name, email, dob, avatar, password } = await request.json();

    const userDocRef = adminDb.collection("users").doc(decoded.uid);
    const userDoc = await userDocRef.get();

    if (!userDoc.exists) {
      return NextResponse.json(
        { error: "User not found." },
        { status: 404 }
      );
    }

    const userData = userDoc.data()!;

    // Check if email already taken by someone else
    if (email && email.toLowerCase().trim() !== userData.email) {
      const emailSnapshot = await adminDb
        .collection("users")
        .where("email", "==", email.toLowerCase().trim())
        .get();
      if (!emailSnapshot.empty) {
        return NextResponse.json(
          { error: "An account with this email already exists." },
          { status: 400 }
        );
      }
    }

    // Compile update fields
    const updates: any = {};
    if (name) updates.name = name.trim();
    if (email) updates.email = email.toLowerCase().trim();
    if (dob) updates.dob = dob.trim();
    if (avatar) updates.avatar = avatar.trim();

    if (password) {
      updates.passwordHash = await bcrypt.hash(password, 10);
    }

    await userDocRef.update(updates);

    // Get final user details for JWT session recreation
    const updatedName = name ? name.trim() : userData.name;
    const updatedEmail = email ? email.toLowerCase().trim() : userData.email;

    // Issue a new session token with the updated Name and Email
    const newToken = jwt.sign(
      { email: updatedEmail, name: updatedName, uid: decoded.uid },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    const response = NextResponse.json(
      { success: true, user: { name: updatedName, email: updatedEmail } },
      { status: 200 }
    );

    // Reset session cookie
    response.cookies.set({
      name: "session_token",
      value: newToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Update Profile Error:", error);
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
