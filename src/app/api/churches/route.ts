import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Church registration schema with LGPD compliance
const churchRegistrationSchema = z.object({
  name: z.string().min(2, 'Nome da igreja deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(10, 'Telefone deve ter pelo menos 10 dígitos'),
  address: z.object({
    street: z.string().min(5, 'Endereço deve ter pelo menos 5 caracteres'),
    number: z.string().min(1, 'Número é obrigatório'),
    complement: z.string().optional(),
    neighborhood: z.string().min(2, 'Bairro é obrigatório'),
    city: z.string().min(2, 'Cidade é obrigatória'),
    state: z.string().length(2, 'Estado deve ter 2 caracteres'),
    zipCode: z.string().regex(/^\d{5}-?\d{3}$/, 'CEP inválido'),
    country: z.string().default('Brasil')
  }),
  pastor: z.object({
    name: z.string().min(2, 'Nome do pastor é obrigatório'),
    email: z.string().email('Email do pastor inválido'),
    phone: z.string().min(10, 'Telefone do pastor é obrigatório')
  }),
  denomination: z.string().optional(),
  foundedYear: z.number().min(1800).max(new Date().getFullYear()).optional(),
  website: z.string().url().optional().or(z.literal('')),
  socialMedia: z.object({
    facebook: z.string().optional(),
    instagram: z.string().optional(),
    youtube: z.string().optional(),
    whatsapp: z.string().optional()
  }).optional(),
  lgpdConsent: z.boolean().refine(val => val === true, {
    message: 'Consentimento LGPD é obrigatório'
  }),
  termsAccepted: z.boolean().refine(val => val === true, {
    message: 'Aceite dos termos é obrigatório'
  }),
  dataProcessingConsent: z.boolean().refine(val => val === true, {
    message: 'Consentimento para processamento de dados é obrigatório'
  })
});

// Mock database - In production, this would be PostgreSQL
let churches: any[] = [];
let churchIdCounter = 1;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';

    // Filter churches based on search and status
    let filteredChurches = churches;

    if (search) {
      filteredChurches = filteredChurches.filter(church =>
        church.name.toLowerCase().includes(search.toLowerCase()) ||
        church.email.toLowerCase().includes(search.toLowerCase()) ||
        church.address.city.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (status) {
      filteredChurches = filteredChurches.filter(church => church.status === status);
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedChurches = filteredChurches.slice(startIndex, endIndex);

    return NextResponse.json({
      success: true,
      data: {
        churches: paginatedChurches,
        pagination: {
          page,
          limit,
          total: filteredChurches.length,
          totalPages: Math.ceil(filteredChurches.length / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching churches:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input data
    const validatedData = churchRegistrationSchema.parse(body);

    // Generate subdomain from church name
    const subdomain = validatedData.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    // Check if subdomain already exists
    const existingChurch = churches.find(church => church.subdomain === subdomain);
    if (existingChurch) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Uma igreja com nome similar já existe. Tente um nome diferente.' 
        },
        { status: 409 }
      );
    }

    // Check if email already exists
    const existingEmail = churches.find(church => church.email === validatedData.email);
    if (existingEmail) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Este email já está sendo usado por outra igreja.' 
        },
        { status: 409 }
      );
    }

    // Create new church record
    const newChurch = {
      id: churchIdCounter++,
      ...validatedData,
      subdomain,
      status: 'pending', // pending, approved, suspended, rejected
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      subscription: {
        plan: 'basic',
        status: 'trial',
        trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days trial
        memberCount: 0,
        monthlyFee: 0
      },
      settings: {
        timezone: 'America/Sao_Paulo',
        language: 'pt-BR',
        currency: 'BRL',
        features: {
          cellGroups: true,
          worshipTeams: true,
          chat: true,
          events: true,
          finance: false, // Premium feature
          streaming: false, // Premium feature
          analytics: false // Premium feature
        }
      },
      lgpdCompliance: {
        consentDate: new Date().toISOString(),
        dataProcessingPurpose: 'Gestão de membros e atividades da igreja',
        dataRetentionPeriod: '5 anos após inatividade',
        privacyPolicyVersion: '1.0',
        lastUpdated: new Date().toISOString()
      }
    };

    churches.push(newChurch);

    // Return success response without sensitive data
    const responseData = {
      id: newChurch.id,
      name: newChurch.name,
      subdomain: newChurch.subdomain,
      status: newChurch.status,
      createdAt: newChurch.createdAt,
      subscription: newChurch.subscription
    };

    return NextResponse.json({
      success: true,
      message: 'Igreja registrada com sucesso! Aguarde aprovação do administrador.',
      data: responseData
    }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Dados inválidos',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        },
        { status: 400 }
      );
    }

    console.error('Error creating church:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const churchId = searchParams.get('id');

    if (!churchId) {
      return NextResponse.json(
        { success: false, error: 'ID da igreja é obrigatório' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const churchIndex = churches.findIndex(church => church.id === parseInt(churchId));

    if (churchIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Igreja não encontrada' },
        { status: 404 }
      );
    }

    // Update church data
    churches[churchIndex] = {
      ...churches[churchIndex],
      ...body,
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      message: 'Igreja atualizada com sucesso',
      data: churches[churchIndex]
    });

  } catch (error) {
    console.error('Error updating church:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const churchId = searchParams.get('id');

    if (!churchId) {
      return NextResponse.json(
        { success: false, error: 'ID da igreja é obrigatório' },
        { status: 400 }
      );
    }

    const churchIndex = churches.findIndex(church => church.id === parseInt(churchId));

    if (churchIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Igreja não encontrada' },
        { status: 404 }
      );
    }

    // In production, this would be a soft delete with LGPD compliance
    const deletedChurch = churches.splice(churchIndex, 1)[0];

    return NextResponse.json({
      success: true,
      message: 'Igreja removida com sucesso',
      data: { id: deletedChurch.id, name: deletedChurch.name }
    });

  } catch (error) {
    console.error('Error deleting church:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}