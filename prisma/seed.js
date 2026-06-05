import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

// Match the hashing from auth config
function hashPassword(password) {
  return Buffer.from(password).toString('base64');
}

async function seed() {
  try {
    const seedUsers = [
      { email: 'sarah.chen@techcorp.com', name: 'Sarah Chen' },
      { email: 'marcus.johnson@techcorp.com', name: 'Marcus Johnson' },
      { email: 'jessica.park@techcorp.com', name: 'Jessica Park' },
      { email: 'alex.rodriguez@techcorp.com', name: 'Alex Rodriguez' },
    ];

    const users = await Promise.all(
      seedUsers.map((user) =>
        db.user.upsert({
          where: { email: user.email },
          update: { name: user.name },
          create: {
            email: user.email,
            name: user.name,
            password: hashPassword('password123'),
          },
        })
      )
    );

    const [sarah, marcus, jessica, alex] = users;

    // Create realistic notebooks for product team
    const productRoadmap = await db.notebook.upsert({
      where: { id: 'seed-product-roadmap' },
      update: {
        title: 'Q2-Q3 Product Roadmap',
        description: 'Strategic planning and feature prioritization for next two quarters',
      },
      create: {
        id: 'seed-product-roadmap',
        title: 'Q2-Q3 Product Roadmap',
        description: 'Strategic planning and feature prioritization for next two quarters',
      },
    });

    const designSystem = await db.notebook.upsert({
      where: { id: 'seed-design-system' },
      update: {
        title: 'Design System v2.0',
        description: 'Component library and design guidelines for the platform',
      },
      create: {
        id: 'seed-design-system',
        title: 'Design System v2.0',
        description: 'Component library and design guidelines for the platform',
      },
    });

    const apiDocs = await db.notebook.upsert({
      where: { id: 'seed-api-docs' },
      update: {
        title: 'REST API Documentation',
        description: 'Complete API reference and integration guidelines',
      },
      create: {
        id: 'seed-api-docs',
        title: 'REST API Documentation',
        description: 'Complete API reference and integration guidelines',
      },
    });

    const membershipTargets = [
      { notebookId: productRoadmap.id, userId: sarah.id, role: 'OWNER' },
      { notebookId: productRoadmap.id, userId: marcus.id, role: 'EDITOR' },
      { notebookId: productRoadmap.id, userId: jessica.id, role: 'VIEWER' },
      { notebookId: designSystem.id, userId: jessica.id, role: 'OWNER' },
      { notebookId: designSystem.id, userId: sarah.id, role: 'EDITOR' },
      { notebookId: designSystem.id, userId: alex.id, role: 'EDITOR' },
      { notebookId: apiDocs.id, userId: marcus.id, role: 'OWNER' },
      { notebookId: apiDocs.id, userId: alex.id, role: 'EDITOR' },
    ];

    await Promise.all(
      membershipTargets.map((entry) =>
        db.notebookUser.upsert({
          where: {
            userId_notebookId: {
              userId: entry.userId,
              notebookId: entry.notebookId,
            },
          },
          update: { role: entry.role },
          create: entry,
        })
      )
    );

    // Add realistic notes to roadmap
    await db.note.upsert({
      where: { id: 'seed-note-auth-overhaul' },
      update: {
        title: 'Priority: User Authentication Overhaul',
        content: `### Overview\nUpgrade authentication system to OAuth 2.0 with support for multiple providers.\n\n### Requirements\n- Support GitHub, Google, and Microsoft login\n- Implement MFA for enterprise accounts\n- Maintain backward compatibility with existing API tokens\n\n### Timeline\nEstimated 6 weeks for design and implementation\n\n### Dependencies\n- Security audit completion\n- Legal review of privacy policy`,
        notebookId: productRoadmap.id,
        userId: sarah.id,
      },
      create: {
        id: 'seed-note-auth-overhaul',
        title: 'Priority: User Authentication Overhaul',
        content: `### Overview\nUpgrade authentication system to OAuth 2.0 with support for multiple providers.\n\n### Requirements\n- Support GitHub, Google, and Microsoft login\n- Implement MFA for enterprise accounts\n- Maintain backward compatibility with existing API tokens\n\n### Timeline\nEstimated 6 weeks for design and implementation\n\n### Dependencies\n- Security audit completion\n- Legal review of privacy policy`,
        notebookId: productRoadmap.id,
        userId: sarah.id,
      },
    });

    await db.note.upsert({
      where: { id: 'seed-note-dashboard-perf' },
      update: {
        title: 'Dashboard Performance Improvements',
        content: `Current load time: 3.2 seconds\nTarget: Under 1 second\n\nOptimization strategies:\n1. Implement virtual scrolling for large datasets\n2. Add server-side pagination\n3. Compress dashboard images by 60%\n4. Cache computed analytics results\n\nExpected improvement: 70% reduction in load time`,
        notebookId: productRoadmap.id,
        userId: marcus.id,
      },
      create: {
        id: 'seed-note-dashboard-perf',
        title: 'Dashboard Performance Improvements',
        content: `Current load time: 3.2 seconds\nTarget: Under 1 second\n\nOptimization strategies:\n1. Implement virtual scrolling for large datasets\n2. Add server-side pagination\n3. Compress dashboard images by 60%\n4. Cache computed analytics results\n\nExpected improvement: 70% reduction in load time`,
        notebookId: productRoadmap.id,
        userId: marcus.id,
      },
    });

    // Add notes to design system
    await db.note.upsert({
      where: { id: 'seed-note-button-variants' },
      update: {
        title: 'Button Component Variants',
        content: `Primary: Full-width with icon support\nSecondary: Outlined style\nTertiary: Text-only with hover state\nDanger: Red background for destructive actions\nLoading: Disabled state with spinner\n\nAll variants support disabled and loading states.\nAccessibility: WCAG AA compliant with proper contrast ratios.`,
        notebookId: designSystem.id,
        userId: jessica.id,
      },
      create: {
        id: 'seed-note-button-variants',
        title: 'Button Component Variants',
        content: `Primary: Full-width with icon support\nSecondary: Outlined style\nTertiary: Text-only with hover state\nDanger: Red background for destructive actions\nLoading: Disabled state with spinner\n\nAll variants support disabled and loading states.\nAccessibility: WCAG AA compliant with proper contrast ratios.`,
        notebookId: designSystem.id,
        userId: jessica.id,
      },
    });

    await db.note.upsert({
      where: { id: 'seed-note-color-palette' },
      update: {
        title: 'Color Palette Update',
        content: `Primary Blue: #0066CC\nSecondary Purple: #6B46C1\nSuccess Green: #059669\nWarning Orange: #D97706\nError Red: #DC2626\n\nNeutral grays: 50-950 scale for backgrounds and borders\n\nUsage guidelines:\n- Primary for main CTAs\n- Secondary for secondary actions\n- Status colors only for alerts/notifications`,
        notebookId: designSystem.id,
        userId: alex.id,
      },
      create: {
        id: 'seed-note-color-palette',
        title: 'Color Palette Update',
        content: `Primary Blue: #0066CC\nSecondary Purple: #6B46C1\nSuccess Green: #059669\nWarning Orange: #D97706\nError Red: #DC2626\n\nNeutral grays: 50-950 scale for backgrounds and borders\n\nUsage guidelines:\n- Primary for main CTAs\n- Secondary for secondary actions\n- Status colors only for alerts/notifications`,
        notebookId: designSystem.id,
        userId: alex.id,
      },
    });

    // Add notes to API docs
    await db.note.upsert({
      where: { id: 'seed-note-auth-endpoints' },
      update: {
        title: 'Authentication Endpoints',
        content: `POST /api/auth/login\nRequest: { email, password }\nResponse: { token, refreshToken, user }\n\nPOST /api/auth/refresh\nRequest: { refreshToken }\nResponse: { token, expiresIn }\n\nPOST /api/auth/logout\nRequest: { token }\nResponse: { success: true }\n\nAll requests require Content-Type: application/json\nAuth endpoints are rate-limited to 5 requests per minute`,
        notebookId: apiDocs.id,
        userId: marcus.id,
      },
      create: {
        id: 'seed-note-auth-endpoints',
        title: 'Authentication Endpoints',
        content: `POST /api/auth/login\nRequest: { email, password }\nResponse: { token, refreshToken, user }\n\nPOST /api/auth/refresh\nRequest: { refreshToken }\nResponse: { token, expiresIn }\n\nPOST /api/auth/logout\nRequest: { token }\nResponse: { success: true }\n\nAll requests require Content-Type: application/json\nAuth endpoints are rate-limited to 5 requests per minute`,
        notebookId: apiDocs.id,
        userId: marcus.id,
      },
    });

    await db.note.upsert({
      where: { id: 'seed-note-pagination' },
      update: {
        title: 'Pagination & Filtering',
        content: `Query Parameters:\n- page: Integer starting from 1 (default: 1)\n- limit: Integer 1-100 (default: 20)\n- sort: Field name with +/- prefix for direction\n- filter: JSON object for field-based filtering\n\nExample:\nGET /api/notebooks?page=2&limit=50&sort=-createdAt&filter={"shared":true}\n\nResponse includes:\n- data: Array of items\n- total: Total count before pagination\n- page: Current page number\n- nextPage: URL for next page (null if last page)`,
        notebookId: apiDocs.id,
        userId: alex.id,
      },
      create: {
        id: 'seed-note-pagination',
        title: 'Pagination & Filtering',
        content: `Query Parameters:\n- page: Integer starting from 1 (default: 1)\n- limit: Integer 1-100 (default: 20)\n- sort: Field name with +/- prefix for direction\n- filter: JSON object for field-based filtering\n\nExample:\nGET /api/notebooks?page=2&limit=50&sort=-createdAt&filter={"shared":true}\n\nResponse includes:\n- data: Array of items\n- total: Total count before pagination\n- page: Current page number\n- nextPage: URL for next page (null if last page)`,
        notebookId: apiDocs.id,
        userId: alex.id,
      },
    });

    console.log('✅ Seed data created successfully');
    console.log('\n📚 Available demo accounts:');
    console.log('  - sarah.chen@techcorp.com / password123');
    console.log('  - marcus.johnson@techcorp.com / password123');
    console.log('  - jessica.park@techcorp.com / password123');
    console.log('  - alex.rodriguez@techcorp.com / password123');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await db.$disconnect();
  }
}

seed();
