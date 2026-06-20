import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminDb } from "@/lib/firebaseAdmin";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "lifetracker-jwt-secret-session-key-998877";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session_token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Not authenticated." },
        { status: 401 }
      );
    }

    // Verify JWT
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (e) {
      return NextResponse.json(
        { error: "Invalid or expired session token." },
        { status: 401 }
      );
    }

    if (!adminDb) {
      return NextResponse.json(
        { user: { name: decoded.name, email: decoded.email, age: 25 } },
        { status: 200 }
      );
    }

    // Optional: fetch user data from Firestore to get most up-to-date age / name
    const userDoc = await adminDb.collection("users").doc(decoded.uid).get();
    if (userDoc.exists) {
      const data = userDoc.data()!;
      return NextResponse.json(
        { user: { name: data.name, email: data.email, age: data.age } },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { user: { name: decoded.name, email: decoded.email, age: 25 } },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Auth Me Error:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
