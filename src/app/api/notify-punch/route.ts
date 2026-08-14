// src/app/api/notify-punch/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { count, user } = await req.json();

    // Integrates with FCM, Pusher, or web-push library here
    console.log(`[ALERT] ${user} punched Dudu! Count: ${count}`);

    /* 
      Example using Firebase Admin Messaging:
      await admin.messaging().send({
        token: PARTNER_DEVICE_FCM_TOKEN,
        notification: {
          title: "Alert! 🥊",
          body: `${user} is punching Dudu right now! (${count} times)`,
        },
      });
    */

    return NextResponse.json({ success: true, message: "Notification sent!" });
  } catch (error) {
    return NextResponse.json({ success: false, error }, { status: 500 });
  }
}