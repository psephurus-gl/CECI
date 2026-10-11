export type DeviceViewport = 'desktop' | 'tablet' | 'mobile';

export type KioskPresetId = '1280x800' | '1080p' | '1024x768' | 'scanner_gun' | 'custom';

export interface KioskPreset {
  id: KioskPresetId;
  name: string;
  width: number;
  height: number;
  description: string;
  aspectRatio: string;
}

export const KIOSK_PRESETS: Record<KioskPresetId, KioskPreset> = {
  '1280x800': {
    id: '1280x800',
    name: '1280 × 800 (10" Kiosk)',
    width: 1280,
    height: 800,
    description: 'Standard shop-floor mounted tablet & HMI',
    aspectRatio: '16:10',
  },
  '1080p': {
    id: '1080p',
    name: '1920 × 1080 (FHD Kiosk)',
    width: 1920,
    height: 1080,
    description: 'Widescreen production terminal',
    aspectRatio: '16:9',
  },
  '1024x768': {
    id: '1024x768',
    name: '1024 × 768 (Legacy 4:3)',
    width: 1024,
    height: 768,
    description: 'Classic industrial IPC touchscreen',
    aspectRatio: '4:3',
  },
  'scanner_gun': {
    id: 'scanner_gun',
    name: '412 × 915 (Scanner Gun)',
    width: 412,
    height: 915,
    description: 'Handheld rugged barcode terminal',
    aspectRatio: '9:20',
  },
  'custom': {
    id: 'custom',
    name: 'Custom Dimensions',
    width: 1200,
    height: 750,
    description: 'User-specified pixel resolution',
    aspectRatio: 'Custom',
  },
};

export type AppMode = 'editor' | 'graph' | 'published';

export type BuilderSubMode = 'design' | 'operator';

export type IsaHmiTheme = 'isa_slate_dark' | 'isa_day_gray' | 'isa_night_charcoal' | 'clean_light';

export type ComponentType =
  | 'container'
  | 'input'
  | 'text'
  | 'button'
  | 'metric'
  | 'statusBadge'
  | 'table'
  | 'checkbox'
  | 'divider'
  | 'select';

export interface ComponentStyle {
  // Layout (Auto-layout / Flex / Grid)
  display?: 'flex' | 'grid' | 'block';
  flexDirection?: 'row' | 'column';
  alignItems?: 'start' | 'center' | 'end' | 'stretch';
  justifyContent?: 'start' | 'center' | 'end' | 'between' | 'around';
  flexWrap?: 'wrap' | 'nowrap';
  gap?: number; // 0 to 8
  padding?: number; // 0 to 8
  gridCols?: number; // 1 to 4
  width?: 'auto' | 'full' | 'half' | 'third' | 'two-thirds' | 'quarter';
  minHeight?: number | string;

  // Appearance
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number; // 0, 1, 2, 3, 4
  borderRadius?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  shadow?: 'none' | 'sm' | 'md';

  // Typography
  fontSize?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  fontWeight?: 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold';
  textColor?: string;
  textAlign?: 'left' | 'center' | 'right';
}

export interface InputValidationRules {
  required?: boolean;
  min?: number;
  max?: number;
  lsl?: number; // Lower Spec Limit
  usl?: number; // Upper Spec Limit
  nominal?: number; // Target Nominal
  step?: number;
  pattern?: string;
}

export interface InputProps {
  label?: string;
  showLabel?: boolean; // When false, renders raw bare unadorned input (ISA-101 minimal)
  inputType: 'text' | 'number' | 'barcode' | 'select' | 'date' | 'textarea';
  placeholder?: string;
  defaultValue?: string | number;
  unit?: string; // e.g. 'N·m', 'mm', '°C', 'PSI'
  showUnit?: boolean;
  inputHeight?: number; // e.g. 48, 56, 68, 80px (glove friendly)
  fontSize?: 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl';
  textAlign?: 'left' | 'center';
  backgroundColor?: string; // e.g. '#FFFFFF' for stark bare input
  borderColor?: string; // e.g. '#000000'
  borderWidth?: number; // e.g. 2, 3, 4px
  textColor?: string; // e.g. '#000000'
  autoFocus?: boolean;
  options?: { label: string; value: string }[];
  validation?: InputValidationRules;
  helpText?: string;
  readOnly?: boolean;
}

export interface ButtonComponentProps {
  label: string;
  variant?: 'solid' | 'outline' | 'ghost' | 'danger' | 'success';
  colorScheme?: 'red_danger' | 'blue_action' | 'amber_warn' | 'gray_neutral' | 'green_safe';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  touchHeight?: number; // e.g. 48, 56, 64px
  shape?: 'square' | 'rounded';
  actionType?: 'navigate' | 'submit_log' | 'clear_inputs' | 'toggle_hold' | 'exit';
  targetPageId?: string;
  externalUrl?: string;
  icon?: 'arrow' | 'check' | 'alert' | 'link' | 'download' | 'refresh' | 'exit' | 'none';
}

export interface MetricComponentProps {
  label: string;
  value: string | number;
  unit?: string;
  target?: string | number;
  status?: 'nominal' | 'warning' | 'critical' | 'neutral';
  delta?: string;
}

export interface StatusBadgeProps {
  label: string;
  state: 'running' | 'nominal' | 'warning' | 'hold' | 'down' | 'qa_pass';
  showIndicator?: boolean;
}

export interface TextComponentProps {
  content: string;
  tag?: 'h1' | 'h2' | 'h3' | 'p' | 'badge' | 'caption';
  uppercase?: boolean;
}

export interface CheckboxComponentProps {
  label: string;
  subtext?: string;
  defaultChecked?: boolean;
  required?: boolean;
}

export interface TableComponentProps {
  caption?: string;
  headers: string[];
  rows: string[][];
  isChecklist?: boolean;
  striped?: boolean;
  bordered?: boolean;
  rowTargetPages?: Record<number, string>;
}

export interface SelectComponentProps {
  label?: string;
  placeholder?: string;
  options: { id: string; label: string; value: string; targetPageId?: string }[];
  defaultValue?: string;
}

export interface ComponentNode {
  id: string;
  name: string;
  type: ComponentType;
  children?: ComponentNode[];
  style: ComponentStyle;
  props: Record<string, any>;
}

export interface ProductionLogRecord {
  id: string;
  timestamp: string;
  stationId: string;
  stationName: string;
  workOrderId?: string;
  lotNumber?: string;
  operatorId?: string;
  status: 'PASS' | 'WARN' | 'FAIL';
  data: Record<string, any>;
}

export interface Page {
  id: string;
  name: string;
  slug: string;
  title: string;
  description: string;
  isHome: boolean;
  isPublished: boolean;
  publishedAt?: string;
  rootNode: ComponentNode;
}

export interface SiteProject {
  id: string;
  name: string;
  description: string;
  pages: Page[];
  activePageId: string;
  isPublished: boolean;
  publishedAt?: string;
  theme: {
    font: string;
    accentColor: string;
    mode: IsaHmiTheme; // 'isa_day_gray' | 'isa_night_charcoal' | 'clean_light'
  };
}
