import { NextRequest, NextResponse } from 'next/server';
import { hashPassword } from '@/lib/auth';
import { UserRole, ApiResponse } from '@/lib/types';
import DatabaseManager, { initializeSharedSchema } from '@/lib/database';
import { z } from 'zod';

const registerChurchSchema = z.object({
  name: z.string().min(1, 'Nome da igreja é obrigatório'),
  subdomain: z.string()
    .min(1, 'Subdomínio é obrigatório')
    .regex(/^[a-z0-9-]+$/, 'Subdomínio deve conter apenas letras minúsculas, números e hífens'),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Email da igreja deve ser válido'),
  adminName: z.string().min(1, 'Nome do administrador é obrigatório'),
  adminEmail: z.string().email('Email do administrador deve ser válido'),
  adminPassword: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres'),
  confirmPassword: z.string(),
  acceptTerms: z.boolean().refine((val) => val === true, 'Você deve aceitar os termos de uso'),
  acceptPrivacy: z.boolean().refine((val) => val === true, 'Você deve aceitar a política de privacidade'),
}).refine((data) => data.adminPassword === data.confirmPassword, {
  message: 'Senhas não coincidem',
  path: ['confirmPassword'],
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request data
    const validationResult = registerChurchSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Dados inválidos',
        errors: validationResult.error.flatten().fieldErrors
      } as ApiResponse, { status: 400 });
    }
    
    const data = validationResult.data;
    
    // Initialize database if needed
    await initializeSharedSchema();
    
    const db = DatabaseManager.getInstance();
    
    // Check if subdomain already exists
    const existingChurchResult = await db.executeMain(
      'SELECT id FROM churches WHERE subdomain = $1',
      [data.subdomain]
    );
    
    if (existingChurchResult.rows.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'Subdomínio já está em uso'
      } as ApiResponse, { status: 409 });
    }
    
    // Check if admin email already exists
    const existingUserResult = await db.executeMain(
      'SELECT id FROM users WHERE email = $1',
      [data.adminEmail]
    );
    
    if (existingUserResult.rows.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'Email do administrador já está em uso'
      } as ApiResponse, { status: 409 });
    }
    
    // Start transaction
    const client = await db.getMainConnection().connect();
    
    try {
      await client.query('BEGIN');
      
      // Create church record
      const churchResult = await client.query(`
        INSERT INTO churches (
          name, subdomain, address, phone, email, 
          subscription_status, member_count, monthly_fee
        ) VALUES ($1, $2, $3, $4, $5, 'trial', 0, 0.00)
        RETURNING id, subdomain
      `, [
        data.name,
        data.subdomain,
        data.address || '',
        data.phone || '',
        data.email
      ]);
      
      const church = churchResult.rows[0];
      const churchId = church.id;
      
      // Hash password
      const passwordHash = await hashPassword(data.adminPassword);
      
      // Create admin user
      const userResult = await client.query(`
        INSERT INTO users (
          email, password_hash, name, role, church_id, is_active
        ) VALUES ($1, $2, $3, $4, $5, true)
        RETURNING id
      `, [
        data.adminEmail,
        passwordHash,
        data.adminName,
        UserRole.CHURCH_ADMIN,
        churchId
      ]);
      
      const adminUserId = userResult.rows[0].id;
      
      // Update church with admin user ID
      await client.query(
        'UPDATE churches SET admin_user_id = $1 WHERE id = $2',
        [adminUserId, churchId]
      );
      
      // Create tenant schema for the church
      await db.createTenantSchema(churchId);
      
      // Create consent records for LGPD compliance
      const consentPurposes = [
        'Sistema de gestão da igreja',
        'Comunicação entre membros',
        'Relatórios e estatísticas',
        'Cobrança de mensalidades'
      ];
      
      for (const purpose of consentPurposes) {
        await client.query(`
          INSERT INTO consent_records (
            user_id, church_id, purpose, consent_given, 
            consent_date, ip_address, user_agent
          ) VALUES ($1, $2, $3, true, CURRENT_TIMESTAMP, $4, $5)
        `, [
          adminUserId,
          churchId,
          purpose,
          request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
          request.headers.get('user-agent') || 'unknown'
        ]);
      }
      
      await client.query('COMMIT');
      
      return NextResponse.json({
        success: true,
        data: {
          churchId,
          subdomain: church.subdomain,
          adminUserId,
          message: 'Igreja registrada com sucesso! Você receberá um email de confirmação em breve.'
        }
      } as ApiResponse);
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('Error registering church:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor. Tente novamente mais tarde.'
    } as ApiResponse, { status: 500 });
  }
}