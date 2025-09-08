import { NextResponse } from 'next/server'
import { cert, getApps, initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

const app = getApps().length
    ? getApps()[0]
    : initializeApp({
        credential: cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
    })

const adb = getFirestore(app)

export async function GET() {
    const ref = adb.collection('settings').doc('app')
    await ref.set({ pingAt: new Date().toISOString() }, { merge: true })
    const snap = await ref.get()
    return NextResponse.json({ ok: true, data: snap.data() })
}
