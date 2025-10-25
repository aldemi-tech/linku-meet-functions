/**
 * Google Meet Functions - Domain Module
 * Handles meeting creation, calendar integration, and Google Workspace APIs
 */

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { google } from 'googleapis';

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

// Types
interface MeetingRequest {
  title: string;
  description?: string;
  start_time: string;
  duration?: number; // minutes
  attendees?: string[];
  calendar_sync?: boolean;
}

interface MeetingResponse {
  meeting_id: string;
  title: string;
  start_time: string;
  join_url: string;
  calendar_event_id?: string;
}

// Utility functions
const validateRequiredFields = (data: any, fields: string[]) => {
  const missing = fields.filter((field) => !data[field]);
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(", ")}`);
  }
};

const handleError = (error: any) => {
  console.error("Meet function error:", error);
  return {
    success: false,
    error: {
      code: "MEET_ERROR",
      message: error.message || "An unexpected error occurred"
    }
  };
};

// Google Calendar/Meet integration
const getGoogleAuth = () => {
  const clientId = functions.config().google?.client_id || process.env.GOOGLE_CLIENT_ID;
  const clientSecret = functions.config().google?.client_secret || process.env.GOOGLE_CLIENT_SECRET;
  
  if (!clientId || !clientSecret) {
    throw new Error("Google credentials not configured");
  }
  
  return new google.auth.OAuth2(clientId, clientSecret);
};

/**
 * Create a new Google Meet meeting
 */
export const meetCreateMeeting = functions.https.onRequest(async (req, res) => {
  try {
    if (req.method !== 'POST') {
      res.status(405).json({
        success: false,
        error: { code: "METHOD_NOT_ALLOWED", message: "Only POST method allowed" }
      });
      return;
    }

    const meetingData: MeetingRequest = req.body;
    validateRequiredFields(meetingData, ['title', 'start_time']);

    // Generate meeting ID and join URL (simplified for demo)
    const meetingId = `meet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const joinUrl = `https://meet.google.com/${meetingId}`;

    // In a real implementation, you would:
    // 1. Use Google Calendar API to create event
    // 2. Enable Google Meet for the event
    // 3. Get the actual meet link from the event

    const meeting: MeetingResponse = {
      meeting_id: meetingId,
      title: meetingData.title,
      start_time: meetingData.start_time,
      join_url: joinUrl,
    };

    // Save meeting to Firestore
    await admin.firestore().collection('meetings').doc(meetingId).set({
      ...meeting,
      created_at: admin.firestore.Timestamp.now(),
      status: 'scheduled'
    });

    res.json({
      success: true,
      data: meeting
    });

  } catch (error: any) {
    console.error("Create meeting error:", error);
    res.status(500).json(handleError(error));
  }
});

/**
 * List meetings for a user
 */
export const meetListMeetings = functions.https.onRequest(async (req, res) => {
  try {
    if (req.method !== 'GET') {
      res.status(405).json({
        success: false,
        error: { code: "METHOD_NOT_ALLOWED", message: "Only GET method allowed" }
      });
      return;
    }

    const userId = req.query.user_id as string;
    if (!userId) {
      res.status(400).json({
        success: false,
        error: { code: "VALIDATION_ERROR", message: "user_id parameter required" }
      });
      return;
    }

    // Get meetings from Firestore (simplified)
    const meetingsSnapshot = await admin.firestore()
      .collection('meetings')
      .where('created_by', '==', userId)
      .orderBy('created_at', 'desc')
      .limit(50)
      .get();

    const meetings = meetingsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json({
      success: true,
      data: {
        meetings,
        total: meetings.length
      }
    });

  } catch (error: any) {
    console.error("List meetings error:", error);
    res.status(500).json(handleError(error));
  }
});

/**
 * Update an existing meeting
 */
export const meetUpdateMeeting = functions.https.onRequest(async (req, res) => {
  try {
    if (req.method !== 'PUT') {
      res.status(405).json({
        success: false,
        error: { code: "METHOD_NOT_ALLOWED", message: "Only PUT method allowed" }
      });
      return;
    }

    const meetingId = req.query.meeting_id as string;
    if (!meetingId) {
      res.status(400).json({
        success: false,
        error: { code: "VALIDATION_ERROR", message: "meeting_id parameter required" }
      });
      return;
    }

    const updateData = req.body;
    
    // Update meeting in Firestore
    await admin.firestore().collection('meetings').doc(meetingId).update({
      ...updateData,
      updated_at: admin.firestore.Timestamp.now()
    });

    res.json({
      success: true,
      message: "Meeting updated successfully"
    });

  } catch (error: any) {
    console.error("Update meeting error:", error);
    res.status(500).json(handleError(error));
  }
});

/**
 * Delete a meeting
 */
export const meetDeleteMeeting = functions.https.onRequest(async (req, res) => {
  try {
    if (req.method !== 'DELETE') {
      res.status(405).json({
        success: false,
        error: { code: "METHOD_NOT_ALLOWED", message: "Only DELETE method allowed" }
      });
      return;
    }

    const meetingId = req.query.meeting_id as string;
    if (!meetingId) {
      res.status(400).json({
        success: false,
        error: { code: "VALIDATION_ERROR", message: "meeting_id parameter required" }
      });
      return;
    }

    // Delete meeting from Firestore
    await admin.firestore().collection('meetings').doc(meetingId).delete();

    res.json({
      success: true,
      message: "Meeting deleted successfully"
    });

  } catch (error: any) {
    console.error("Delete meeting error:", error);
    res.status(500).json(handleError(error));
  }
});

/**
 * Generate a join link for an existing meeting
 */
export const meetGenerateJoinLink = functions.https.onRequest(async (req, res) => {
  try {
    if (req.method !== 'GET') {
      res.status(405).json({
        success: false,
        error: { code: "METHOD_NOT_ALLOWED", message: "Only GET method allowed" }
      });
      return;
    }

    const meetingId = req.query.meeting_id as string;
    if (!meetingId) {
      res.status(400).json({
        success: false,
        error: { code: "VALIDATION_ERROR", message: "meeting_id parameter required" }
      });
      return;
    }

    // Get meeting from Firestore
    const meetingDoc = await admin.firestore().collection('meetings').doc(meetingId).get();
    
    if (!meetingDoc.exists) {
      res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Meeting not found" }
      });
      return;
    }

    const meeting = meetingDoc.data();
    
    res.json({
      success: true,
      data: {
        meeting_id: meetingId,
        join_url: meeting?.join_url,
        title: meeting?.title,
        start_time: meeting?.start_time
      }
    });

  } catch (error: any) {
    console.error("Generate join link error:", error);
    res.status(500).json(handleError(error));
  }
});