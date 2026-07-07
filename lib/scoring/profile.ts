/**
 * Keywords used for skill matching, grouped by weight tier.
 * "core" = highest-value niche skills (DBA/ERP), "general" = broad web dev stack.
 */
export const SKILL_KEYWORDS = {
  core: [
    "sql server",
    "dynamics gp",
    "great plains",
    "ssrs",
    "vba",
    "modifier",
    "stored procedure",
    "dgii",
    "ncf",
    "e-cf",
    "ecf",
    "fiscal compliance",
    "database administrator",
    "dba",
  ],
  general: [
    "react",
    "next.js",
    "nextjs",
    "node.js",
    "nodejs",
    "mongodb",
    "javascript",
    "typescript",
    "full stack",
    "full-stack",
    "rest api",
    "shopify",
  ],
} as const;
