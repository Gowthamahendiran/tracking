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

    // Verify current session JWT
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
        { error: "Firebase Admin is not configured. Running in Mock Mode." },
        { status: 500 }
      );
    }

    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Current password and new password are required." },
        { status: 400 }
      );
    }

    // Fetch user document from Firestore
    const userDocRef = adminDb.collection("users").doc(decoded.uid);
    const userDoc = await userDocRef.get();

    if (!userDoc.exists) {
      return NextResponse.json(
        { error: "User profile not found." },
        { status: 404 }
      );
    }

    const user = userDoc.data()!;

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "The current password you entered is incorrect." },
        { status: 400 }
      );
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // Update password hash in Firestore
    await userDocRef.update({
      passwordHash: newPasswordHash,
    });

    return NextResponse.json(
      { success: true, message: "Password updated successfully!" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Reset Password API Error:", error);
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
