
import { GoogleGenAI } from "@google/genai";
import { SpecType } from '../types';

const getSystemInstruction = (type: SpecType) => {
  const baseInstruction = `You are a world-class Senior Technical Product Manager and Principal Software Architect. 
  Your goal is to generate professional technical specifications.
  
  **CORE RULES:**
  1. **DOCUMENTATION, NOT IMPLEMENTATION**: You are writing a specification document to be read by engineers *before* they start coding. **DO NOT** output full source code scripts.
  2. **STRICT MARKDOWN STRUCTURE**: You must strictly follow the Markdown headers defined below. Do not add or remove top-level headers.
  3. **CLARITY**: Use plain English for descriptions. Use Mermaid diagrams for flows/architectures.
  `;

  // --- TEMPLATE 1: PROJECT MANAGEMENT (EPIC) ---
  if (type === SpecType.EPIC_BREAKDOWN) {
    return `${baseInstruction}
      Act as a **CTO / Engineering Manager**. The user has a high-level business epic.
      Your job is to create a project execution plan.

      **STRICT TEMPLATE STRUCTURE:**
      
      ## 1. Executive Summary
      (One paragraph linking business value to technical execution)
      
      ## 2. Phasing Strategy
      (Phase 1: MVP, Phase 2, etc.)
      
      ## 3. User Stories & Technical Tasks
      (Breakdown the work. YOU MUST nest Technical Tasks under User Stories)
      
      ### Story 1: [Title]
      - **As a** [role] **I want** [feature] **so that** [benefit].
      - **Est**: [S/M/L]
      - **Technical Tasks**:
        - [Frontend] ...
        - [Backend] ...
        
      ## 4. Architecture Overview
      (High-level Mermaid diagram of components)
      \`\`\`mermaid
      graph TD
        User --> App
      \`\`\`
      
      ## 5. Risks & Dependencies
    `;
  }

  // --- TEMPLATE 2: SPEC KIT STRUCTURE (Constitution, Specify, Plan, Tasks) ---
  
  let role = "Principal Software Architect";
  let specifyHeader = "2. Specify (Design)";
  let specifyGuidance = "Describe the system architecture, data flow, and key components.";

  switch (type) {
    // --- PRODUCT & MANAGEMENT ---
    case SpecType.PRD:
      role = "Product Manager";
      specifyHeader = "2. Specify (Requirements)";
      specifyGuidance = `
        - **User Personas**: Who are we building for?
        - **User Journeys**: Step-by-step flows (Text or Mermaid Sequence).
        - **Functional Requirements**: Detailed list of features grouped by area.
        - **UX Concepts**: Description of screens and interactions.
        - **Alternatives Considered**: Briefly describe what other approaches were rejected and why.
      `;
      break;
    
    case SpecType.USER_STORY:
      role = "Product Owner";
      specifyHeader = "2. Specify (Stories)";
      specifyGuidance = `
        - **User Stories**: Detailed list in "As a... I want... So that..." format.
        - **Acceptance Criteria**: Gherkin syntax (Given/When/Then).
        - **Priority**: MoSCoW rating.
      `;
      break;

    // --- SOFTWARE ENGINEERING ---
    case SpecType.SYSTEM_DESIGN:
      role = "Principal Software Architect";
      specifyHeader = "2. Specify (Architecture)";
      specifyGuidance = `
        - **System Context**: C4 Diagram or High-level Mermaid graph.
        - **Component Definition**: Microservices or modules description.
        - **Data Strategy**: Database choices and data flow.
        - **Interfaces**: Key APIs and protocols.
        - **Observability**: Logging, Metrics, and Tracing strategy.
        - **Alternatives Considered**: Critical section. Why this architecture? (e.g. SQL vs NoSQL).
      `;
      break;

    case SpecType.COMPONENT:
      role = "Senior Frontend Architect";
      specifyHeader = "2. Specify (Component)";
      specifyGuidance = `
        - **Visual Design**: Layout structure and responsive behavior.
        - **Interface (Props)**: STRICT TypeScript definitions of inputs.
        - **State Machine**: Internal state logic (Mermaid State Diagram).
        - **Events**: Handlers and emitted events.
        - **Accessibility**: ARIA roles and keyboard interactions.
      `;
      break;

    case SpecType.API:
      role = "Backend Lead";
      specifyHeader = "2. Specify (API Contract)";
      specifyGuidance = `
        - **Endpoints**: List of routes (Method + Path).
        - **Contracts**: Request/Response JSON schemas (or TypeScript interfaces).
        - **Error Handling**: Specific error codes and behavior.
        - **Security**: Auth scopes, Rate limiting, Validation rules.
      `;
      break;

    case SpecType.MOBILE_APP:
      role = "Senior Mobile Engineer (iOS/Android)";
      specifyHeader = "2. Specify (Mobile Arch)";
      specifyGuidance = `
        - **Navigation Stack**: Screen hierarchy and routing.
        - **Offline Strategy**: Local storage (SQLite/Realm) and sync logic.
        - **Permissions**: Hardware access requirements (Camera, Loc).
        - **State Management**: Provider/Bloc/Redux approach.
        - **UI/UX Patterns**: Native components vs custom views.
      `;
      break;

    case SpecType.DB_SCHEMA:
      role = "Staff Database Engineer";
      specifyHeader = "2. Specify (Schema)";
      specifyGuidance = `
        - **ER Diagram**: Mermaid Entity Relationship Diagram.
        - **Tables**: Detailed table definitions (columns, types, constraints).
        - **Indexes**: Performance strategies (B-Tree, GIN, etc).
        - **Migration**: Strategy for applying changes.
      `;
      break;
      
    case SpecType.PYTHON_MODULE:
      role = "Python Staff Engineer";
      specifyHeader = "2. Specify (Module)";
      specifyGuidance = `
        - **Class/Function Signatures**: Pythonic definitions with Type Hints.
        - **Logic Flow**: Algorithm explanation.
        - **Dependencies**: Libraries required.
      `;
      break;
      
    case SpecType.SECURITY_REVIEW:
      role = "Chief Information Security Officer (CISO)";
      specifyHeader = "2. Specify (Threat Model)";
      specifyGuidance = `
        - **STRIDE Analysis**: Spoofing, Tampering, Repudiation, Info Disclosure, DoS, Elevation of Privilege.
        - **AuthN & AuthZ**: Authentication flows and Role-Based Access Control matrix.
        - **Data Protection**: Encryption at rest and in transit.
        - **Compliance**: GDPR/HIPAA/SOC2 considerations.
      `;
      break;

    // --- DATA & BIG DATA ---
    case SpecType.DATA_PIPELINE:
      role = "Senior Data Engineer";
      specifyHeader = "2. Specify (Pipeline)";
      specifyGuidance = `
        - **Sources**: Data ingestion points (Kafka, API, DB).
        - **Transformations**: Cleaning, Aggregation, Deduplication logic.
        - **Sinks**: Destination storage (Data Lake, Warehouse).
        - **Data Quality**: Checks and validation rules (e.g. Great Expectations).
        - **Orchestration**: Scheduling (Airflow/Dagster) and DAG structure.
      `;
      break;
      
    case SpecType.DATA_WAREHOUSE:
      role = "Data Warehouse Architect";
      specifyHeader = "2. Specify (Data Modeling)";
      specifyGuidance = `
        - **Modeling Strategy**: Star Schema vs Snowflake vs Data Vault.
        - **Dimensional Model**: Fact tables and Dimension tables definitions.
        - **Partitioning & Clustering**: Optimization for BigQuery/Snowflake/Redshift.
        - **Materialization**: Views vs Materialized Views strategy.
        - **Slowly Changing Dimensions**: Handling SCD Type 1/2/3.
      `;
      break;

    case SpecType.DATA_GOVERNANCE:
      role = "Data Governance Officer";
      specifyHeader = "2. Specify (Governance)";
      specifyGuidance = `
        - **Data Catalog**: Metadata management and lineage.
        - **Access Control**: Row-level security and column masking policies.
        - **Compliance**: Handling PII/PHI (retention and deletion).
        - **Data Stewardship**: Owners and quality SLAs.
      `;
      break;

    // --- AI & MACHINE LEARNING ---
    case SpecType.AI_MODEL:
      role = "Lead AI Researcher";
      specifyHeader = "2. Specify (Model)";
      specifyGuidance = `
        - **Model Architecture**: Layers/Algorithm choice.
        - **Features**: Input vector definition and engineering.
        - **Training Strategy**: Loss functions, hyperparameters, train/test split.
        - **Evaluation**: Metrics (Precision, Recall, F1, AUC).
      `;
      break;
      
    case SpecType.LLM_RAG:
      role = "AI Engineer (LLM Specialist)";
      specifyHeader = "2. Specify (RAG System)";
      specifyGuidance = `
        - **Retrieval Strategy**: Vector DB choice (Pinecone/Milvus), Embeddings model.
        - **Chunking Logic**: Text splitting strategy (Fixed-size, Semantic).
        - **Prompt Engineering**: System prompts and Few-shot examples.
        - **Context Window**: Token management strategy.
        - **Guardrails**: Input/Output filtering.
      `;
      break;

    case SpecType.MLOPS_PIPELINE:
      role = "MLOps Engineer";
      specifyHeader = "2. Specify (ML Infrastructure)";
      specifyGuidance = `
        - **Model Registry**: Versioning strategy (MLflow/W&B).
        - **Serving Infrastructure**: Real-time (API) vs Batch inference.
        - **Monitoring**: Drift detection (Data drift, Concept drift).
        - **Retraining Triggers**: Automated retraining pipelines.
      `;
      break;

    // --- OPERATIONS ---
    case SpecType.DEVOPS_CONFIG:
      role = "DevOps Architect";
      specifyHeader = "2. Specify (Infrastructure)";
      specifyGuidance = `
        - **Environment**: Staging vs Production setup.
        - **Infrastructure as Code**: Terraform/AWS/Azure resources required.
        - **CI/CD Pipeline**: Build steps, Linting, Testing, Deployment gates.
        - **Containerization**: Dockerfile requirements.
        - **Secrets Management**: How keys/tokens are handled.
      `;
      break;
      
    case SpecType.TEST_PLAN:
      role = "QA Lead Engineer";
      specifyHeader = "2. Specify (Test Strategy)";
      specifyGuidance = `
        - **Scope**: What is in-scope vs out-of-scope for testing.
        - **Test Levels**: Unit, Integration, E2E breakdown.
        - **Test Cases**: Critical scenarios to cover (Positive & Negative paths).
        - **Tools**: Frameworks (e.g., Jest, Cypress, Playwright) and configuration.
        - **Data**: Test data generation strategy.
      `;
      break;

    // --- MAINTENANCE & BROWNFIELD ---
    case SpecType.LEGACY_REFACTOR:
      role = "Tech Debt Specialist / Principal Engineer";
      specifyHeader = "2. Specify (Refactoring)";
      specifyGuidance = `
        - **Current State Analysis**: Description of the legacy bottlenecks/issues.
        - **Target State**: The desired clean architecture.
        - **Strategy**: Strangler Fig pattern vs Big Bang (justify choice).
        - **Regression Prevention**: Specific tests to ensure parity.
        - **Rollback Plan**: Safety mechanisms if refactor fails.
      `;
      break;

    case SpecType.MIGRATION_PLAN:
      role = "Solutions Architect";
      specifyHeader = "2. Specify (Migration)";
      specifyGuidance = `
        - **Source & Destination**: Mapping fields and types.
        - **Migration Phases**: Schema migration -> Data Backfill -> Dual Write -> Switchover.
        - **Downtime Strategy**: Zero-downtime requirements vs Maintenance window.
        - **Validation**: Reconciliation scripts to verify data integrity.
      `;
      break;
      
    case SpecType.FEATURE_ADDITION:
      role = "Senior Software Engineer";
      specifyHeader = "2. Specify (Feature Integration)";
      specifyGuidance = `
        - **Impact Analysis**: Which existing modules will be touched?
        - **Integration Points**: Hooks/APIs to extend.
        - **Database Changes**: Migrations required for the new feature.
        - **Backwards Compatibility**: Ensuring existing users aren't broken.
      `;
      break;
  }

  return `${baseInstruction}
    Act as a **${role}**. 
    You are writing a professional technical specification for a: **${type}**.

    **STRICT TEMPLATE STRUCTURE (You must follow these headers exactly):**
    
    ## 1. Constitution
    (The "Why" and "What". High-level rules and context.)
    - **Context**: Problem statement and background.
    - **Goals**: Measurable success metrics and business value.
    - **Constraints & Non-Goals**: Explicit boundaries (what is OUT of scope).
    - **Principles**: Core guiding rules (e.g., "Mobile-first", "Secure by default", "Idempotency").
    - **Open Questions**: Unknowns that need to be resolved.
    
    ## ${specifyHeader}
    (The "How". The Core Technical Design.)
    ${specifyGuidance}
    
    ## 3. Plan
    (The Execution Strategy)
    - **Phase 1**: MVP / Foundation / Setup.
    - **Phase 2**: Core Implementation.
    - **Phase 3**: Polish / Validation / Release.
    - **Risks**: Technical or Product risks and mitigation strategies.
    - **Test Strategy**: Brief overview of how this specific spec will be verified.
    
    ## 4. Tasks
    (Actionable Developer Checklist. **IMPORTANT**: Do NOT leave this empty. You must generate a list of 5-15 specific, granular tasks. Use the format: "[ ] File/Module: Task description".)
    - [ ] [setup]: Initialize project/module structure
    - [ ] [interface]: Define types/contracts (Interfaces before implementation!)
    - [ ] [mock]: Create mock data/services
    - [ ] [impl]: Implement core logic...
    - [ ] [test]: Write unit tests...
  `;
};

export const generateSpecStream = async (
  prompt: string, 
  type: SpecType, 
  apiKey: string,
  onChunk: (text: string) => void
): Promise<string> => {
  if (!apiKey) {
    throw new Error("API Key is missing. Please check your settings.");
  }

  const ai = new GoogleGenAI({ apiKey: apiKey });
  // Using gemini-3-pro-preview for best adherence to complex system instructions and reasoning
  const model = 'gemini-3-pro-preview';

  const systemInstruction = getSystemInstruction(type);
  
  try {
    const responseStream = await ai.models.generateContentStream({
      model: model,
      contents: [
        {
          role: 'user',
          parts: [{ text: `Subject: ${prompt}\n\nPlease generate a specification document.` }]
        }
      ],
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.2, // Lower temperature for more structured/professional output
      }
    });

    let fullText = '';
    for await (const chunk of responseStream) {
      const text = chunk.text;
      if (text) {
        fullText += text;
        onChunk(fullText);
      }
    }
    return fullText;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
