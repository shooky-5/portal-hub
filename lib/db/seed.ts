import { query } from './index';
import fs from 'fs';
import path from 'path';

/**
 * Database seeding script
 * Initializes tables and populates with demo data
 */

export async function initializeDatabase() {
  try {
    console.log('🔧 Initializing database...');

    // Read and execute schema
    const schemaPath = path.join(process.cwd(), 'lib', 'db', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');

    // Execute schema statements
    const statements = schema
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    for (const statement of statements) {
      await query(statement);
    }

    console.log('✅ Schema initialized');

    // Seed demo user
    await seedDemoUser();

    // Seed apps
    await seedApps();

    // Seed platform components
    await seedPlatformComponents();

    // Seed demo sessions
    await seedDemoSessions();

    console.log('✅ Database seeding complete');
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    throw error;
  }
}

async function seedDemoUser() {
  // Check if demo user exists
  const result = await query(
    'SELECT id FROM users WHERE email = $1',
    ['demo@armory.gov']
  );

  if (result.rows.length > 0) {
    console.log('✓ Demo user already exists');
    return;
  }

  // Create demo user
  await query(
    `INSERT INTO users
     (email, full_name, org_unit, classification_level)
     VALUES ($1, $2, $3, $4)`,
    [
      'demo@armory.gov',
      'DEMO.ANALYST',
      'Strategic Intelligence',
      'UNCLASSIFIED',
    ]
  );

  console.log('✓ Demo user created');
}

async function seedApps() {
  // Check if apps exist
  const result = await query('SELECT COUNT(*) as count FROM apps');

  if (result.rows[0].count > 0) {
    console.log('✓ Apps already seeded');
    return;
  }

  const apps = [
    {
      id: 'dios',
      name: 'DIOS',
      full: 'Decision Intelligence Operating System',
      desc: 'Selects, executes, and adversarially challenges analytical frameworks through structured agent panels.',
      status: 'active',
      url: 'https://dios.analyticarmory.com',
      color: '#3B82F6',
      icon: 'layers',
    },
    {
      id: 'xrl',
      name: 'xRL Compass',
      full: 'xRL Compass',
      desc: 'Advanced red team and adversarial analysis platform.',
      status: 'active',
      url: 'https://compass.analyticarmory.com/',
      color: '#EF4444',
      icon: 'shield',
    },
    {
      id: 'trizoning',
      name: 'TriZoning',
      full: 'TriZoning Consensus Framework',
      desc: 'Three-zone analytical consensus building and debate resolution.',
      status: 'under_development',
      url: '#',
      color: '#EC4899',
      icon: 'network',
    },
  ];

  for (const app of apps) {
    await query(
      `INSERT INTO apps
       (id, name, full_name, description, status, url, color, icon)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        app.id,
        app.name,
        app.full,
        app.desc,
        app.status,
        app.url,
        app.color,
        app.icon,
      ]
    );
  }

  console.log('✓ Apps seeded');
}

async function seedPlatformComponents() {
  // Check if components exist
  const result = await query(
    'SELECT COUNT(*) as count FROM platform_components'
  );

  if (result.rows[0].count > 0) {
    console.log('✓ Platform components already seeded');
    return;
  }

  const components = [
    {
      id: 'agentic_framework',
      label: 'Agentic Framework',
      note: 'All agent panels responding',
    },
    {
      id: 'data_integrity',
      label: 'Data Integrity Layer',
      note: 'Data validation systems operational',
    },
    {
      id: 'session_management',
      label: 'Session Management',
      note: 'User session tracking active',
    },
    {
      id: 'analytics_pipeline',
      label: 'Analytics Pipeline',
      note: 'Processing and analysis engines running',
    },
    {
      id: 'integration_hub',
      label: 'Integration Hub',
      note: 'External integrations synchronized',
    },
  ];

  for (const component of components) {
    await query(
      `INSERT INTO platform_components
       (id, label, status, note)
       VALUES ($1, $2, $3, $4)`,
      [component.id, component.label, 'operational', component.note]
    );

    // Also add to status history
    await query(
      `INSERT INTO component_status_history
       (component_id, status, note)
       VALUES ($1, $2, $3)`,
      [component.id, 'operational', component.note]
    );
  }

  console.log('✓ Platform components seeded');
}

async function seedDemoSessions() {
  // Get demo user
  const userResult = await query(
    'SELECT id FROM users WHERE email = $1',
    ['demo@armory.gov']
  );

  if (userResult.rows.length === 0) {
    console.log('⚠ Demo user not found, skipping sessions');
    return;
  }

  const userId = userResult.rows[0].id;

  // Check if sessions exist
  const existingResult = await query(
    'SELECT COUNT(*) as count FROM user_app_sessions WHERE user_id = $1',
    [userId]
  );

  if (existingResult.rows[0].count > 0) {
    console.log('✓ Demo sessions already exist');
    return;
  }

  // Create demo sessions
  const sessions = [
    {
      app_id: 'dios',
      topic: 'Iran proliferation pathways — ACH run',
      hours_ago: 2,
    },
    {
      app_id: 'compass',
      topic: 'East Asia regional power analysis',
      hours_ago: 4,
    },
    {
      app_id: 'dios',
      topic: 'Russia sanctions impact assessment',
      hours_ago: 6,
    },
    {
      app_id: 'spycraft',
      topic: 'Source validation and tradecraft review',
      hours_ago: 8,
    },
    {
      app_id: 'forecasting',
      topic: 'Election outcome probability modeling',
      hours_ago: 12,
    },
  ];

  for (const session of sessions) {
    const launchedAt = new Date(
      Date.now() - session.hours_ago * 60 * 60 * 1000
    );

    await query(
      `INSERT INTO user_app_sessions
       (user_id, app_id, topic, launched_at)
       VALUES ($1, $2, $3, $4)`,
      [userId, session.app_id, session.topic, launchedAt]
    );

    // Also update last_run for this app
    await query(
      `INSERT INTO user_app_last_run
       (user_id, app_id, last_run_at)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, app_id)
       DO UPDATE SET last_run_at = $3`,
      [userId, session.app_id, launchedAt]
    );
  }

  console.log('✓ Demo sessions created');
}
