// Database connection and multi-tenant utilities

import { Pool } from 'pg';

// Database connection pool
class DatabaseManager {
  private static instance: DatabaseManager;
  private pool: Pool;
  private tenantConnections: Map<string, Pool> = new Map();

  private constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  }

  public static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  // Get main database connection (for shared tables)
  public getMainConnection(): Pool {
    return this.pool;
  }

  // Get tenant-specific connection
  public getTenantConnection(tenantId: string): Pool {
    if (!this.tenantConnections.has(tenantId)) {
      const tenantPool = new Pool({
        connectionString: process.env.DATABASE_URL,
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      });
      this.tenantConnections.set(tenantId, tenantPool);
    }
    return this.tenantConnections.get(tenantId)!;
  }

  // Execute query on main database
  public async executeMain(query: string, params: any[] = []): Promise<any> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(query, params);
      return result;
    } finally {
      client.release();
    }
  }

  // Execute query on tenant-specific schema
  public async executeTenant(tenantId: string, query: string, params: any[] = []): Promise<any> {
    const pool = this.getTenantConnection(tenantId);
    const client = await pool.connect();
    try {
      // Set search path to tenant schema
      await client.query(`SET search_path TO tenant_${tenantId}, public`);
      const result = await client.query(query, params);
      return result;
    } finally {
      client.release();
    }
  }

  // Create tenant schema
  public async createTenantSchema(tenantId: string): Promise<void> {
    const schemaName = `tenant_${tenantId}`;
    
    await this.executeMain(`CREATE SCHEMA IF NOT EXISTS ${schemaName}`);
    
    // Create tenant-specific tables
    const tenantTables = [
      `
      CREATE TABLE IF NOT EXISTS ${schemaName}.members (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        church_id UUID NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(20),
        birth_date DATE,
        address JSONB,
        photo TEXT,
        baptism_date DATE,
        membership_date DATE NOT NULL DEFAULT CURRENT_DATE,
        is_active BOOLEAN DEFAULT true,
        cell_group_id UUID,
        ministries TEXT[],
        emergency_contact JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      `
      CREATE TABLE IF NOT EXISTS ${schemaName}.cell_groups (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        church_id UUID NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        leader_id UUID NOT NULL,
        co_leader_id UUID,
        address JSONB NOT NULL,
        meeting_day VARCHAR(20) NOT NULL,
        meeting_time TIME NOT NULL,
        is_active BOOLEAN DEFAULT true,
        max_members INTEGER,
        current_members INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      `
      CREATE TABLE IF NOT EXISTS ${schemaName}.worship_teams (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        church_id UUID NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        leader_id UUID NOT NULL,
        ministry VARCHAR(100) NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      `
      CREATE TABLE IF NOT EXISTS ${schemaName}.worship_team_members (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        team_id UUID NOT NULL,
        member_id UUID NOT NULL,
        role VARCHAR(100) NOT NULL,
        instrument VARCHAR(100),
        skills TEXT[],
        availability JSONB,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (team_id) REFERENCES ${schemaName}.worship_teams(id) ON DELETE CASCADE
      )`,
      `
      CREATE TABLE IF NOT EXISTS ${schemaName}.songs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        church_id UUID NOT NULL,
        title VARCHAR(255) NOT NULL,
        artist VARCHAR(255),
        key VARCHAR(10),
        tempo INTEGER,
        genre VARCHAR(100),
        lyrics TEXT,
        chords TEXT,
        ccli_number VARCHAR(50),
        duration INTEGER,
        difficulty VARCHAR(20) CHECK (difficulty IN ('easy', 'medium', 'hard')),
        tags TEXT[],
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      `
      CREATE TABLE IF NOT EXISTS ${schemaName}.setlists (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        church_id UUID NOT NULL,
        name VARCHAR(255) NOT NULL,
        event_date DATE NOT NULL,
        event_type VARCHAR(100) NOT NULL,
        team_id UUID NOT NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (team_id) REFERENCES ${schemaName}.worship_teams(id)
      )`,
      `
      CREATE TABLE IF NOT EXISTS ${schemaName}.setlist_songs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        setlist_id UUID NOT NULL,
        song_id UUID NOT NULL,
        song_order INTEGER NOT NULL,
        key VARCHAR(10),
        notes TEXT,
        FOREIGN KEY (setlist_id) REFERENCES ${schemaName}.setlists(id) ON DELETE CASCADE,
        FOREIGN KEY (song_id) REFERENCES ${schemaName}.songs(id)
      )`,
      `
      CREATE TABLE IF NOT EXISTS ${schemaName}.chat_messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        sender_id UUID NOT NULL,
        receiver_id UUID,
        group_id UUID,
        content TEXT NOT NULL,
        type VARCHAR(20) DEFAULT 'text' CHECK (type IN ('text', 'image', 'file', 'system')),
        file_url TEXT,
        file_name TEXT,
        is_read BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      `
      CREATE TABLE IF NOT EXISTS ${schemaName}.notifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
        church_id UUID NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR(20) DEFAULT 'info' CHECK (type IN ('info', 'warning', 'error', 'success')),
        is_read BOOLEAN DEFAULT false,
        action_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`
    ];

    for (const tableSQL of tenantTables) {
      await this.executeMain(tableSQL);
    }

    // Create indexes for better performance
    const indexes = [
      `CREATE INDEX IF NOT EXISTS idx_${schemaName}_members_church_id ON ${schemaName}.members(church_id)`,
      `CREATE INDEX IF NOT EXISTS idx_${schemaName}_members_email ON ${schemaName}.members(email)`,
      `CREATE INDEX IF NOT EXISTS idx_${schemaName}_members_cell_group ON ${schemaName}.members(cell_group_id)`,
      `CREATE INDEX IF NOT EXISTS idx_${schemaName}_cell_groups_church_id ON ${schemaName}.cell_groups(church_id)`,
      `CREATE INDEX IF NOT EXISTS idx_${schemaName}_songs_church_id ON ${schemaName}.songs(church_id)`,
      `CREATE INDEX IF NOT EXISTS idx_${schemaName}_chat_messages_group_id ON ${schemaName}.chat_messages(group_id)`,
      `CREATE INDEX IF NOT EXISTS idx_${schemaName}_notifications_user_id ON ${schemaName}.notifications(user_id)`
    ];

    for (const indexSQL of indexes) {
      await this.executeMain(indexSQL);
    }
  }

  // Delete tenant schema (for church deletion)
  public async deleteTenantSchema(tenantId: string): Promise<void> {
    const schemaName = `tenant_${tenantId}`;
    await this.executeMain(`DROP SCHEMA IF EXISTS ${schemaName} CASCADE`);
    
    // Close tenant connection
    if (this.tenantConnections.has(tenantId)) {
      await this.tenantConnections.get(tenantId)!.end();
      this.tenantConnections.delete(tenantId);
    }
  }

  // Close all connections
  public async closeAll(): Promise<void> {
    await this.pool.end();
    for (const [, pool] of this.tenantConnections) {
      await pool.end();
    }
    this.tenantConnections.clear();
  }
}

// Shared database schema initialization
export async function initializeSharedSchema(): Promise<void> {
  const db = DatabaseManager.getInstance();
  
  const sharedTables = [
    `
    CREATE TABLE IF NOT EXISTS churches (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL,
      subdomain VARCHAR(100) UNIQUE NOT NULL,
      address TEXT NOT NULL,
      phone VARCHAR(20),
      email VARCHAR(255) UNIQUE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      is_active BOOLEAN DEFAULT true,
      subscription_status VARCHAR(20) DEFAULT 'trial' CHECK (subscription_status IN ('active', 'inactive', 'suspended', 'trial')),
      member_count INTEGER DEFAULT 0,
      monthly_fee DECIMAL(10,2) DEFAULT 0.00,
      admin_user_id UUID
    )`,
    `
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email VARCHAR(255) UNIQUE NOT NULL,
      name VARCHAR(255) NOT NULL,
      phone VARCHAR(20),
      avatar TEXT,
      role VARCHAR(50) NOT NULL CHECK (role IN ('super_admin', 'church_admin', 'pastor', 'leader', 'member', 'visitor')),
      church_id UUID,
      is_active BOOLEAN DEFAULT true,
      last_login TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      two_factor_enabled BOOLEAN DEFAULT false,
      password_hash TEXT NOT NULL,
      FOREIGN KEY (church_id) REFERENCES churches(id) ON DELETE SET NULL
    )`,
    `
    CREATE TABLE IF NOT EXISTS payments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      church_id UUID NOT NULL,
      amount DECIMAL(10,2) NOT NULL,
      member_count INTEGER NOT NULL,
      method VARCHAR(20) NOT NULL CHECK (method IN ('pix', 'credit_card', 'boleto')),
      status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'cancelled')),
      due_date DATE NOT NULL,
      paid_at TIMESTAMP,
      transaction_id TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (church_id) REFERENCES churches(id) ON DELETE CASCADE
    )`,
    `
    CREATE TABLE IF NOT EXISTS audit_logs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL,
      church_id UUID,
      action VARCHAR(255) NOT NULL,
      entity_type VARCHAR(100) NOT NULL,
      entity_id UUID NOT NULL,
      old_values JSONB,
      new_values JSONB,
      ip_address INET,
      user_agent TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (church_id) REFERENCES churches(id) ON DELETE SET NULL
    )`,
    `
    CREATE TABLE IF NOT EXISTS consent_records (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL,
      church_id UUID NOT NULL,
      purpose VARCHAR(255) NOT NULL,
      consent_given BOOLEAN NOT NULL,
      consent_date TIMESTAMP NOT NULL,
      withdrawn_date TIMESTAMP,
      ip_address INET,
      user_agent TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (church_id) REFERENCES churches(id) ON DELETE CASCADE
    )`,
    `
    CREATE TABLE IF NOT EXISTS data_requests (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL,
      church_id UUID NOT NULL,
      type VARCHAR(20) NOT NULL CHECK (type IN ('access', 'deletion', 'portability', 'rectification')),
      status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'denied')),
      request_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      completed_date TIMESTAMP,
      notes TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (church_id) REFERENCES churches(id) ON DELETE CASCADE
    )`
  ];

  for (const tableSQL of sharedTables) {
    await db.executeMain(tableSQL);
  }

  // Create indexes for shared tables
  const sharedIndexes = [
    'CREATE INDEX IF NOT EXISTS idx_churches_subdomain ON churches(subdomain)',
    'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)',
    'CREATE INDEX IF NOT EXISTS idx_users_church_id ON users(church_id)',
    'CREATE INDEX IF NOT EXISTS idx_payments_church_id ON payments(church_id)',
    'CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id)',
    'CREATE INDEX IF NOT EXISTS idx_audit_logs_church_id ON audit_logs(church_id)',
    'CREATE INDEX IF NOT EXISTS idx_consent_records_user_id ON consent_records(user_id)'
  ];

  for (const indexSQL of sharedIndexes) {
    await db.executeMain(indexSQL);
  }
}

export default DatabaseManager;