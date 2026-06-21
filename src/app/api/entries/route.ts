import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminDb } from "@/lib/firebaseAdmin";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "lifetracker-jwt-secret-session-key-998877";

// Helper to authenticate user from session token
async function getUserIdFromToken() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;
  if (!token) return null;
  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    return decoded.uid;
  } catch (e) {
    return null;
  }
}

export async function GET() {
  const userId = await getUserIdFromToken();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!adminDb) {
    return NextResponse.json([]);
  }

  try {
    const entriesSnapshot = await adminDb
      .collection("entities")
      .doc(userId)
      .collection("entries")
      .get();
    
    const entries: any[] = [];
    entriesSnapshot.forEach((doc) => {
      entries.push(doc.data());
    });

    return NextResponse.json(entries);
  } catch (e: any) {
    console.error("API GET Entries Error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const userId = await getUserIdFromToken();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!adminDb) {
    return NextResponse.json({ error: "Firebase Admin Firestore not initialized" }, { status: 500 });
  }

  try {
    const entry = await req.json();
    if (!entry.id || !entry.date) {
      return NextResponse.json({ error: "Invalid entry data" }, { status: 400 });
    }

    await adminDb
      .collection("entities")
      .doc(userId)
      .collection("entries")
      .doc(entry.id)
      .set(entry);

    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error("API POST Entry Error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const userId = await getUserIdFromToken();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!adminDb) {
    return NextResponse.json({ error: "Firebase Admin Firestore not initialized" }, { status: 500 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing id parameter" }, { status: 400 });
    }

    await adminDb
      .collection("entities")
      .doc(userId)
      .collection("entries")
      .doc(id)
      .delete();

    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error("API DELETE Entry Error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
