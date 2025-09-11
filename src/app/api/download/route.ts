import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const fileId = searchParams.get('fileId');
  const trackType = searchParams.get('trackType'); // 'vocals', 'music', or 'original'

  if (!fileId || !trackType) {
    return NextResponse.json({
      success: false,
      error: 'File ID and track type are required'
    }, { status: 400 });
  }

  try {
    // Mock download URL generation
    const baseUrl = 'http://localhost:3000';
    const downloadUrl = `${baseUrl}/api/files/${fileId}/${trackType}`;
    
    // Set expiration time (24 hours from now)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    return NextResponse.json({
      success: true,
      downloadUrl,
      expiresAt,
      message: `Download URL generated for ${trackType} track`
    });

  } catch (error) {
    console.error('Download URL generation error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to generate download URL'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fileId, trackType } = body;

    if (!fileId || !trackType) {
      return NextResponse.json({
        success: false,
        error: 'File ID and track type are required'
      }, { status: 400 });
    }

    // Generate track-specific information
    let trackDescription = '';
    let fileName = '';
    
    if (trackType === 'vocals') {
      trackDescription = 'Voice-only track with all music/instruments removed using AI separation';
      fileName = `voice_only_${fileId.substring(0, 8)}.mp4`;
    } else if (trackType === 'music') {
      trackDescription = 'Music-only track with all vocals/voice removed using AI separation';
      fileName = `music_only_${fileId.substring(0, 8)}.mp4`;
    } else {
      trackDescription = 'Original processed track for comparison';
      fileName = `original_${fileId.substring(0, 8)}.mp4`;
    }

    // Generate secure download token
    const downloadToken = btoa(`${fileId}-${trackType}-${Date.now()}`);
    
    // Create download URL
    const downloadUrl = `/api/files/download?token=${downloadToken}&type=${trackType}`;
    
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    return NextResponse.json({
      success: true,
      downloadUrl,
      fileName,
      trackDescription,
      expiresAt,
      token: downloadToken,
      message: `${trackDescription} ready for download`
    });

  } catch (error) {
    console.error('Download preparation error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to prepare download'
    }, { status: 500 });
  }
}