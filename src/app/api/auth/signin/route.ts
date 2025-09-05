import { NextRequest, NextResponse } from 'next/server';
import { compare } from 'bcryptjs';
import DatabaseManager from '@/lib/database';
import { ApiResponse } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const { email, password, subdomain } = await request.json();
    
    if (!email || !password) {
      return NextResponse.json({
        success: false,
        error: 'Email e senha são obrigatórios'
      } as ApiResponse, { status: 400 });
    }
    
    const db = DatabaseManager.getInstance();
    
    // First, get church info if subdomain provided
    let churchId = null;
    if (subdomain && subdomain !== 'admin') {
      const churchResult = await db.executeMain(
        'SELECT id FROM churches WHERE subdomain = $1 AND is_active = true',
        [subdomain]
      );
      
      if (churchResult.rows.length === 0) {
        return NextResponse.json({
          success: false,
          error: 'Igreja não encontrada'
        } as ApiResponse, { status: 404 });
      }
      churchId = churchResult.rows[0].id;
    }
    
    // Get user by email
    const userResult = await db.executeMain(
      'SELECT id, email, name, password_hash, role, church_id, is_active FROM users WHERE email = $1',
      [email]
    );
    
    if (userResult.rows.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Usuário não encontrado'
      } as ApiResponse, { status: 401 });
    }
    
    const user = userResult.rows[0];
    
    // Check if user is active
    if (!user.is_active) {
      return NextResponse.json({
        success: false,
        error: 'Usuário inativo'
      } as ApiResponse, { status: 401 });
    }
    
    // For non-super admin users, check church association
    if (user.role !== 'super_admin') {
      if (!churchId || user.church_id !== churchId) {
        return NextResponse.json({
          success: false,
          error: 'Usuário não pertence a esta igreja'
        } as ApiResponse, { status: 401 });
      }
    }
    
    // Verify password
    const isValidPassword = await compare(password, user.password_hash);
    if (!isValidPassword) {
      return NextResponse.json({
        success: false,
        error: 'Senha inválida'
      } as ApiResponse, { status: 401 });
    }
    
    // Update last login
    await db.executeMain(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
      [user.id]
    );
    
    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        churchId: user.church_id,
      }
    } as ApiResponse);
    
  } catch (error) {
    console.error('Authentication error:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    } as ApiResponse, { status: 500 });
  }
}