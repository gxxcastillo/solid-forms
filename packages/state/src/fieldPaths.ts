export function splitFieldPath(name: string): string[] {
  return name.split('.');
}

export type FieldPathLookup = { found: boolean; value: unknown };

const unsafePathSegments = new Set(['__proto__', 'constructor', 'prototype']);

function hasUnsafePathSegment(segments: readonly string[]): boolean {
  return segments.some((segment) => unsafePathSegments.has(segment));
}

function isObjectLike(value: unknown): value is Record<string, unknown> {
  return value != null && typeof value === 'object';
}

function setOwnEnumerableProperty(target: Record<string, unknown>, name: string, value: unknown) {
  Object.defineProperty(target, name, {
    configurable: true,
    enumerable: true,
    value,
    writable: true
  });
}

// Reads a dotted path out of a nested object/array. Returns `found: false`
// (not just `value: undefined`) so callers can distinguish "path doesn't
// exist" from "path exists and is explicitly undefined", the same
// distinction `Object.hasOwn` gives a flat lookup.
export function getValueAtFieldPath(source: unknown, name: string): FieldPathLookup {
  if (!isObjectLike(source)) {
    return { found: false, value: undefined };
  }

  if (Object.hasOwn(source, name)) {
    return { found: true, value: source[name] };
  }

  const segments = splitFieldPath(name);
  if (segments.length < 2 || hasUnsafePathSegment(segments)) {
    return { found: false, value: undefined };
  }

  let current: unknown = source;

  for (const segment of segments) {
    if (!isObjectLike(current) || !Object.hasOwn(current, segment)) {
      return { found: false, value: undefined };
    }
    current = current[segment];
  }

  return { found: true, value: current };
}

// Inverse of getValueAtFieldPath: scatters flat (name, value) entries into a
// nested object, building an array instead of an object at any level whose
// *next* path segment is a bare integer (e.g. "items.0.title" creates
// `items: []`). A single-segment name is a no-op passthrough —
// buildObjectFromFieldEntries([["email", "x"]]) === { email: "x" }.
export function buildObjectFromFieldEntries(
  entries: ReadonlyArray<readonly [name: string, value: unknown]>
): Record<string, unknown> {
  const root: Record<string, unknown> = {};

  for (const [name, value] of entries) {
    const segments = splitFieldPath(name);

    if (segments.length < 2 || hasUnsafePathSegment(segments)) {
      setOwnEnumerableProperty(root, name, value);
      continue;
    }

    let target: Record<string, unknown> = root;

    for (let i = 0; i < segments.length - 1; i++) {
      const segment = segments[i];
      const nextIsArrayIndex = /^\d+$/.test(segments[i + 1]);
      const current = Object.hasOwn(target, segment) ? target[segment] : undefined;

      if (isObjectLike(current)) {
        target = current;
        continue;
      }

      const next = nextIsArrayIndex ? [] : {};
      setOwnEnumerableProperty(target, segment, next);
      target = next;
    }

    setOwnEnumerableProperty(target, segments[segments.length - 1], value);
  }

  return root;
}
