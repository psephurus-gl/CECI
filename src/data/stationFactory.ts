import { IsaHmiTheme, Page, SiteProject } from '../types';
import { createId } from '../utils/id';
import { DEFAULT_THEME, THEME_BACKGROUNDS } from './themes';

interface StationOptions {
  name?: string;
  slug?: string;
  title?: string;
  description?: string;
  projectName?: string;
  theme?: IsaHmiTheme;
  isHome?: boolean;
}

/** Create a station (page) with an empty root container ready for composition. */
export function createBlankStation({
  name = 'New Station',
  slug = 'station',
  title,
  description = 'ISA-101 Operator Terminal.',
  projectName = 'MES Studio',
  theme = DEFAULT_THEME,
  isHome = false,
}: StationOptions = {}): Page {
  const id = createId('station');

  return {
    id,
    name,
    slug,
    title: title ?? `${name} — ${projectName}`,
    description,
    isHome,
    isPublished: true,
    publishedAt: new Date().toISOString(),
    rootNode: {
      id: `root-${id}`,
      name: `${name} Viewport`,
      type: 'container',
      style: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        justifyContent: 'between',
        padding: 6,
        width: 'full',
        minHeight: '520px',
        backgroundColor: THEME_BACKGROUNDS[theme],
      },
      props: {},
      children: [],
    },
  };
}

/** Create a project containing a single blank home station. */
export function createBlankProject(name = 'Untitled Project'): SiteProject {
  const home = createBlankStation({
    name: 'Station 01',
    slug: 'station-01',
    projectName: name,
    isHome: true,
  });

  return {
    id: createId('project'),
    name,
    description: 'ISA-101 High-Performance HMI & MES Operator Terminal.',
    activePageId: home.id,
    isPublished: false,
    theme: {
      font: 'Plus Jakarta Sans',
      accentColor: '#2563eb',
      mode: DEFAULT_THEME,
    },
    pages: [home],
  };
}
