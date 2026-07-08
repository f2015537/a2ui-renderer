/**
 * Compile-time exhaustiveness check for a `switch` over a discriminated
 * union: TypeScript only allows calling this with a value already narrowed
 * to `never`, i.e. every member of the union was handled by an earlier
 * `case`. Adding a new member to the union without a matching `case` leaves
 * a non-`never` residual type reaching this call, which fails to compile.
 */
export function assertUnreachable(value: never): never {
  throw new Error(`Unreachable case: ${JSON.stringify(value)}`)
}
