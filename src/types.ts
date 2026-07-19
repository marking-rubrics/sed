import { Timestamp } from 'firebase/firestore';

export type UserRole = 'Admin' | 'Lecturer' | 'Assessor';

/**
 * User Profile Metadata
 * Firestore Location: /users/{uid}
 */
export interface UserProfile {
  uid: string;
  displayName: string;
  role: UserRole;
}

/**
 * User data
 */
export interface User {
  uid: string;
  displayName: string;
  role: UserRole;
  rubricIds?: string[];
  teamIds?: string[];
}

/**
 * Junction Assignment Document
 * Firestore Location: /assignments/{assignmentId}
 */
export interface Assignment {
  id: string;
  assessorId: string;  // References UserProfile.uid
  teamId: string;      // References Team.id
  rubricId: string;    // References Rubric.id
  assignedAt: Timestamp;
}

/**
 * Team Structure
 * Firestore Location: /teams/{teamId}
 */
export interface Team {
  id: string;
  name: string;
  members: string[];
}

/**
 * Core Rubric Metatdata Document
 * Firestore Location: /rubrics/{rubricId}
 * OPTIMIZATION 1: Highly scalable. Heavy criteria lists are offloaded to a sub-collection.
 */
export interface Rubric {
  id: string;
  title: string;
  levels: RubricLevel[]; // Global levels for this rubric (e.g., A, B, C or 1, 2, 3)
}

export interface RubricLevel {
  range: string;        // e.g., "90-100" or "A"
  descriptor: string;   // e.g., "Excellent"
}

/**
 * Rubric Component Document
 * Firestore Location: /rubrics/{rubricId}/components/{componentId}
 * Each root component is its own document. Recursive subcomponents can still be nested safely
 * inside this document up to reasonable limits, or you can nest deeper if needed.
 */
export interface RubricComponent {
  id: string;
  name: string;
  weightage?: number;
  commentable: boolean;
  subcomponents?: RubricComponent[];                // Recursive structure
  levelDescriptions?: ComponentLevelDescription[];  // Linked to global RubricLevel
}

export interface ComponentLevelDescription {
  levelDescriptor: string; // References RubricLevel.descriptor
  description: string;     // The actual massive textual grading criteria block
}

/**
 * Assessed Rubric Structure
 * Firestore Location: /assessedRubrics/{assessmentId}
 */
export interface AssessedRubric {
  id?: string;
  teamId: string;         // References Team.id
  assessorId: string;     // References UserProfile.uid
  rubricId: string;       // References Rubric.id
  assessedAt: Timestamp;
  components: AssessedComponent[]; // The grading layout matches the component tree structure
}

export interface AssessedComponent {
  componentId: string;
  score?: number;
  comment?: string;
  subcomponents?: AssessedComponent[];
}
