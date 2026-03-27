/**
 * Shared “3D” press feedback: element shifts down and loses its bottom plate shadow
 * while :active (same idea as the header profile control).
 *
 * Use `duoPressParent` on the clickable surface. If a child has its own bottom shadow,
 * add `duoPressShadowChild` to that child so it flattens together with the parent press
 * (parent should include `group`, which `duoPressParent` already sets).
 */
export const duoPressParent =
  'group transition-all duration-150 ease-out outline-none active:translate-y-1 active:shadow-none';

/** Clears bottom shadow on nested chrome while the parent `group` is :active (pair with `transition-all` on the same node for smooth shadow) */
export const duoPressShadowChild = 'group-active:shadow-none';
