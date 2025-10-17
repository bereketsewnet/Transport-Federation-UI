/**
 * seedAll.js
 * Full development seed for unions / members / related tables + Admin account
 *
 * Usage:
 * 1) npm i @faker-js/faker uuid bcryptjs dotenv
 * 2) node src/seed/seedAll.js
 *
 * Environment overrides (optional):
 * UNIONS_COUNT, MEMBERS_PER_UNION, CREATE_EXECUTIVES_PCT, LOGIN_ACCOUNT_PCT
 * ADMIN_USERNAME, ADMIN_PASSWORD, ADMIN_EMAIL, ADMIN_PHONE
 * TEST_USER1_USERNAME, TEST_USER1_PASSWORD, TEST_USER1_EMAIL
 * TEST_USER2_USERNAME, TEST_USER2_PASSWORD, TEST_USER2_EMAIL
 *
 * NOTE: Safe for dev only. Do not run in production.
 */

const sequelize = require('../config/db'); // your sequelize instance
const bcrypt = require('bcryptjs');
const { faker } = require('@faker-js/faker');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const UNIONS_COUNT = parseInt(process.env.UNIONS_COUNT || '20', 10);
const MEMBERS_PER_UNION = parseInt(process.env.MEMBERS_PER_UNION || '50', 10);
const CREATE_EXECUTIVES_PCT = parseFloat(process.env.CREATE_EXECUTIVES_PCT || '0.15'); // 15%
const LOGIN_ACCOUNT_PCT = parseFloat(process.env.LOGIN_ACCOUNT_PCT || '0.2'); // 20% of members get login accounts
const CBAS_PER_UNION = parseInt(process.env.CBAS_PER_UNION || '2', 10);
const GALLERIES_COUNT = parseInt(process.env.GALLERIES_COUNT || '6', 10);
const PHOTOS_PER_GALLERY = parseInt(process.env.PHOTOS_PER_GALLERY || '8', 10);
const CLEAR_EXISTING_DATA = process.env.CLEAR_EXISTING_DATA === 'true';

const PASSWORD = process.env.DEFAULT_USER_PASSWORD || 'Password123!';

// Admin credentials
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';
const ADMIN_PHONE = process.env.ADMIN_PHONE || '0912345678';

// Test user credentials
const TEST_USER1_USERNAME = process.env.TEST_USER1_USERNAME || 'testuser1';
const TEST_USER1_PASSWORD = process.env.TEST_USER1_PASSWORD || 'test123';
const TEST_USER1_EMAIL = process.env.TEST_USER1_EMAIL || 'testuser1@example.com';

const TEST_USER2_USERNAME = process.env.TEST_USER2_USERNAME || 'testuser2';
const TEST_USER2_PASSWORD = process.env.TEST_USER2_PASSWORD || 'test123';
const TEST_USER2_EMAIL = process.env.TEST_USER2_EMAIL || 'testuser2@example.com';

async function tryRequireModel(name) {
  try {
    return require(`../models/${name}.model`);
  } catch (err) {
    console.warn(`Model ../models/${name}.model not found — will fallback to raw SQL for "${name}" if needed.`);
    return null;
  }
}

/**
 * Ensure a table exists. If not, execute provided DDL to create it.
 * Returns true if table exists (or was created), false on failure.
 *
 * NOTE: we run this outside the main transaction because many MySQL setups
 * won't allow DDL in transactions to be rolled back.
 */
async function ensureTableExists(tableName, createDDL) {
  try {
    const [rows] = await sequelize.query(`SHOW TABLES LIKE ?`, { replacements: [tableName] });
    if (Array.isArray(rows) && rows.length > 0) {
      // table exists
      return true;
    }
    console.log(`Table "${tableName}" not found — creating it using DDL...`);
    await sequelize.query(createDDL);
    console.log(`Table "${tableName}" created.`);
    return true;
  } catch (err) {
    console.error(`Failed to ensure table ${tableName}:`, err);
    return false;
  }
}

async function clearExistingData() {
  console.log('Clearing existing data...');
  try {
    // Clear data in reverse dependency order
    await sequelize.query('DELETE FROM reports_cache');
    await sequelize.query('DELETE FROM photos');
    await sequelize.query('DELETE FROM galleries');
    await sequelize.query('DELETE FROM news');
    await sequelize.query('DELETE FROM contacts');
    await sequelize.query('DELETE FROM visitors');
    await sequelize.query('DELETE FROM archives');
    await sequelize.query('DELETE FROM terminated_unions');
    await sequelize.query('DELETE FROM organization_leaders');
    await sequelize.query('DELETE FROM cbas');
    await sequelize.query('DELETE FROM union_executives');
    await sequelize.query('DELETE FROM login_accounts');
    await sequelize.query('DELETE FROM members');
    await sequelize.query('DELETE FROM unions');
    console.log('Existing data cleared.');
  } catch (err) {
    console.warn('Failed to clear some existing data:', err.message);
  }
}

