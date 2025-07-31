import { NextRequest, NextResponse } from "next/server"
import { updateTraceIntensity } from "@/actions/traces"

export async function GET(request: NextRequest) {
  // Verify the request is from Vercel Cron
  const authHeader = request.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    console.log("🕒 Starting scheduled maintenance tasks...")

    // Run cleanup tasks
    await updateTraceIntensity()

    console.log("✅ Maintenance tasks completed successfully")

    return NextResponse.json({
      success: true,
      message: "Maintenance completed",
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error("❌ Error during maintenance:", error)

    return NextResponse.json({
      success: false,
      error: "Maintenance failed",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
} 