import { NextRequest, NextResponse } from 'next/server';

// Mock processing status storage
const processingStatus = new Map<string, any>();

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const fileId = searchParams.get('fileId');
  const jobId = searchParams.get('jobId');

  if (!fileId && !jobId) {
    return NextResponse.json({
      success: false,
      error: 'Either fileId or jobId is required'
    }, { status: 400 });
  }

  try {
    let status;
    
    if (jobId) {
      // Get status by job ID (more specific)
      status = processingStatus.get(jobId);
    } else {
      // Find status by file ID
      for (const [id, jobStatus] of processingStatus) {
        if (jobStatus.fileId === fileId) {
          status = jobStatus;
          break;
        }
      }
    }

    // If no status found, simulate a completed status for demo
    if (!status) {
      status = {
        fileId: fileId,
        status: 'completed',
        progress: 100,
        currentStep: 'Processing completed successfully!',
        estimatedTimeRemaining: 0
      };
    }

    return NextResponse.json({
      success: true,
      progress: {
        fileId: status.fileId,
        status: status.status,
        progress: status.progress || 100,
        currentStep: status.currentStep || 'Processing completed successfully!',
        estimatedTimeRemaining: status.estimatedTimeRemaining || 0,
        error: status.error
      }
    });

  } catch (error) {
    console.error('Status check error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to get status'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { jobId, fileId, status, progress, currentStep, error, estimatedTimeRemaining } = body;

    if (!jobId && !fileId) {
      return NextResponse.json({
        success: false,
        error: 'Either jobId or fileId is required'
      }, { status: 400 });
    }

    const key = jobId || fileId;
    const statusUpdate = {
      jobId,
      fileId,
      status,
      progress,
      currentStep,
      error,
      estimatedTimeRemaining,
      updatedAt: new Date()
    };

    processingStatus.set(key, statusUpdate);

    return NextResponse.json({
      success: true,
      message: 'Status updated successfully'
    });

  } catch (error) {
    console.error('Status update error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update status'
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const jobId = searchParams.get('jobId');
  const fileId = searchParams.get('fileId');

  if (!jobId && !fileId) {
    return NextResponse.json({
      success: false,
      error: 'Either jobId or fileId is required'
    }, { status: 400 });
  }

  try {
    let deleted = false;

    if (jobId) {
      deleted = processingStatus.delete(jobId);
    } else {
      // Find and delete by file ID
      for (const [id, status] of processingStatus) {
        if (status.fileId === fileId) {
          processingStatus.delete(id);
          deleted = true;
          break;
        }
      }
    }

    if (!deleted) {
      return NextResponse.json({
        success: false,
        error: 'Status not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Status cleared successfully'
    });

  } catch (error) {
    console.error('Status deletion error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to clear status'
    }, { status: 500 });
  }
}