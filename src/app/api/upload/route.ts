import { NextRequest, NextResponse } from 'next/server';

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({
        success: false,
        error: 'No file provided'
      }, { status: 400 });
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({
        success: false,
        error: `File size too large. Maximum allowed: ${MAX_FILE_SIZE / (1024 * 1024)}MB`
      }, { status: 400 });
    }

    // Validate file format
    const fileName = file.name.toLowerCase();
    const supportedExtensions = ['.mp3', '.wav', '.flac', '.m4a', '.aac', '.ogg', '.wma', '.mp4', '.avi', '.mov', '.mkv', '.wmv', '.flv', '.webm'];
    const hasValidExtension = supportedExtensions.some(ext => fileName.endsWith(ext));
    
    if (!hasValidExtension) {
      return NextResponse.json({
        success: false,
        error: 'Unsupported file format. Please upload MP3, MP4, WAV, M4A, AVI, or MOV files.'
      }, { status: 400 });
    }

    // Generate unique file ID
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    const fileId = `${timestamp}-${randomId}`;
    
    // Get file extension and base name
    const lastDotIndex = file.name.lastIndexOf('.');
    const extension = lastDotIndex !== -1 ? file.name.substring(lastDotIndex) : '';
    const baseName = lastDotIndex !== -1 ? file.name.substring(0, lastDotIndex) : file.name;

    // Create response object with all required fields
    const uploadResponse = {
      success: true,
      file: {
        id: fileId,
        name: baseName,
        originalName: file.name,
        size: file.size,
        mimeType: file.type || 'application/octet-stream',
        uploadedAt: new Date().toISOString(),
        status: 'queued',
        duration: Math.floor(Math.random() * 300) + 60 // Mock 1-5 minutes
      },
      message: 'File uploaded successfully and queued for processing'
    };

    return NextResponse.json(uploadResponse);

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to upload file: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Upload endpoint ready',
    limits: {
      maxFileSize: MAX_FILE_SIZE,
      supportedFormats: ['.mp3', '.wav', '.flac', '.m4a', '.aac', '.ogg', '.wma', '.mp4', '.avi', '.mov', '.mkv', '.wmv', '.flv', '.webm']
    }
  });
}