/**
 * A small, hand-maintained synonym table for common tech/resume skills.
 * Deliberately not exhaustive — this catches the frequent, unambiguous
 * cases cheaply and deterministically (no network call, no latency, no
 * cost) so keyword matching doesn't falsely flag "JS" as missing when a
 * resume says "JavaScript". Genuinely ambiguous or long-tail synonyms are
 * left to the AI semantic match in the JD comparison, which is a much
 * better fit for that kind of fuzzy judgement than a static list ever
 * will be.
 */
const SYNONYM_GROUPS: string[][] = [
  ["javascript", "js"],
  ["typescript", "ts"],
  ["node.js", "node", "nodejs"],
  ["react.js", "react", "reactjs"],
  ["vue.js", "vue", "vuejs"],
  ["next.js", "nextjs", "next"],
  ["golang", "go"],
  ["postgresql", "postgres"],
  ["mongodb", "mongo"],
  ["kubernetes", "k8s"],
  ["amazon web services", "aws"],
  ["google cloud platform", "gcp", "google cloud"],
  ["microsoft azure", "azure"],
  ["machine learning", "ml"],
  ["artificial intelligence", "ai"],
  ["natural language processing", "nlp"],
  ["continuous integration", "ci"],
  ["continuous deployment", "continuous delivery", "cd"],
  ["ci/cd", "cicd", "ci cd"],
  ["restful api", "rest api", "rest"],
  ["object oriented programming", "oop"],
  ["structured query language", "sql"],
  ["user interface", "ui"],
  ["user experience", "ux"],
  ["application programming interface", "api"],
  ["relational database", "rdbms"],
  ["docker", "containerization"],
  ["python3", "python"],
  ["c++", "cpp"],
  ["c#", "csharp", "c sharp"],
  ["html5", "html"],
  ["css3", "css"],
  ["scikit-learn", "sklearn"],
  ["tensorflow", "tf"],
  ["large language model", "llm", "large language models", "llms"],
];

const canonicalByAlias = new Map<string, string>();
for (const group of SYNONYM_GROUPS) {
  const canonical = group[0]!;
  for (const alias of group) {
    canonicalByAlias.set(alias.toLowerCase(), canonical);
  }
}

/** Lowercases and strips punctuation/whitespace noise for comparison. */
function normalize(term: string): string {
  return term.trim().toLowerCase().replace(/\s+/g, " ");
}

/** Maps a skill/keyword to its canonical form, or itself if unknown. */
export function canonicalizeSkill(term: string): string {
  const n = normalize(term);
  return canonicalByAlias.get(n) ?? n;
}

/** True if two skill/keyword strings refer to the same underlying thing. */
export function areSkillsEquivalent(a: string, b: string): boolean {
  return canonicalizeSkill(a) === canonicalizeSkill(b);
}

/**
 * Removes items from `list` that are synonym-equivalent to something
 * already present earlier in the list, and drops any item from `list`
 * that is synonym-equivalent to something in `exclude`. Order-preserving.
 */
export function dedupeSkillsBySynonym(list: string[], exclude: string[] = []): string[] {
  const excludeCanonical = new Set(exclude.map(canonicalizeSkill));
  const seen = new Set<string>();
  const result: string[] = [];
  for (const item of list) {
    const canonical = canonicalizeSkill(item);
    if (excludeCanonical.has(canonical) || seen.has(canonical)) continue;
    seen.add(canonical);
    result.push(item);
  }
  return result;
}
