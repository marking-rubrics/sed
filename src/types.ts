/**
 * User Roles
 */
export type UserRole = 'Admin' | 'Lecturer' | 'Assessor';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
}

/**
 * Assessor Assignment Mapping
 * Stored in an "assessorAssignments" collection to track what each assessor is responsible for.
 */
export interface AssessorAssignment {
  id?: string;            // Document ID
  assessorId: string;     // References UserProfile.uid (must have role: 'Assessor')

  // High-level grouping: What rubrics and teams this assessor is assigned to
  assignedRubricIds: string[]; // References Rubric.id[]
  assignedTeamIds: string[];   // References Team.id[]

  // Optional: If you need precise coupling (e.g., Assessor assesses Team A specifically on Rubric X)
  specificTasks?: Array<{
    rubricId: string;
    teamId: string;
    isCompleted: boolean;
  }>;
}

/**
 * Core Rubric Structure
 */
export interface Rubric {
  id: string;
  levels: RubricLevel[];
  components: RubricComponent[];
}

export interface RubricLevel {
  range: string;        // e.g., "90-100" or "A"
  descriptor: string;   // e.g., "Excellent"
}

export interface RubricComponent {
  id: string;
  name: string;
  weightage?: number;   // Optional if it has subcomponents, required if leaf node
  commentable: boolean;
  subcomponents?: RubricComponent[]; // Recursive structure
  levelDescriptions?: ComponentLevelDescription[]; // If no subcomponents
}

export interface ComponentLevelDescription {
  levelDescriptor: string; // References RubricLevel.descriptor
  description: string;
}

/**
 * Assessed Rubric Structure
 */
export interface AssessedRubric {
  id?: string;
  teamId: string;         // References Team.id
  assessorId: string;     // References UserProfile.uid
  rubricId: string;       // References Rubric.id
  assessedAt: any;        // Firebase Timestamp or string
  components: AssessedComponent[];
}

export interface AssessedComponent {
  componentId: string;
  score?: number;
  comment?: string;
  subcomponents?: AssessedComponent[]; // Recursive tracking
}

/**
 * Team Structure
 */
export interface Team {
  id: string;
  name: string;
  members: string[];      // Array of student UIDs
}
