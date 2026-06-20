import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminDb } from "@/lib/firebaseAdmin";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "lifetracker-jwt-secret-session-key-998877";

function calculateAge(dobString: string): number {
  if (!dobString) return 25;
  try {
    const today = new Date();
    const birthDate = new Date(dobString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return isNaN(age) ? 25 : age;
  } catch (e) {
    return 25;
  }
}

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
        { 
          user: { 
            name: decoded.name, 
            email: decoded.email, 
            dob: "2001-05-15", 
            avatar: "1.png", 
            age: 25 
          } 
        },
        { status: 200 }
      );
    }

    // Fetch user data from Firestore
    const userDoc = await adminDb.collection("users").doc(decoded.uid).get();
    if (userDoc.exists) {
      const data = userDoc.data()!;
      const dob = data.dob || "2001-05-15";
      const avatar = data.avatar || "1.png";
      const age = calculateAge(dob);

      return NextResponse.json(
        { 
          user: { 
            name: data.name, 
            email: data.email, 
            dob: dob, 
            avatar: avatar, 
            age: age 
          } 
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { 
        user: { 
          name: decoded.name, 
          email: decoded.email, 
          dob: "2001-05-15", 
          avatar: "1.png", 
          age: 25 
        } 
      },
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
