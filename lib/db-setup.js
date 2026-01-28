import pool from './db';

async function addColumnIfNotExists(connection, table, columnDef) {
  try {
    await connection.query(`ALTER TABLE \`${table}\` ADD COLUMN ${columnDef}`);
    console.log(`Added column to ${table}: ${columnDef.split(' ')[0]}`);
  } catch (error) {
    // Ignore duplicate column error (Code 1060: Duplicate column name)
    if (error.code !== 'ER_DUP_FIELDNAME' && error.errno !== 1060) {
      console.warn(`Warning adding column to ${table}: ${error.message}`);
    }
  }
}

export async function setupDatabase() {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Contact Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`hw-contact\` (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        subject VARCHAR(255),
        message TEXT NOT NULL,
        client_metadata JSON,
        is_resolved BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Visitors Table (Anonymous)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`hw-visitors\` (
        visitor_id VARCHAR(64) PRIMARY KEY,
        first_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        user_agent TEXT
      )
    `);

    // Analytics Events Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`hw-analytics\` (
        id INT AUTO_INCREMENT PRIMARY KEY,
        visitor_id VARCHAR(64) NOT NULL,
        event_name VARCHAR(100) NOT NULL,
        page_url VARCHAR(255),
        referrer VARCHAR(255),
        details JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_visitor (visitor_id),
        INDEX idx_event (event_name),
        INDEX idx_created_at (created_at)
      )
    `);

    // Logs Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`hw-logs\` (
        id INT AUTO_INCREMENT PRIMARY KEY,
        level VARCHAR(20) NOT NULL, -- INFO, WARN, ERROR, AUTH
        message TEXT NOT NULL,
        details JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // FAQ Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`hw-faq\` (
        id INT AUTO_INCREMENT PRIMARY KEY,
        question TEXT NOT NULL,
        answer TEXT NOT NULL,
        display_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Teams Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`hw-teams\` (
        id INT AUTO_INCREMENT PRIMARY KEY,
        team_name VARCHAR(255) UNIQUE,
        access_key VARCHAR(64) UNIQUE NOT NULL,
        lead_name VARCHAR(255),
        lead_email VARCHAR(255),
        lead_phone VARCHAR(50),
        lead_college VARCHAR(255),
        lead_branch VARCHAR(100),
        lead_year VARCHAR(20),
        logo_url VARCHAR(500),
        round1_submission_url VARCHAR(500),
        round1_marks INT,
        round1_feedback TEXT,
        payment_status ENUM('PENDING', 'PAID') DEFAULT 'PENDING',
        payment_screenshot_url VARCHAR(500),
        transaction_id VARCHAR(100),
        password_hash VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Team Members Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`hw-team-members\` (
        id INT AUTO_INCREMENT PRIMARY KEY,
        team_id INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(50),
        college VARCHAR(255),
        branch VARCHAR(100),
        year VARCHAR(20),
        role ENUM('LEAD', 'MEMBER') DEFAULT 'MEMBER',
        details JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (team_id) REFERENCES \`hw-teams\`(id) ON DELETE CASCADE
      )
    `);

    // Announcements Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`hw-announcements\` (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        target_team_id INT, -- NULL for all
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (target_team_id) REFERENCES \`hw-teams\`(id) ON DELETE SET NULL
      )
    `);

    // Chat Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`hw-chat\` (
        id INT AUTO_INCREMENT PRIMARY KEY,
        team_id INT NOT NULL,
        sender_name VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR(20) DEFAULT 'text',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (team_id) REFERENCES \`hw-teams\`(id) ON DELETE CASCADE
      )
    `);

    // Settings Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`hw-settings\` (
        setting_key VARCHAR(50) PRIMARY KEY,
        setting_value TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Project Submissions Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`hw-project-submissions\` (
        id INT AUTO_INCREMENT PRIMARY KEY,
        team_id INT NOT NULL UNIQUE,
        description TEXT,
        github_link VARCHAR(500),
        live_link VARCHAR(500),
        ppt_url VARCHAR(500),
        source_code_url VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (team_id) REFERENCES \`hw-teams\`(id) ON DELETE CASCADE
      )
    `);

    // Certificates Table (for certificate authenticity verification)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`hw-certificates\` (
        id INT AUTO_INCREMENT PRIMARY KEY,
        code VARCHAR(64) NOT NULL UNIQUE,
        recipient_name VARCHAR(255) NOT NULL,
        team_name VARCHAR(255) NULL,
        details TEXT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // ============================================
    // CAMPUS AMBASSADOR SYSTEM TABLES
    // ============================================

    // Campus Ambassador Applications Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`hw-ca-applications\` (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        phone VARCHAR(50) NOT NULL UNIQUE,
        college VARCHAR(255) NOT NULL,
        college_abbreviation VARCHAR(20),
        branch VARCHAR(100),
        year VARCHAR(20),
        why_interested TEXT NOT NULL,
        previous_experience TEXT,
        social_media_links JSON,
        status ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING',
        ca_code VARCHAR(50) UNIQUE,
        referral_link VARCHAR(500),
        performance_score INT DEFAULT 0,
        verified_registrations INT DEFAULT 0,
        approved_tasks INT DEFAULT 0,
        is_organising_team_candidate BOOLEAN DEFAULT FALSE,
        admin_notes TEXT,
        password_hash VARCHAR(255),
        approved_at TIMESTAMP NULL,
        approved_by VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_status (status),
        INDEX idx_ca_code (ca_code),
        INDEX idx_email (email),
        INDEX idx_phone (phone),
        INDEX idx_performance (performance_score DESC)
      )
    `);

    // CA Click Tracking Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`hw-ca-clicks\` (
        id INT AUTO_INCREMENT PRIMARY KEY,
        ca_id INT NOT NULL,
        ca_code VARCHAR(50) NOT NULL,
        ip_address VARCHAR(45),
        user_agent TEXT,
        referrer VARCHAR(500),
        clicked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (ca_id) REFERENCES \`hw-ca-applications\`(id) ON DELETE CASCADE,
        INDEX idx_ca_id (ca_id),
        INDEX idx_ca_code (ca_code),
        INDEX idx_clicked_at (clicked_at)
      )
    `);

    // Participant Registrations Table (Direct registrations through CA referral)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`hw-participant-registrations\` (
        id INT AUTO_INCREMENT PRIMARY KEY,
        ca_id INT,
        ca_code VARCHAR(50),
        team_name VARCHAR(255),
        registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_verified BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (ca_id) REFERENCES \`hw-ca-applications\`(id) ON DELETE SET NULL,
        INDEX idx_ca_id (ca_id),
        INDEX idx_ca_code (ca_code),
        INDEX idx_team_name (team_name)
      )
    `);

    // Participant Team Members Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`hw-participant-members\` (
        id INT AUTO_INCREMENT PRIMARY KEY,
        registration_id INT NOT NULL,
        first_name VARCHAR(255) NOT NULL,
        last_name VARCHAR(255),
        email VARCHAR(255) NOT NULL,
        mobile VARCHAR(50) NOT NULL,
        gender VARCHAR(20),
        location VARCHAR(255),
        institute_name VARCHAR(255) NOT NULL,
        user_type VARCHAR(50),
        domain VARCHAR(100),
        course VARCHAR(100),
        course_specialization VARCHAR(255),
        graduating_year VARCHAR(20),
        course_duration VARCHAR(50),
        is_team_lead BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (registration_id) REFERENCES \`hw-participant-registrations\`(id) ON DELETE CASCADE,
        INDEX idx_registration_id (registration_id),
        INDEX idx_email (email),
        INDEX idx_mobile (mobile)
      )
    `);

    // CA Registrations Table (Validated from Unstop export - kept for backward compatibility)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`hw-ca-registrations\` (
        id INT AUTO_INCREMENT PRIMARY KEY,
        ca_id INT NOT NULL,
        ca_code VARCHAR(50) NOT NULL,
        participant_name VARCHAR(255) NOT NULL,
        participant_email VARCHAR(255) NOT NULL,
        participant_phone VARCHAR(50),
        team_name VARCHAR(255),
        unstop_registration_id VARCHAR(255),
        registration_date TIMESTAMP,
        is_verified BOOLEAN DEFAULT FALSE,
        is_self_registration BOOLEAN DEFAULT FALSE,
        verification_notes TEXT,
        verified_at TIMESTAMP NULL,
        verified_by VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (ca_id) REFERENCES \`hw-ca-applications\`(id) ON DELETE CASCADE,
        INDEX idx_ca_id (ca_id),
        INDEX idx_ca_code (ca_code),
        INDEX idx_participant_email (participant_email),
        INDEX idx_is_verified (is_verified),
        INDEX idx_unstop_id (unstop_registration_id),
        UNIQUE KEY unique_unstop_registration (unstop_registration_id)
      )
    `);

    // CA Tasks Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`hw-ca-tasks\` (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        task_type ENUM('TEXT', 'FILE', 'SCREENSHOT', 'MIXED') NOT NULL,
        deadline TIMESTAMP NOT NULL,
        points_on_completion INT DEFAULT 5,
        bonus_points_early INT DEFAULT 2,
        early_submission_hours INT DEFAULT 24,
        is_active BOOLEAN DEFAULT TRUE,
        created_by VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_deadline (deadline),
        INDEX idx_is_active (is_active)
      )
    `);

    // CA Task Assignments Table (Many-to-Many: Tasks to CAs)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`hw-ca-task-assignments\` (
        id INT AUTO_INCREMENT PRIMARY KEY,
        task_id INT NOT NULL,
        ca_id INT NOT NULL,
        assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (task_id) REFERENCES \`hw-ca-tasks\`(id) ON DELETE CASCADE,
        FOREIGN KEY (ca_id) REFERENCES \`hw-ca-applications\`(id) ON DELETE CASCADE,
        UNIQUE KEY unique_task_ca (task_id, ca_id),
        INDEX idx_ca_id (ca_id),
        INDEX idx_task_id (task_id)
      )
    `);

    // CA Task Submissions Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`hw-ca-task-submissions\` (
        id INT AUTO_INCREMENT PRIMARY KEY,
        task_id INT NOT NULL,
        ca_id INT NOT NULL,
        submission_text TEXT,
        file_url VARCHAR(500),
        screenshot_url VARCHAR(500),
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_early_submission BOOLEAN DEFAULT FALSE,
        status ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING',
        points_awarded INT DEFAULT 0,
        admin_feedback TEXT,
        reviewed_at TIMESTAMP NULL,
        reviewed_by VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (task_id) REFERENCES \`hw-ca-tasks\`(id) ON DELETE CASCADE,
        FOREIGN KEY (ca_id) REFERENCES \`hw-ca-applications\`(id) ON DELETE CASCADE,
        UNIQUE KEY unique_task_ca_submission (task_id, ca_id),
        INDEX idx_ca_id (ca_id),
        INDEX idx_task_id (task_id),
        INDEX idx_status (status)
      )
    `);

    // Apply Migrations for existing tables
    // hw-teams
    await addColumnIfNotExists(connection, 'hw-teams', 'transaction_id VARCHAR(100)');
    await addColumnIfNotExists(connection, 'hw-teams', 'lead_college VARCHAR(255)');
    await addColumnIfNotExists(connection, 'hw-teams', 'lead_branch VARCHAR(100)');
    await addColumnIfNotExists(connection, 'hw-teams', 'lead_year VARCHAR(20)');
    await addColumnIfNotExists(connection, 'hw-teams', 'password_hash VARCHAR(255)');

    // hw-ca-applications
    await addColumnIfNotExists(connection, 'hw-ca-applications', 'password_hash VARCHAR(255)');

    // hw-team-members
    await addColumnIfNotExists(connection, 'hw-team-members', 'phone VARCHAR(50)');
    await addColumnIfNotExists(connection, 'hw-team-members', 'college VARCHAR(255)');
    await addColumnIfNotExists(connection, 'hw-team-members', 'branch VARCHAR(100)');
    await addColumnIfNotExists(connection, 'hw-team-members', 'year VARCHAR(20)');

    await connection.commit();
    console.log('Database tables setup successfully');
  } catch (error) {
    await connection.rollback();
    console.error('Error setting up database:', error);
    throw error;
  } finally {
    connection.release();
  }
}