async function main() {
  console.log('Starting full DB seed...');

  // Try to load models — good if your project already exports them as files
  const Union = await tryRequireModel('union') || await tryRequireModel('unions');
  const Member = await tryRequireModel('member') || await tryRequireModel('members');
  const LoginAccount = await tryRequireModel('loginAccount') || await tryRequireModel('login_accounts');
  const UnionExecutive = await tryRequireModel('unionExecutive') || await tryRequireModel('union_executives');
  const CBA = await tryRequireModel('cba') || await tryRequireModel('cbas');
  const TerminatedUnion = await tryRequireModel('terminatedUnion') || await tryRequireModel('terminated_unions');
  const OrganizationLeader = await tryRequireModel('organizationLeader') || await tryRequireModel('organization_leaders');
  const Archive = await tryRequireModel('archive') || await tryRequireModel('archives');
  const Visitor = await tryRequireModel('visitor') || await tryRequireModel('visitors');
  const Contact = await tryRequireModel('contact') || await tryRequireModel('contacts');
  const News = await tryRequireModel('news') || await tryRequireModel('news');
  const Gallery = await tryRequireModel('gallery') || await tryRequireModel('galleries');
  const Photo = await tryRequireModel('photo') || await tryRequireModel('photos');
  const ReportsCache = await tryRequireModel('reportsCache') || await tryRequireModel('reports_cache');

  try {
    await sequelize.authenticate();
    console.log('Database connection OK.');

    // Sync models (creates tables if not exist). CAUTION: don't use force:true in prod.
    await sequelize.sync();
    console.log('Sequelize sync finished.');

    // Clear existing data if requested
    await clearExistingData();

    // Begin transaction for inserts (we'll do DDL checks outside)
    const t = await sequelize.transaction();

    try {
      // 1) Create Unions
      console.log(`Creating ${UNIONS_COUNT} unions...`);
      const unions = [];
      for (let i = 0; i < UNIONS_COUNT; i++) {
        const timestamp = Date.now();
        unions.push({
          union_code: `U${timestamp}${i}`,
          name_en: `${faker.company.name()} Union`,
          // small Amharic-like placeholder (faker has no Amharic locale)
          name_am: `ኢትዮጵያ ${faker.company.name().split(' ')[0]}`,
          sector: faker.helpers.arrayElement(['Transport', 'Electric', 'Telecom', 'Manufacturing', 'Public']),
          organization: faker.company.name(),
          established_date: faker.date.past({ years: 20 }),
          terms_of_election: faker.number.int({ min: 2, max: 6 }),
          general_assembly_date: faker.date.future({ years: 1 }),
          strategic_plan_in_place: faker.datatype.boolean() ? 1 : 0,
          external_audit_date: faker.date.recent({ days: 800 }),
        });
      }

      let createdUnions;
      if (Union && Union.bulkCreate) {
        createdUnions = await Union.bulkCreate(unions, { transaction: t, returning: true });
      } else {
        // fallback raw inserts
        createdUnions = [];
        for (const u of unions) {
          const [result] = await sequelize.query(
            `INSERT INTO unions (union_code,name_en,name_am,sector,organization,established_date,terms_of_election,general_assembly_date,strategic_plan_in_place,external_audit_date,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,NOW())`,
            { replacements: [u.union_code, u.name_en, u.name_am, u.sector, u.organization, u.established_date, u.terms_of_election, u.general_assembly_date, u.strategic_plan_in_place, u.external_audit_date], transaction: t }
          );
          const id = result && result.insertId ? result.insertId : null;
          createdUnions.push({ union_id: id });
        }
      }
      console.log(`Created ${createdUnions.length} unions.`);

      // 2) Create Members per union
      console.log(`Creating ${UNIONS_COUNT * MEMBERS_PER_UNION} members (${MEMBERS_PER_UNION} per union)...`);
      const membersToInsert = [];
      for (let i = 0; i < createdUnions.length; i++) {
        const unionId = createdUnions[i].union_id || (createdUnions[i].id || createdUnions[i].union_id);
        for (let j = 0; j < MEMBERS_PER_UNION; j++) {
          const first = faker.person.firstName();
          const father = faker.person.firstName();
          const surname = faker.person.lastName();
          const email = faker.internet.email({ firstName: first, lastName: surname }).toLowerCase();
          membersToInsert.push({
            mem_uuid: uuidv4(),
            union_id: unionId,
            member_code: `M-${unionId}-${String(j + 1).padStart(4, '0')}`,
            first_name: first,
            father_name: father,
            surname: surname,
            sex: faker.helpers.arrayElement(['M', 'F']),
            birthdate: faker.date.between({ from: '1960-01-01', to: '2002-12-31' }),
            education: faker.helpers.arrayElement(['None', 'Primary', 'Secondary', 'Diploma', 'Bachelors', 'Masters']),
            phone: `09${faker.string.numeric(8)}`,
            email,
            salary: parseFloat(faker.finance.amount(1000, 50000, 2)),
            registry_date: faker.date.past({ years: 5 }),
            is_active: faker.datatype.boolean() ? 1 : 0,
            created_at: new Date(),
            updated_at: new Date(),
          });
        }
      }

      let createdMembers = [];
      if (Member && Member.bulkCreate) {
        createdMembers = await Member.bulkCreate(membersToInsert, { transaction: t, returning: true });
      } else {
        createdMembers = [];
        for (const m of membersToInsert) {
          const [result] = await sequelize.query(
            `INSERT INTO members (mem_uuid, union_id, member_code, first_name, father_name, surname, sex, birthdate, education, phone, email, salary, registry_date, is_active, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
            { replacements: [m.mem_uuid, m.union_id, m.member_code, m.first_name, m.father_name, m.surname, m.sex, m.birthdate, m.education, m.phone, m.email, m.salary, m.registry_date, m.is_active, m.created_at, m.updated_at], transaction: t }
          );
          const id = result && result.insertId ? result.insertId : null;
          createdMembers.push({ mem_id: id, ...m });
        }
      }
      console.log(`Created ${createdMembers.length} members.`);

      // 3) Create admin and test members first
      console.log('Creating admin and test members...');
      const adminPasswordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
      const testUser1PasswordHash = await bcrypt.hash(TEST_USER1_PASSWORD, 12);
      const testUser2PasswordHash = await bcrypt.hash(TEST_USER2_PASSWORD, 12);
      const defaultPasswordHash = await bcrypt.hash(PASSWORD, 12);

      // Create admin member
      const timestamp = Date.now();
      const adminMemberData = {
        mem_uuid: uuidv4(),
        union_id: createdUnions[0].union_id || createdUnions[0].id,
        member_code: `ADMIN-${timestamp}-001`,
        first_name: 'Admin',
        father_name: 'Admin',
        surname: 'User',
        sex: 'M',
        birthdate: faker.date.between({ from: '1980-01-01', to: '1990-12-31' }),
        education: 'Bachelors',
        phone: ADMIN_PHONE,
        email: ADMIN_EMAIL,
        salary: 50000.00,
        registry_date: new Date(),
        is_active: 1,
        created_at: new Date(),
        updated_at: new Date(),
      };

      // Create test user 1 member
      const testUser1Data = {
        mem_uuid: uuidv4(),
        union_id: createdUnions[0].union_id || createdUnions[0].id,
        member_code: `TEST-${timestamp}-001`,
        first_name: 'Test',
        father_name: 'User',
        surname: 'One',
        sex: 'M',
        birthdate: faker.date.between({ from: '1985-01-01', to: '1995-12-31' }),
        education: 'Diploma',
        phone: '0911111111',
        email: TEST_USER1_EMAIL,
        salary: 25000.00,
        registry_date: new Date(),
        is_active: 1,
        created_at: new Date(),
        updated_at: new Date(),
      };

      // Create test user 2 member
      const testUser2Data = {
        mem_uuid: uuidv4(),
        union_id: createdUnions[1] ? (createdUnions[1].union_id || createdUnions[1].id) : (createdUnions[0].union_id || createdUnions[0].id),
        member_code: `TEST-${timestamp}-002`,
        first_name: 'Test',
        father_name: 'User',
        surname: 'Two',
        sex: 'F',
        birthdate: faker.date.between({ from: '1988-01-01', to: '1998-12-31' }),
        education: 'Secondary',
        phone: '0922222222',
        email: TEST_USER2_EMAIL,
        salary: 20000.00,
        registry_date: new Date(),
        is_active: 1,
        created_at: new Date(),
        updated_at: new Date(),
      };

      // Insert admin and test members
      let adminMember, testUser1Member, testUser2Member;
      if (Member && Member.bulkCreate) {
        const specialMembers = await Member.bulkCreate([adminMemberData, testUser1Data, testUser2Data], { transaction: t, returning: true });
        adminMember = specialMembers[0];
        testUser1Member = specialMembers[1];
        testUser2Member = specialMembers[2];
      } else {
        // Fallback raw inserts
        const [adminResult] = await sequelize.query(
          `INSERT INTO members (mem_uuid, union_id, member_code, first_name, father_name, surname, sex, birthdate, education, phone, email, salary, registry_date, is_active, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
          { replacements: [adminMemberData.mem_uuid, adminMemberData.union_id, adminMemberData.member_code, adminMemberData.first_name, adminMemberData.father_name, adminMemberData.surname, adminMemberData.sex, adminMemberData.birthdate, adminMemberData.education, adminMemberData.phone, adminMemberData.email, adminMemberData.salary, adminMemberData.registry_date, adminMemberData.is_active, adminMemberData.created_at, adminMemberData.updated_at], transaction: t }
        );
        adminMember = { mem_id: adminResult.insertId };

        const [test1Result] = await sequelize.query(
          `INSERT INTO members (mem_uuid, union_id, member_code, first_name, father_name, surname, sex, birthdate, education, phone, email, salary, registry_date, is_active, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
          { replacements: [testUser1Data.mem_uuid, testUser1Data.union_id, testUser1Data.member_code, testUser1Data.first_name, testUser1Data.father_name, testUser1Data.surname, testUser1Data.sex, testUser1Data.birthdate, testUser1Data.education, testUser1Data.phone, testUser1Data.email, testUser1Data.salary, testUser1Data.registry_date, testUser1Data.is_active, testUser1Data.created_at, testUser1Data.updated_at], transaction: t }
        );
        testUser1Member = { mem_id: test1Result.insertId };

        const [test2Result] = await sequelize.query(
          `INSERT INTO members (mem_uuid, union_id, member_code, first_name, father_name, surname, sex, birthdate, education, phone, email, salary, registry_date, is_active, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
          { replacements: [testUser2Data.mem_uuid, testUser2Data.union_id, testUser2Data.member_code, testUser2Data.first_name, testUser2Data.father_name, testUser2Data.surname, testUser2Data.sex, testUser2Data.birthdate, testUser2Data.education, testUser2Data.phone, testUser2Data.email, testUser2Data.salary, testUser2Data.registry_date, testUser2Data.is_active, testUser2Data.created_at, testUser2Data.updated_at], transaction: t }
        );
        testUser2Member = { mem_id: test2Result.insertId };
      }

      console.log(`Created admin member (ID: ${adminMember.mem_id}) and test members (IDs: ${testUser1Member.mem_id}, ${testUser2Member.mem_id})`);

      // 4) Create login accounts for admin, test users, and a subset of other members
      console.log('Creating login accounts for admin, test users, and subset of members...');
      const loginsToInsert = [];

      // Admin login
      loginsToInsert.push({
        mem_id: adminMember.mem_id,
        username: ADMIN_USERNAME,
        password_hash: adminPasswordHash,
        must_change_password: 1,
        role: 'admin',
        created_at: new Date(),
      });

      // Test user 1 login
      loginsToInsert.push({
        mem_id: testUser1Member.mem_id,
        username: TEST_USER1_USERNAME,
        password_hash: testUser1PasswordHash,
        must_change_password: 0,
        role: 'member',
        created_at: new Date(),
      });

      // Test user 2 login
      loginsToInsert.push({
        mem_id: testUser2Member.mem_id,
        username: TEST_USER2_USERNAME,
        password_hash: testUser2PasswordHash,
        must_change_password: 0,
        role: 'member',
        created_at: new Date(),
      });

      // Additional random member logins
      const additionalLoginCount = Math.floor(createdMembers.length * LOGIN_ACCOUNT_PCT);
      for (let i = 0; i < additionalLoginCount; i++) {
        const m = createdMembers[Math.floor(Math.random() * createdMembers.length)];
        if (!m || m.email === ADMIN_EMAIL || m.email === TEST_USER1_EMAIL || m.email === TEST_USER2_EMAIL) continue;
        const uname = `${(m.first_name || 'user').toString().toLowerCase()}.${(m.surname || 'x').toString().toLowerCase()}.${m.mem_id || i}`;
        loginsToInsert.push({
          mem_id: m.mem_id || m.id,
          username: uname.slice(0, 100),
          password_hash: defaultPasswordHash,
          must_change_password: 0,
          role: 'member',
          created_at: new Date(),
        });
      }

      if (LoginAccount && LoginAccount.bulkCreate) {
        await LoginAccount.bulkCreate(loginsToInsert, { transaction: t, ignoreDuplicates: true });
      } else {
        for (const l of loginsToInsert) {
          try {
            await sequelize.query(
              `INSERT IGNORE INTO login_accounts (mem_id, username, password_hash, must_change_password, role, created_at) VALUES (?,?,?,?,?,?)`,
              { replacements: [l.mem_id, l.username, l.password_hash, l.must_change_password, l.role, l.created_at], transaction: t }
            );
          } catch (e) { /* ignore */ }
        }
      }
      console.log(`Created ${loginsToInsert.length} login accounts (including admin and test users).`);

      // 5) Union executives
      console.log('Creating union executives...');
      const executives = [];
      for (const u of createdUnions) {
        const unionId = u.union_id || u.id;
        const execCount = Math.max(1, Math.floor(MEMBERS_PER_UNION * CREATE_EXECUTIVES_PCT));
        for (let k = 0; k < execCount; k++) {
          const member = createdMembers.find(m => (m.union_id == unionId));
          executives.push({
            union_id: unionId,
            mem_id: member ? (member.mem_id || member.id) : null,
            position: faker.helpers.arrayElement(['Chairperson', 'Secretary', 'Treasurer', 'Member']),
            appointed_date: faker.date.past({ years: 3 }),
            term_start_date: faker.date.past({ years: 3 }),
            term_end_date: faker.date.future({ years: 2 }),
            term_length_years: faker.number.int({ min: 1, max: 5 }),
            is_current: faker.datatype.boolean() ? 1 : 0,
            created_at: new Date(),
          });
        }
      }
      if (UnionExecutive && UnionExecutive.bulkCreate) {
        await UnionExecutive.bulkCreate(executives, { transaction: t, ignoreDuplicates: true });
      } else {
        for (const e of executives) {
          await sequelize.query(
            `INSERT INTO union_executives (union_id, mem_id, position, appointed_date, term_start_date, term_end_date, term_length_years, is_current, created_at) VALUES (?,?,?,?,?,?,?,?,?)`,
            { replacements: [e.union_id, e.mem_id, e.position, e.appointed_date, e.term_start_date, e.term_end_date, e.term_length_years, e.is_current, e.created_at], transaction: t }
          );
        }
      }
      console.log(`Created ${executives.length} executives.`);

      // 6) Create CBAs
      console.log('Creating CBAs...');
      const cbas = [];
      for (const u of createdUnions) {
        const unionId = u.union_id || u.id;
        for (let k = 0; k < CBAS_PER_UNION; k++) {
          const duration = faker.number.int({ min: 1, max: 5 });
          const regDate = faker.date.past({ years: 5 });
          const nextEnd = new Date(regDate);
          nextEnd.setFullYear(nextEnd.getFullYear() + duration);
          cbas.push({
            union_id: unionId,
            duration_years: duration,
            status: faker.helpers.arrayElement(['active', 'expired', 'renewed']),
            registration_date: regDate,
            next_end_date: nextEnd,
            renewed_date: faker.datatype.boolean() ? faker.date.between({ from: regDate, to: nextEnd }) : null,
            round: `${faker.number.int({ min: 1, max: 5 })}`,
            notes: faker.lorem.sentence(),
            created_at: new Date(),
          });
        }
      }
      if (CBA && CBA.bulkCreate) {
        await CBA.bulkCreate(cbas, { transaction: t });
      } else {
        for (const c of cbas) {
          await sequelize.query(
            `INSERT INTO cbas (union_id,duration_years,status,registration_date,next_end_date,renewed_date,round,notes,created_at) VALUES (?,?,?,?,?,?,?,?,?)`,
            { replacements: [c.union_id, c.duration_years, c.status, c.registration_date, c.next_end_date, c.renewed_date, c.round, c.notes, c.created_at], transaction: t }
          );
        }
      }
      console.log(`Created ${cbas.length} CBAs.`);

      // ------------------------------
      // Ensure organization_leaders table exists BEFORE inserting
      // ------------------------------
      const orgLeadersDDL = `
CREATE TABLE IF NOT EXISTS \`organization_leaders\` (
  \`id\` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  \`union_id\` INT,
  \`title\` VARCHAR(50),
  \`first_name\` VARCHAR(200),
  \`father_name\` VARCHAR(200),
  \`surname\` VARCHAR(200),
  \`position\` VARCHAR(100),
  \`phone\` VARCHAR(50),
  \`email\` VARCHAR(255),
  \`sector\` VARCHAR(50),
  \`organization\` TEXT,
  \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (\`union_id\`) REFERENCES \`unions\`(\`union_id\`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
`.trim();

      // Try to create the table if it doesn't exist (DDL executed outside transaction)
      const ensured = await ensureTableExists('organization_leaders', orgLeadersDDL);
      if (!ensured) {
        throw new Error('organization_leaders table missing and creation failed. Aborting seed.');
      }

      // 7) Organization leaders
      console.log('Creating organization leaders...');
      const leaders = [];
      for (const u of createdUnions) {
        leaders.push({
          union_id: u.union_id || u.id,
          title: faker.person.prefix(),
          first_name: faker.person.firstName(),
          father_name: faker.person.firstName(),
          surname: faker.person.lastName(),
          position: faker.helpers.arrayElement(['CEO', 'Director', 'Manager']),
          phone: `09${faker.string.numeric(8)}`,
          email: faker.internet.email(),
          sector: faker.helpers.arrayElement(['Transport','Public','Education','Healthcare']),
          organization: faker.company.name(),
          created_at: new Date(),
        });
      }
      if (OrganizationLeader && OrganizationLeader.bulkCreate) {
        await OrganizationLeader.bulkCreate(leaders, { transaction: t });
      } else {
        for (const o of leaders) {
          await sequelize.query(
            `INSERT INTO organization_leaders (union_id,title,first_name,father_name,surname,position,phone,email,sector,organization,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
            { replacements: [o.union_id, o.title, o.first_name, o.father_name, o.surname, o.position, o.phone, o.email, o.sector, o.organization, o.created_at], transaction: t }
          );
        }
      }
      console.log(`Created ${leaders.length} organization leaders.`);

      // 8) Terminated unions (some)
      console.log('Creating some terminated unions...');
      const terminatedCount = Math.max(1, Math.floor(UNIONS_COUNT * 0.1));
      const terminated = [];
      for (let i = 0; i < terminatedCount; i++) {
        const u = createdUnions[i];
        terminated.push({
          union_id: u.union_id || u.id,
          name_en: faker.company.name(),
          name_am: `ለቅድሚያ ${faker.company.name().split(' ')[0]}`,
          sector: faker.helpers.arrayElement(['Transport', 'Public']),
          organization: faker.company.name(),
          established_date: faker.date.past({ years: 15 }),
          terms_of_election: faker.number.int({ min: 1, max: 6 }),
          general_assembly_date: faker.date.past({ years: 5 }),
          strategic_plan_in_place: faker.datatype.boolean() ? 1 : 0,
          external_audit_date: faker.date.past({ years: 4 }),
          terminated_date: faker.date.recent({ days: 1000 }),
          termination_reason: faker.lorem.sentence(),
          archived_at: new Date(),
        });
      }
      if (TerminatedUnion && TerminatedUnion.bulkCreate) {
        await TerminatedUnion.bulkCreate(terminated, { transaction: t });
      } else {
        for (const tu of terminated) {
          await sequelize.query(
            `INSERT INTO terminated_unions (union_id,name_en,name_am,sector,organization,established_date,terms_of_election,general_assembly_date,strategic_plan_in_place,external_audit_date,terminated_date,termination_reason,archived_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
            { replacements: [tu.union_id, tu.name_en, tu.name_am, tu.sector, tu.organization, tu.established_date, tu.terms_of_election, tu.general_assembly_date, tu.strategic_plan_in_place, tu.external_audit_date, tu.terminated_date, tu.termination_reason, tu.archived_at], transaction: t }
          );
        }
      }
      console.log(`Created ${terminated.length} terminated unions.`);

      // 9) Archives (random members)
      console.log('Archiving some members...');
      const archiveCount = Math.max(1, Math.floor(createdMembers.length * 0.05));
      const archives = [];
      for (let i = 0; i < archiveCount; i++) {
        const m = createdMembers[Math.floor(Math.random() * createdMembers.length)];
        archives.push({
          mem_id: m.mem_id || m.id,
          union_id: m.union_id,
          member_code: m.member_code,
          first_name: m.first_name,
          father_name: m.father_name,
          surname: m.surname,
          sex: m.sex,
          birthdate: m.birthdate,
          education: m.education,
          phone: m.phone,
          email: m.email,
          salary: m.salary,
          registry_date: m.registry_date,
          resigned_date: faker.date.recent({ days: 1000 }),
          reason: faker.lorem.sentence(),
          archived_at: new Date(),
        });
      }
      if (Archive && Archive.bulkCreate) {
        await Archive.bulkCreate(archives, { transaction: t });
      } else {
        for (const a of archives) {
          await sequelize.query(
            `INSERT INTO archives (mem_id,union_id,member_code,first_name,father_name,surname,sex,birthdate,education,phone,email,salary,registry_date,resigned_date,reason,archived_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
            { replacements: [a.mem_id, a.union_id, a.member_code, a.first_name, a.father_name, a.surname, a.sex, a.birthdate, a.education, a.phone, a.email, a.salary, a.registry_date, a.resigned_date, a.reason, a.archived_at], transaction: t }
          );
        }
      }
      console.log(`Created ${archives.length} archived records.`);

      // 10) Visitors counters for last 30 days
      console.log('Seeding visitor counters...');
      const visitors = [];
      for (let d = 30; d >= 0; d--) {
        const date = new Date();
        date.setDate(date.getDate() - d);
        visitors.push({
          visit_date: date,
          count: faker.number.int({ min: 0, max: 150 }),
        });
      }
      if (Visitor && Visitor.bulkCreate) {
        await Visitor.bulkCreate(visitors, { transaction: t, ignoreDuplicates: true });
      } else {
        for (const v of visitors) {
          await sequelize.query(
            `INSERT INTO visitors (visit_date, count) VALUES (?,?)`,
            { replacements: [v.visit_date, v.count], transaction: t }
          );
        }
      }

      // 11) Contacts
      console.log('Creating sample contacts/messages...');
      const contacts = [];
      for (let i = 0; i < 40; i++) {
        contacts.push({
          name: faker.person.fullName(),
          email_or_phone: faker.internet.email(),
          subject: faker.lorem.words(6),
          message: faker.lorem.sentences(2),
          created_at: new Date(),
        });
      }
      if (Contact && Contact.bulkCreate) {
        await Contact.bulkCreate(contacts, { transaction: t });
      } else {
        for (const c of contacts) {
          await sequelize.query(
            `INSERT INTO contacts (name,email_or_phone,subject,message,created_at) VALUES (?,?,?,?,?)`,
            { replacements: [c.name, c.email_or_phone, c.subject, c.message, c.created_at], transaction: t }
          );
        }
      }

      // 12) News
      console.log('Creating sample news/announcements...');
      const newsArr = [];
      for (let i = 0; i < 25; i++) {
        const pub = faker.date.recent({ days: 400 });
        newsArr.push({
          title: faker.lorem.sentence(6),
          body: faker.lorem.paragraphs(2),
          summary: faker.lorem.sentences(2),
          published_at: pub,
          is_published: faker.datatype.boolean() ? 1 : 0,
          created_at: new Date(),
        });
      }
      if (News && News.bulkCreate) {
        await News.bulkCreate(newsArr, { transaction: t });
      } else {
        for (const n of newsArr) {
          await sequelize.query(
            `INSERT INTO news (title,body,summary,published_at,is_published,created_at) VALUES (?,?,?,?,?,?)`,
            { replacements: [n.title, n.body, n.summary, n.published_at, n.is_published, n.created_at], transaction: t }
          );
        }
      }

      // 13) Galleries & photos
      console.log('Seeding galleries and photos...');
      const galleries = [];
      for (let i = 0; i < GALLERIES_COUNT; i++) {
        galleries.push({
          title: `${faker.lorem.word()} Gallery ${i + 1}`,
          description: faker.lorem.sentences(2),
          created_at: new Date(),
        });
      }

      let createdGalleries = [];
      if (Gallery && Gallery.bulkCreate) {
        createdGalleries = await Gallery.bulkCreate(galleries, { transaction: t, returning: true });
      } else {
        createdGalleries = [];
        for (const g of galleries) {
          const [res] = await sequelize.query(
            `INSERT INTO galleries (title,description,created_at) VALUES (?,?,?)`,
            { replacements: [g.title, g.description, g.created_at], transaction: t }
          );
          createdGalleries.push({ id: res.insertId });
        }
      }

      // photos
      const photos = [];
      for (const g of createdGalleries) {
        const gid = g.id || g.gallery_id;
        for (let p = 0; p < PHOTOS_PER_GALLERY; p++) {
          photos.push({
            gallery_id: gid,
            filename: `${faker.system.fileName()}.jpg`,
            caption: faker.lorem.sentence(),
            taken_at: faker.date.past({ years: 3 }),
            created_at: new Date(),
          });
        }
      }
      if (Photo && Photo.bulkCreate) {
        await Photo.bulkCreate(photos, { transaction: t });
      } else {
        for (const ph of photos) {
          await sequelize.query(
            `INSERT INTO photos (gallery_id,filename,caption,taken_at,created_at) VALUES (?,?,?,?,?)`,
            { replacements: [ph.gallery_id, ph.filename, ph.caption, ph.taken_at, ph.created_at], transaction: t }
          );
        }
      }
      console.log(`Created ${createdGalleries.length} galleries and ${photos.length} photos.`);

      // 14) Reports cache (small)
      console.log('Creating reports cache items...');
      
      // Ensure reports_cache table exists
      const reportsCacheDDL = `
CREATE TABLE IF NOT EXISTS \`reports_cache\` (
  \`id\` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  \`report_name\` VARCHAR(255),
  \`payload\` JSON,
  \`generated_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
`.trim();

      const reportsCacheEnsured = await ensureTableExists('reports_cache', reportsCacheDDL);
      if (!reportsCacheEnsured) {
        console.warn('reports_cache table creation failed, skipping reports cache seeding...');
      } else {
        const reports = [
          { report_name: 'members_summary', payload: JSON.stringify({ total_unions: createdUnions.length, total_members: createdMembers.length }), generated_at: new Date() },
          { report_name: 'recent_visitors', payload: JSON.stringify(visitors.slice(-7)), generated_at: new Date() },
        ];
        if (ReportsCache && ReportsCache.bulkCreate) {
          await ReportsCache.bulkCreate(reports, { transaction: t });
        } else {
          for (const r of reports) {
            await sequelize.query(`INSERT INTO reports_cache (report_name,payload,generated_at) VALUES (?,?,?)`, { replacements: [r.report_name, r.payload, r.generated_at], transaction: t });
          }
        }
        console.log(`Created ${reports.length} report cache entries.`);
      }

      await t.commit();
      console.log('Transaction committed — seeding complete.');
      
      // Display created credentials
      console.log('\n=== CREATED ACCOUNTS ===');
      console.log('Admin Account:');
      console.log(`  Username: ${ADMIN_USERNAME}`);
      console.log(`  Password: ${ADMIN_PASSWORD}`);
      console.log(`  Email: ${ADMIN_EMAIL}`);
      console.log(`  Role: admin`);
      
      console.log('\nTest User 1:');
      console.log(`  Username: ${TEST_USER1_USERNAME}`);
      console.log(`  Password: ${TEST_USER1_PASSWORD}`);
      console.log(`  Email: ${TEST_USER1_EMAIL}`);
      console.log(`  Role: member`);
      
      console.log('\nTest User 2:');
      console.log(`  Username: ${TEST_USER2_USERNAME}`);
      console.log(`  Password: ${TEST_USER2_PASSWORD}`);
      console.log(`  Email: ${TEST_USER2_EMAIL}`);
      console.log(`  Role: member`);
      
      console.log('\n=== SUMMARY ===');
      console.log(`Created ${createdUnions.length} unions`);
      console.log(`Created ${createdMembers.length + 3} total members (including admin and test users)`);
      console.log(`Created ${loginsToInsert.length} login accounts`);
      console.log(`Created ${executives.length} union executives`);
      console.log(`Created ${cbas.length} CBAs`);
      console.log(`Created ${leaders.length} organization leaders`);
      console.log(`Created ${terminated.length} terminated unions`);
      console.log(`Created ${archives.length} archived records`);
      console.log(`Created ${visitors.length} visitor records`);
      console.log(`Created ${contacts.length} contact messages`);
      console.log(`Created ${newsArr.length} news articles`);
      console.log(`Created ${createdGalleries.length} galleries with ${photos.length} photos`);
      console.log(`Created ${reportsCacheEnsured ? '2' : '0'} report cache entries`);
      
      console.log('\nDone! You can now test login with the credentials above.');
      console.log('Tip: adjust counts with env vars and re-run if you need more data.');
      process.exit(0);
    } catch (err) {
      await t.rollback();
      console.error('Seed transaction rolled back due to error:', err);
      process.exit(1);
    }
  } catch (err) {
    console.error('Failed to seed DB:', err);
    process.exit(1);
  }
}

main();
