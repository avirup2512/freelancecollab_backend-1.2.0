const createQuery = {

  /* --------------------------------------------------------
      1) USERS / ROLES / TYPES / PRIORITY
  ---------------------------------------------------------*/
  createUsersTable: `
    CREATE TABLE IF NOT EXISTS users (
      id INT PRIMARY KEY AUTO_INCREMENT,
      first_name VARCHAR(255),
      last_name VARCHAR(255),
      email VARCHAR(255),
      password VARCHAR(255),
      address VARCHAR(255),
      start_date DATE,
      end_date DATE,
      working BOOLEAN DEFAULT FALSE,
      social_auth BOOLEAN DEFAULT FALSE,
      unique_identifier VARCHAR(255)
    );
  `,

  createRoleTable: `
    CREATE TABLE IF NOT EXISTS roles (
      id INT PRIMARY KEY AUTO_INCREMENT,
      role VARCHAR(255)
    );
  `,

  createUserTypeTable: `
    CREATE TABLE IF NOT EXISTS user_type (
      id INT PRIMARY KEY AUTO_INCREMENT,
      type VARCHAR(255)
    );
  `,

  createPriority: `
    CREATE TABLE IF NOT EXISTS priority (
      id INT PRIMARY KEY AUTO_INCREMENT,
      priority VARCHAR(255)
    );
  `,

  createUserRoleTable: `
    CREATE TABLE IF NOT EXISTS user_role (
      id INT PRIMARY KEY AUTO_INCREMENT,
      roleId INT,
      userId INT,
      FOREIGN KEY (roleId) REFERENCES roles(id),
      FOREIGN KEY (userId) REFERENCES users(id)
    );
  `,

  /* --------------------------------------------------------
      2) PROJECTS
  ---------------------------------------------------------*/
  createProjectTable: `
    CREATE TABLE IF NOT EXISTS projects (
      id INT PRIMARY KEY AUTO_INCREMENT,
      is_archived INT DEFAULT 0,
      is_deleted INT DEFAULT 0,
      name VARCHAR(255),
      description LONGTEXT,
      user_id INT,
      is_public INT DEFAULT 1,
      created_date DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `,

  createProjectUserTable: `
    CREATE TABLE IF NOT EXISTS project_user (
      id INT PRIMARY KEY AUTO_INCREMENT,
      user_id INT,
      project_id INT,
      role_id INT,
      is_default INT,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (role_id) REFERENCES project_roles(id),
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
      UNIQUE (user_id, project_id)
    );
  `,

  createProjectBoardTable: `
    CREATE TABLE IF NOT EXISTS project_board (
      id INT PRIMARY KEY AUTO_INCREMENT,
      project_id INT,
      board_id INT,
      FOREIGN KEY (project_id) REFERENCES projects(id),
      FOREIGN KEY (board_id) REFERENCES boards(id)
    );
  `,
createTeamRole: `
  CREATE TABLE IF NOT EXISTS team_role (
    id INT AUTO_INCREMENT PRIMARY KEY,
    team_id INT NOT NULL,
    role_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
  );
`,
  /* --------------------------------------------------------
      3) PROJECT ROLES
  ---------------------------------------------------------*/
  createProjectRoles: `
    CREATE TABLE IF NOT EXISTS project_roles (
      id INT AUTO_INCREMENT PRIMARY KEY,
      role_name VARCHAR(100) NOT NULL,
      description VARCHAR(255)
    );
  `,

  createProjectTeamRoleMap: `
    CREATE TABLE IF NOT EXISTS project_team_role_map (
      id INT AUTO_INCREMENT PRIMARY KEY,
      team_role_id INT NOT NULL,
      project_role_id INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (team_role_id) REFERENCES team_role(id),
      FOREIGN KEY (project_role_id) REFERENCES project_roles(id)
    );
  `,

  /* --------------------------------------------------------
      4) BOARDS
  ---------------------------------------------------------*/
  createBoardTable: `
    CREATE TABLE IF NOT EXISTS boards (
      id INT PRIMARY KEY AUTO_INCREMENT,
      user_id INT,
      name VARCHAR(255),
      create_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_by INT,
      is_public BOOLEAN DEFAULT FALSE,
      project_id INT,
      is_archived INT DEFAULT 0,
      is_active INT DEFAULT 1,
      is_deleted INT DEFAULT 0,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (project_id) REFERENCES projects(id),
      FOREIGN KEY (created_by) REFERENCES users(id)
    );
  `,

  createBoardRoles: `
    CREATE TABLE IF NOT EXISTS board_roles (
      id INT AUTO_INCREMENT PRIMARY KEY,
      role_name VARCHAR(100) NOT NULL,
      description VARCHAR(255)
    );
  `,

  createBoardUserTable: `
    CREATE TABLE IF NOT EXISTS board_users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      board_id INT NOT NULL,
      user_id INT NOT NULL,
      role_id INT NOT NULL,
      FOREIGN KEY (board_id) REFERENCES boards(id),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (role_id) REFERENCES board_roles(id),
      UNIQUE KEY (board_id, user_id)
    );
  `,

  createBoardLabelTable: `
    CREATE TABLE IF NOT EXISTS board_label (
      id INT PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(255),
      color VARCHAR(255),
      board_id INT,
      FOREIGN KEY (board_id) REFERENCES boards(id)
    );
  `,

  createCoreLabelTable: `
    CREATE TABLE IF NOT EXISTS core_label (
      id INT PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(255),
      color VARCHAR(255)
    );
  `,

  createBoardTagTable: `
    CREATE TABLE IF NOT EXISTS board_tag (
      id INT PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(20),
      board_id INT,
      color VARCHAR(255),
      attach_in_board INT DEFAULT 0,
      create_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (board_id) REFERENCES boards(id),
      UNIQUE (name, board_id, color)
    );
  `,

  createBoardTeamRoleMap: `
    CREATE TABLE IF NOT EXISTS board_team_role_map (
      id INT AUTO_INCREMENT PRIMARY KEY,
      team_role_id INT NOT NULL,
      board_role_id INT NOT NULL,
      FOREIGN KEY(team_role_id) REFERENCES team_role(id),
      FOREIGN KEY(board_role_id) REFERENCES board_roles(id)
    );
  `,

  /* --------------------------------------------------------
      5) LISTS
  ---------------------------------------------------------*/
  createListTable2: `
    CREATE TABLE IF NOT EXISTS list (
      id INT PRIMARY KEY AUTO_INCREMENT,
      board_id INT NOT NULL,
      name VARCHAR(255) NOT NULL,
      position INT DEFAULT 0,
      is_backlog TINYINT(1) DEFAULT 0,
      backlog_activate_at DATETIME DEFAULT NULL,
      is_active TINYINT(1) DEFAULT 1,
      is_archived TINYINT(1) DEFAULT 0,
      is_deleted TINYINT(1) DEFAULT 0,
      is_locked TINYINT(1) DEFAULT 0,
      is_collapsed TINYINT(1) DEFAULT 0,
      wip_limit INT DEFAULT NULL,
      color VARCHAR(50) DEFAULT NULL,
      created_by INT,
      deleted_at DATETIME NULL,
      created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_date DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE
    );
  `,

  createListHistoryTable: `
    CREATE TABLE IF NOT EXISTS list_history (
      id INT PRIMARY KEY AUTO_INCREMENT,
      list_id INT,
      action VARCHAR(100),
      payload LONGTEXT,
      performed_by INT,
      created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (list_id) REFERENCES list(id) ON DELETE CASCADE
    );
  `,

  createListUserStateTable: `
    CREATE TABLE IF NOT EXISTS list_user_state (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      list_id INT NOT NULL,
      is_collapsed BOOLEAN DEFAULT FALSE,
      UNIQUE KEY (user_id, list_id)
    );
  `,

  createListTemplate: `
    CREATE TABLE IF NOT EXISTS list_template (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      name VARCHAR(255) NOT NULL,
      created_at DATETIME DEFAULT NOW()
    );
  `,

  createTemplateCard: `
    CREATE TABLE IF NOT EXISTS template_card (
      id INT AUTO_INCREMENT PRIMARY KEY,
      template_id INT NOT NULL,
      title VARCHAR(255),
      position INT
    );
  `,

  createListGroup: `
    CREATE TABLE IF NOT EXISTS list_group (
      id INT PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(255),
      user_id INT,
      created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `,

  createListGroupList: `
    CREATE TABLE IF NOT EXISTS list_group_list (
      id INT PRIMARY KEY AUTO_INCREMENT,
      list_name VARCHAR(255),
      list_position INT,
      list_color VARCHAR(255),
      is_drag_disabled VARCHAR(255),
      list_group_id INT,
      created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (list_group_id) REFERENCES list_group(id)
    );
  `,

  createListGroupListDefault: `
    CREATE TABLE IF NOT EXISTS list_group_list_default (
      id INT PRIMARY KEY AUTO_INCREMENT,
      list_name VARCHAR(255),
      list_position INT,
      list_color VARCHAR(255),
      is_drag_disabled VARCHAR(255),
      list_group_id VARCHAR(255),
      created_date DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `,

  /* --------------------------------------------------------
      6) CARDS
  ---------------------------------------------------------*/
  createCardsTable: `
    CREATE TABLE IF NOT EXISTS cards (
      id INT PRIMARY KEY AUTO_INCREMENT,
      user_id INT,
      list_id INT,
      name VARCHAR(255),
      description VARCHAR(255),
      create_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      is_active BOOLEAN DEFAULT TRUE,
      is_complete BOOLEAN DEFAULT FALSE,
      due_date DATETIME,
      reminder_date DATETIME,
      progress INT,
      priority_id INT,
      position INT,
      is_deleted INT DEFAULT 0,
      is_drag_disabled INT DEFAULT 0,
      deleted_at DATETIME NULL,
      FOREIGN KEY (list_id) REFERENCES list(id),
      FOREIGN KEY (priority_id) REFERENCES priority(id)
    );
  `,

  createCardUserTable: `
    CREATE TABLE IF NOT EXISTS card_user (
      id INT PRIMARY KEY AUTO_INCREMENT,
      user_id INT,
      card_id INT,
      role_id INT,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (card_id) REFERENCES cards(id),
      FOREIGN KEY (role_id) REFERENCES roles(id),
      UNIQUE (user_id, card_id)
    );
  `,

  createCardLabelTable: `
    CREATE TABLE IF NOT EXISTS card_label (
      id INT PRIMARY KEY AUTO_INCREMENT,
      label_id INT,
      card_id INT,
      FOREIGN KEY (label_id) REFERENCES board_label(id),
      FOREIGN KEY (card_id) REFERENCES cards(id)
    );
  `,

  createCardTagTable: `
    CREATE TABLE IF NOT EXISTS card_tag (
      id INT PRIMARY KEY AUTO_INCREMENT,
      card_id INT,
      color VARCHAR(255),
      board_tag_id INT,
      FOREIGN KEY (card_id) REFERENCES cards(id),
      FOREIGN KEY (board_tag_id) REFERENCES board_tag(id) ON DELETE CASCADE,
      UNIQUE (board_tag_id, card_id)
    );
  `,

  /* --------------------------------------------------------
      7) CHECKLIST
  ---------------------------------------------------------*/
  createCheckListItemTable: `
    CREATE TABLE IF NOT EXISTS checklist_item (
      id INT PRIMARY KEY AUTO_INCREMENT,
      card_id INT,
      name VARCHAR(255),
      is_checked BOOLEAN DEFAULT FALSE,
      position INT,
      is_deleted INT DEFAULT 0,
      FOREIGN KEY (card_id) REFERENCES cards(id)
    );
  `,

  createCheckListUserTable: `
    CREATE TABLE IF NOT EXISTS checklist_user (
      id INT PRIMARY KEY AUTO_INCREMENT,
      user_id INT,
      checklist_id INT,
      role_id INT,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (checklist_id) REFERENCES checklist_item(id),
      FOREIGN KEY (role_id) REFERENCES roles(id),
      UNIQUE (user_id, checklist_id)
    );
  `,

  createChecklistTagTable: `
    CREATE TABLE IF NOT EXISTS checklist_tag (
      id INT PRIMARY KEY AUTO_INCREMENT,
      checklist_id INT,
      board_tag_id INT,
      FOREIGN KEY (checklist_id) REFERENCES checklist_item(id),
      FOREIGN KEY (board_tag_id) REFERENCES board_tag(id) ON DELETE CASCADE,
      UNIQUE (board_tag_id, checklist_id)
    );
  `,

  /* --------------------------------------------------------
      8) COMMENTS & ACTIVITY LOG
  ---------------------------------------------------------*/
  createCommentTable: `
    CREATE TABLE IF NOT EXISTS comment (
      id INT PRIMARY KEY AUTO_INCREMENT,
      card_id INT,
      user_id INT,
      comment LONGTEXT,
      created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (card_id) REFERENCES cards(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `,

  createCardActivityTable: `
    CREATE TABLE IF NOT EXISTS card_activity (
      id INT PRIMARY KEY AUTO_INCREMENT,
      card_id INT,
      user_id INT,
      activity VARCHAR(255),
      created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (card_id) REFERENCES cards(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `,

  createCardActivityAddedUserTable: `
    CREATE TABLE IF NOT EXISTS card_activity_added_user (
      id INT PRIMARY KEY AUTO_INCREMENT,
      card_activity_id INT,
      added_user_id INT,
      type INT,
      created_date DATETIME,
      FOREIGN KEY (card_activity_id) REFERENCES card_activity(id),
      FOREIGN KEY (added_user_id) REFERENCES users(id) ON DELETE SET NULL
    );
  `,

  createCardActivityAddedChecklistTable: `
    CREATE TABLE IF NOT EXISTS card_activity_added_checklist (
      id INT PRIMARY KEY AUTO_INCREMENT,
      card_activity_id INT,
      added_checklist_id INT,
      type INT,
      created_date DATETIME,
      FOREIGN KEY (card_activity_id) REFERENCES card_activity(id),
      FOREIGN KEY (added_checklist_id) REFERENCES checklist_item(id) ON DELETE SET NULL
    );
  `,

  /* --------------------------------------------------------
      9) FILE UPLOADS
  ---------------------------------------------------------*/
  createUploadedFileTable: `
    CREATE TABLE IF NOT EXISTS uploaded_file (
      id INT PRIMARY KEY AUTO_INCREMENT,
      filePath VARCHAR(255),
      memory BIGINT,
      user_id INT,
      card_id INT,
      project_id INT,
      uploaded_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (card_id) REFERENCES cards(id),
      FOREIGN KEY (project_id) REFERENCES projects(id)
    );
  `,

  /* --------------------------------------------------------
      10) TEAMS
  ---------------------------------------------------------*/
  createTeams: `
    CREATE TABLE IF NOT EXISTS teams (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(150) NOT NULL,
      description TEXT,
      created_by INT NOT NULL,
      project_id INT,
      is_active BOOLEAN DEFAULT TRUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
    );
  `,

  createTeamsMember: `
    CREATE TABLE IF NOT EXISTS team_members (
      id INT AUTO_INCREMENT PRIMARY KEY,
      team_id INT NOT NULL,
      user_id INT NOT NULL,
      role ENUM('owner','admin','member','viewer') DEFAULT 'member',
      added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `,

  createTeamInvites: `
    CREATE TABLE IF NOT EXISTS team_invites (
      id INT AUTO_INCREMENT PRIMARY KEY,
      team_id INT NOT NULL,
      inviter_id INT NULL,
      invitee_email VARCHAR(255) NOT NULL,
      role ENUM('owner','admin','member') DEFAULT 'member',
      tokenHash VARCHAR(255) NOT NULL,
      expires_at DATETIME NOT NULL,
      used BOOLEAN DEFAULT FALSE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
      FOREIGN KEY (inviter_id) REFERENCES users(id) ON DELETE SET NULL
    );
  `,

  /* --------------------------------------------------------
      11) CLIENTS
  ---------------------------------------------------------*/
  createClientTable: `
    CREATE TABLE IF NOT EXISTS clients (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(200) NOT NULL,
      email VARCHAR(200),
      phone VARCHAR(100),
      address TEXT,
      role ENUM('customer','vip','enterprise','inactive') DEFAULT 'customer',
      created_by INT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
    );
  `,

  createClientProjectTable: `
    CREATE TABLE IF NOT EXISTS client_projects (
      id INT AUTO_INCREMENT PRIMARY KEY,
      client_id INT NOT NULL,
      project_id INT NOT NULL,
      assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
      UNIQUE KEY ux_client_project (client_id, project_id)
    );
  `,

  /* --------------------------------------------------------
      12) AUTH / SECURITY
  ---------------------------------------------------------*/
  createPasswordReset: `
    CREATE TABLE IF NOT EXISTS password_reset (
      id INT PRIMARY KEY AUTO_INCREMENT,
      user_id INT,
      tokenHash VARCHAR(255),
      created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `,

  createUserSocialAuth: `
    CREATE TABLE IF NOT EXISTS user_social_auth (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      provider ENUM('google','github','linkedin'),
      provider_user_id VARCHAR(255) NOT NULL,
      access_token VARCHAR(500),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `,

  createPasswordResets: `
    CREATE TABLE IF NOT EXISTS password_resets (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      token VARCHAR(255) NOT NULL,
      expires_at DATETIME NOT NULL,
      used BOOLEAN DEFAULT FALSE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `,
  createUserInfoTable:
  "CREATE TABLE IF NOT EXISTS user_info" +
  "(id INT PRIMARY KEY AUTO_INCREMENT, user_id INT, " +
  "first_name VARCHAR(255), last_name VARCHAR(255), email VARCHAR(255), phone VARCHAR(255), bio VARCHAR(255), street_address VARCHAR(255), country_code VARCHAR(255), state VARCHAR(255), city VARCHAR(255), zip INT , website VARCHAR(255),github VARCHAR(255), linkedin VARCHAR(255), twitter VARCHAR(255), created_date DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (user_id)REFERENCES users(id))",
  createTeamProjectTable: `
  CREATE TABLE IF NOT EXISTS team_projects (
  team_id INT,
  project_id INT,
  PRIMARY KEY (team_id, project_id),
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
  )`,
  createCategoryTable:
  `CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  created_by INT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE)`,
  createTeamCategoryTable: `
  CREATE TABLE IF NOT EXISTS team_categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  team_id INT NOT NULL,
  category_id INT NOT NULL,
  assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE)`,
  createFrequencyTable: `
  CREATE TABLE IF NOT EXISTS frequency (
  id INT AUTO_INCREMENT PRIMARY KEY,
  frequency VARCHAR(255) NOT NULL)`,
  createTaskTable: `
  CREATE TABLE IF NOT EXISTS task (
  id INT AUTO_INCREMENT PRIMARY KEY, creator INT NOT NULL,
  name VARCHAR(255) NOT NULL, description VARCHAR(255) NOT NULL, frequency INT NOT NULL, FOREIGN KEY (frequency) REFERENCES frequency(id) ON DELETE CASCADE, FOREIGN KEY (creator) REFERENCES users(id) ON DELETE CASCADE)`,
  createTaskGridTable: `
  CREATE TABLE IF NOT EXISTS task_grid (
  id INT AUTO_INCREMENT PRIMARY KEY, start_date DATETIME, end_date DATETIME,
  task INT NOT NULL, FOREIGN KEY (task) REFERENCES task(id) ON DELETE CASCADE)`,
  createTaskGridEntryTable: `
  CREATE TABLE IF NOT EXISTS task_grid_entry (
  id INT AUTO_INCREMENT PRIMARY KEY, date DATETIME, entry BOOLEAN DEFAULT FALSE,
  task_grid INT NOT NULL, FOREIGN KEY (task_grid) REFERENCES task_grid(id) ON DELETE CASCADE)`,
  createUserTaskEntryTable: `
  CREATE TABLE IF NOT EXISTS user_task_entry (
  id INT AUTO_INCREMENT PRIMARY KEY, date DATETIME, entry BOOLEAN DEFAULT FALSE,
  task INT NOT NULL, user INT NOT NULL, FOREIGN KEY (task) REFERENCES task(id) ON DELETE CASCADE,
  FOREIGN KEY (user) REFERENCES users(id) ON DELETE CASCADE)`,
  createUserTaskEntryMetadataTable: `
  CREATE TABLE IF NOT EXISTS user_task_entry_metadata (
  id INT AUTO_INCREMENT PRIMARY KEY, metadata VARCHAR(255) NOT NULL,
  user_task_entry INT NOT NULL, parent INT NOT NULL, FOREIGN KEY (user_task_entry) REFERENCES user_task_entry(id) ON DELETE CASCADE)`,
};

module.exports = createQuery;
