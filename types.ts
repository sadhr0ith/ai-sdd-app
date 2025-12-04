
export enum SpecType {
  // Project Management
  EPIC_BREAKDOWN = 'Epic / Project Breakdown',
  PRD = 'Product Requirement Doc',
  USER_STORY = 'User Stories & Acceptance Criteria',

  // Software Engineering
  SYSTEM_DESIGN = 'System Design Document',
  COMPONENT = 'UI Component Spec',
  API = 'API Endpoint Spec',
  MOBILE_APP = 'Mobile App Architecture',
  DB_SCHEMA = 'Database Schema Design',
  PYTHON_MODULE = 'Python Module Spec',
  SECURITY_REVIEW = 'Security & Threat Model',

  // Data & Big Data
  DATA_PIPELINE = 'Data Pipeline (ETL) Spec',
  DATA_WAREHOUSE = 'Data Warehouse & Modeling',
  DATA_GOVERNANCE = 'Data Governance & Catalog',

  // AI & Machine Learning
  AI_MODEL = 'AI/ML Model Spec',
  LLM_RAG = 'LLM & RAG System Spec',
  MLOPS_PIPELINE = 'MLOps & Deployment Spec',

  // Operations
  DEVOPS_CONFIG = 'DevOps & Infra Spec',
  TEST_PLAN = 'QA & Test Strategy',

  // Maintenance & Evolution (Brownfield)
  LEGACY_REFACTOR = 'Refactoring Plan',
  MIGRATION_PLAN = 'Migration Strategy',
  FEATURE_ADDITION = 'Feature Implementation Plan'
}

export interface SpecHistoryItem {
  id: string;
  title: string;
  type: SpecType;
  content: string;
  timestamp: number;
  originalPrompt?: string;
}

export interface GenerationConfig {
  type: SpecType;
  context: string;
  audience: string;
}
