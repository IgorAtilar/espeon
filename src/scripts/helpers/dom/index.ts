export const createElement = <K extends keyof HTMLElementTagNameMap>({
  tagName,
  attributes,
}: {
  tagName: K;
  attributes?: Record<string, string>;
}): HTMLElementTagNameMap[K] => {
  const el = document.createElement(tagName);
  Object.entries(attributes || {}).forEach(([key, value]) =>
    el.setAttribute(key, value)
  );
  return el;
};

export const isMobile = () => window.innerWidth <= 800;
