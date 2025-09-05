import { NextRequest, NextResponse } from 'next/server';
import { getChurchBySubdomain } from '@/lib/auth';
import { ApiResponse } from '@/lib/types';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ subdomain: string }> }
) {
  const { subdomain } = await params;
  try {
    if (!subdomain || subdomain.trim() === '') {
      return NextResponse.json({
        success: false,
        error: 'Subdomain is required'
      } as ApiResponse, { status: 400 });
    }
    
    const church = await getChurchBySubdomain(subdomain);
    
    if (!church) {
      return NextResponse.json({
        success: false,
        error: 'Church not found'
      } as ApiResponse, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      data: church
    } as ApiResponse);
    
  } catch (error) {
    console.error('Error fetching church by subdomain:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse, { status: 500 });
  }
}