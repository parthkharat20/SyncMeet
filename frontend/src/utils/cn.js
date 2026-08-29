/**
 * Simple, robust class name combination utility.
 * Merges conditional and truthy class names without requiring external heavy dependencies.
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default cn;
