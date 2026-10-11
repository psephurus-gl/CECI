import { ComponentNode, ComponentType } from '../types';
import { createId } from '../utils/id';

export interface PrimitiveTemplateMeta {
  type: ComponentType;
  title: string;
  category: 'Bare Inputs' | 'ISA-101 Layouts' | 'Text & Headers' | 'Safety Actions';
  description: string;
  icon: string;
  createNode: () => ComponentNode;
}

export const COMPONENT_PRIMITIVES: PrimitiveTemplateMeta[] = [
  // --- BARE INPUTS (ISA-101 Operator First, No Forced Labels) ---
  {
    type: 'input',
    title: 'Bare White Input Box (CTC Style)',
    category: 'Bare Inputs',
    description: 'Raw, label-less white input with heavy black border. Exactly like shop-floor terminal screens.',
    icon: 'Barcode',
    createNode: () => ({
      id: createId('node'),
      name: 'Bare Input Box',
      type: 'input',
      style: {
        width: 'full',
      },
      props: {
        showLabel: false,
        inputType: 'barcode',
        placeholder: '',
        defaultValue: '',
        inputHeight: 64,
        fontSize: '2xl',
        textAlign: 'center',
        backgroundColor: '#FFFFFF',
        borderColor: '#000000',
        borderWidth: 2,
        textColor: '#000000',
        autoFocus: true,
        validation: { required: true },
      },
    }),
  },
  {
    type: 'input',
    title: 'Numeric Tolerance Input (Bare)',
    category: 'Bare Inputs',
    description: 'Numeric input with engineering unit and LSL/USL tolerance validation without card fluff.',
    icon: 'Gauge',
    createNode: () => ({
      id: createId('node'),
      name: 'Tolerance Input',
      type: 'input',
      style: {
        width: 'full',
      },
      props: {
        showLabel: true,
        label: 'Fastener Torque',
        inputType: 'number',
        placeholder: '24.0',
        unit: 'N·m',
        showUnit: true,
        defaultValue: 24.2,
        inputHeight: 52,
        fontSize: 'lg',
        textAlign: 'left',
        backgroundColor: '#FFFFFF',
        borderColor: '#000000',
        borderWidth: 2,
        textColor: '#000000',
        validation: {
          required: true,
          lsl: 22.0,
          nominal: 24.0,
          usl: 26.0,
          step: 0.1,
        },
        helpText: 'Nominal 24.0 N·m (±2.0)',
      },
    }),
  },
  {
    type: 'input',
    title: 'Standard Parameter Input',
    category: 'Bare Inputs',
    description: 'Glove-friendly operator text input for badge ID, lot numbers, or notes.',
    icon: 'Type',
    createNode: () => ({
      id: createId('node'),
      name: 'Operator ID Input',
      type: 'input',
      style: {
        width: 'full',
      },
      props: {
        showLabel: true,
        label: 'Operator Badge ID',
        inputType: 'text',
        placeholder: 'OP-402',
        defaultValue: 'OP-402',
        inputHeight: 52,
        fontSize: 'base',
        backgroundColor: '#FFFFFF',
        borderColor: '#000000',
        borderWidth: 2,
        textColor: '#000000',
        validation: { required: true },
      },
    }),
  },

  // --- TEXT & HEADERS (High Visibility) ---
  {
    type: 'text',
    title: 'MES Kiosk Title (Giant White)',
    category: 'Text & Headers',
    description: 'Giant bold high-contrast title (e.g. MES CARRIER) readable from 2 meters away.',
    icon: 'Heading',
    createNode: () => ({
      id: createId('node'),
      name: 'Kiosk Title',
      type: 'text',
      style: {
        fontSize: '3xl',
        fontWeight: 'extrabold',
        textColor: '#FFFFFF',
        textAlign: 'center',
      },
      props: {
        content: 'MES CARRIER',
        tag: 'h1',
      },
    }),
  },
  {
    type: 'text',
    title: 'Instructional Subtitle',
    category: 'Text & Headers',
    description: 'Operator instruction prompt placed beneath the input box.',
    icon: 'Type',
    createNode: () => ({
      id: createId('node'),
      name: 'Instruction Subtitle',
      type: 'text',
      style: {
        fontSize: 'lg',
        fontWeight: 'medium',
        textColor: '#FFFFFF',
        textAlign: 'center',
      },
      props: {
        content: 'สแกนบัตรพนักงานเพื่อเข้าใช้งาน',
        tag: 'p',
      },
    }),
  },
  {
    type: 'text',
    title: 'System Corner Tag',
    category: 'Text & Headers',
    description: 'Station or application identifier pinned to top or bottom corner.',
    icon: 'Type',
    createNode: () => ({
      id: createId('node'),
      name: 'System Tag',
      type: 'text',
      style: {
        fontSize: 'sm',
        fontWeight: 'bold',
        textColor: '#E2E8F0',
        textAlign: 'left',
      },
      props: {
        content: 'CTC AUTO LOG (PD3)',
        tag: 'p',
      },
    }),
  },
  {
    type: 'text',
    title: 'Version Tag (Bottom Corner)',
    category: 'Text & Headers',
    description: 'Quiet release version identifier for shop-floor tracking.',
    icon: 'Type',
    createNode: () => ({
      id: createId('node'),
      name: 'Version Label',
      type: 'text',
      style: {
        fontSize: 'xs',
        fontWeight: 'semibold',
        textColor: '#CBD5E1',
        textAlign: 'left',
      },
      props: {
        content: 'V1.2.0',
        tag: 'p',
      },
    }),
  },

  // --- SAFETY ACTIONS (ISA-101 Standardized Colors) ---
  {
    type: 'button',
    title: 'Red EXIT Button (Corner CTA)',
    category: 'Safety Actions',
    description: 'ISA-101 High-contrast Red (#DC2626) safety abort / exit button with square corners.',
    icon: 'SquareMousePointer',
    createNode: () => ({
      id: createId('node'),
      name: 'Exit Button',
      type: 'button',
      style: {
        width: 'auto',
      },
      props: {
        label: 'EXIT',
        colorScheme: 'red_danger',
        variant: 'solid',
        shape: 'square',
        touchHeight: 48,
        actionType: 'exit',
        icon: 'none',
      },
    }),
  },
  {
    type: 'button',
    title: 'Blue Action Button (Proceed / Scan)',
    category: 'Safety Actions',
    description: 'ISA-101 Blue (#2563EB) mandatory operator action button.',
    icon: 'SquareMousePointer',
    createNode: () => ({
      id: createId('node'),
      name: 'Submit Button',
      type: 'button',
      style: {
        width: 'auto',
      },
      props: {
        label: 'SUBMIT ENTRY →',
        colorScheme: 'blue_action',
        variant: 'solid',
        shape: 'square',
        touchHeight: 48,
        actionType: 'submit_log',
        icon: 'arrow',
      },
    }),
  },
  {
    type: 'button',
    title: 'Muted Gray Navigation Button',
    category: 'Safety Actions',
    description: 'Neutral gray button that avoids alarm color noise for routine navigation.',
    icon: 'SquareMousePointer',
    createNode: () => ({
      id: createId('node'),
      name: 'Back Button',
      type: 'button',
      style: {
        width: 'auto',
      },
      props: {
        label: '← BACK',
        colorScheme: 'gray_neutral',
        variant: 'outline',
        shape: 'square',
        touchHeight: 48,
        actionType: 'navigate',
        icon: 'arrow',
      },
    }),
  },

  // --- ISA-101 LAYOUTS & FRAMES ---
  {
    type: 'container',
    title: 'Centered Kiosk Stack Frame',
    category: 'ISA-101 Layouts',
    description: 'Vertical auto-layout container centered on screen with 480px width for kiosks.',
    icon: 'Columns',
    createNode: () => ({
      id: createId('node'),
      name: 'Centered Kiosk Stack',
      type: 'container',
      style: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        justifyContent: 'center',
        gap: 4,
        padding: 4,
        width: 'full',
        backgroundColor: 'transparent',
      },
      props: {},
      children: [],
    }),
  },
  {
    type: 'container',
    title: 'Corner Anchor Footer Bar',
    category: 'ISA-101 Layouts',
    description: 'Bottom row container with space-between for version tag (left) and EXIT button (right).',
    icon: 'Rows',
    createNode: () => ({
      id: createId('node'),
      name: 'Corner Anchor Bar',
      type: 'container',
      style: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'between',
        padding: 4,
        width: 'full',
        backgroundColor: 'transparent',
      },
      props: {},
      children: [],
    }),
  },
  {
    type: 'container',
    title: 'Industrial Grid (2-Cols)',
    category: 'ISA-101 Layouts',
    description: 'Two-column high-contrast layout for pairing dual inputs or telemetry metrics.',
    icon: 'LayoutGrid',
    createNode: () => ({
      id: createId('node'),
      name: 'Grid Panel (2 Cols)',
      type: 'container',
      style: {
        display: 'grid',
        gridCols: 2,
        gap: 4,
        padding: 2,
        width: 'full',
      },
      props: {},
      children: [],
    }),
  },
];
