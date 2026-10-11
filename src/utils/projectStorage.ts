import { Page, SiteProject } from '../types';
import { INITIAL_PROJECT } from '../data/defaultProject';
import { DEFAULT_THEME, LEGACY_BACKGROUND, THEME_BACKGROUNDS } from '../data/themes';

const STORAGE_KEY = 'pagedraft_isa101_project_v3';

/** Upgrade projects saved by older versions to the current slate palette. */
function migrateProject(project: SiteProject): SiteProject {
  const pages: Page[] = project.pages.map((page) =>
    page.rootNode.style?.backgroundColor === LEGACY_BACKGROUND
      ? {
          ...page,
          rootNode: {
            ...page.rootNode,
            style: { ...page.rootNode.style, backgroundColor: THEME_BACKGROUNDS[DEFAULT_THEME] },
          },
        }
      : page
  );
  const theme =
    project.theme?.mode === 'isa_day_gray'
      ? { ...project.theme, mode: DEFAULT_THEME }
      : project.theme;
  return { ...project, pages, theme };
}

/** True when a saved project exists in local storage and can be resumed. */
export function hasSavedProject(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) !== null;
  } catch {
    return false;
  }
}

export function loadProject(): SiteProject {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as SiteProject;
      if (parsed.pages?.[0]?.rootNode) return migrateProject(parsed);
    }
  } catch (err) {
    console.warn('Failed reading project from local storage', err);
  }
  return INITIAL_PROJECT;
}

export function saveProject(project: SiteProject): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
  } catch (err) {
    console.error('Failed saving project to local storage', err);
  }
}

export function clearSavedProject(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Failed clearing saved project', err);
  }
}
