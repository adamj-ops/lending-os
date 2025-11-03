import { NextResponse } from 'next/server';

type ErrorPayload = { error: string; code?: string; details?: unknown };

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data as any, init);
}

export function created<T>(data: T) {
  return NextResponse.json(data as any, { status: 201 });
}

export function badRequest(message: string, details?: unknown) {
  return NextResponse.json({ error: message, details } satisfies ErrorPayload, { status: 400 });
}

export function unauthorized(message = 'Unauthorized') {
  return NextResponse.json({ error: message } satisfies ErrorPayload, { status: 401 });
}

export function forbidden(message = 'Forbidden') {
  return NextResponse.json({ error: message } satisfies ErrorPayload, { status: 403 });
}

export function notFound(message = 'Not Found') {
  return NextResponse.json({ error: message } satisfies ErrorPayload, { status: 404 });
}

export function conflict(message = 'Conflict') {
  return NextResponse.json({ error: message } satisfies ErrorPayload, { status: 409 });
}

export function unprocessable(message = 'Unprocessable Entity', details?: unknown) {
  return NextResponse.json({ error: message, details } satisfies ErrorPayload, { status: 422 });
}

export function tooMany(message = 'Too Many Requests') {
  return NextResponse.json({ error: message } satisfies ErrorPayload, { status: 429 });
}

export function serverError(message = 'Internal Server Error', details?: unknown) {
  return NextResponse.json({ error: message, details } satisfies ErrorPayload, { status: 500 });
}

