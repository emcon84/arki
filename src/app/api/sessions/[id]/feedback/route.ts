import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { feedbacks } from '@/db/schema'
import { Resend } from 'resend'
import type { SubmitFeedbackRequest } from '@/types'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function POST(request: NextRequest, context: RouteContext): Promise<NextResponse> {
  const { id: sessionId } = await context.params

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const data = body as Partial<SubmitFeedbackRequest>

  // Validate rating
  if (
    typeof data.rating !== 'number' ||
    !Number.isInteger(data.rating) ||
    data.rating < 1 ||
    data.rating > 5
  ) {
    return NextResponse.json(
      { error: 'rating must be an integer between 1 and 5' },
      { status: 400 },
    )
  }

  // Validate optional wouldRecommend
  if (
    data.wouldRecommend !== undefined &&
    typeof data.wouldRecommend !== 'boolean'
  ) {
    return NextResponse.json(
      { error: 'wouldRecommend must be a boolean' },
      { status: 400 },
    )
  }

  // Validate optional comment
  if (data.comment !== undefined) {
    if (typeof data.comment !== 'string') {
      return NextResponse.json(
        { error: 'comment must be a string' },
        { status: 400 },
      )
    }
    if (data.comment.length > 1000) {
      return NextResponse.json(
        { error: 'comment cannot exceed 1000 characters' },
        { status: 400 },
      )
    }
  }

  const { rating, wouldRecommend, comment } = data

  await db.insert(feedbacks).values({
    sessionId,
    rating,
    wouldRecommend: wouldRecommend ?? null,
    comment: comment ?? null,
  })

  // Send email via Resend if API key is configured
  if (process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY)
      const recommendText =
        wouldRecommend === true
          ? 'Yes'
          : wouldRecommend === false
            ? 'No'
            : 'Not answered'

      await resend.emails.send({
        from: 'Arki Feedback <onboarding@resend.dev>',
        to: process.env.FEEDBACK_EMAIL ?? 'emcon84@gmail.com',
        subject: `Arki Feedback - Rating: ${rating}/5`,
        html: `
          <h2>New Arki Feedback</h2>
          <p><strong>Rating:</strong> ${rating}/5</p>
          <p><strong>Would recommend:</strong> ${recommendText}</p>
          <p><strong>Comment:</strong> ${comment ?? 'No comment'}</p>
          <p><strong>Session ID:</strong> ${sessionId}</p>
          <p><strong>Date:</strong> ${new Date().toISOString()}</p>
        `,
      })
    } catch {
      // Email failure is non-fatal - do not break the request
    }
  }

  return NextResponse.json({ success: true })
}
