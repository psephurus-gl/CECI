import { SiteProject } from '../types';

export const INITIAL_PROJECT: SiteProject = {
  id: 'mes-terminal-project',
  name: 'CTC Auto Log',
  description: 'ISA-101 High-Performance HMI & MES Operator Terminal.',
  activePageId: 'station-ctc-carrier',
  isPublished: true,
  publishedAt: new Date().toISOString(),
  theme: {
    font: 'Plus Jakarta Sans',
    accentColor: '#2563eb',
    mode: 'isa_slate_dark', // Deep dark industrial slate (#18181B)
  },
  pages: [
    // --- STATION 01: CTC AUTO LOG / MES CARRIER (Exact match to uploaded shop-floor screen) ---
    {
      id: 'station-ctc-carrier',
      name: 'CTC Auto Log (PD3)',
      slug: 'ctc-carrier',
      title: 'CTC Auto Log — MES Carrier Terminal',
      description: 'Industrial operator terminal for employee badge and carrier scanning.',
      isHome: true,
      isPublished: true,
      publishedAt: new Date().toISOString(),
      rootNode: {
        id: 'carrier-root',
        name: 'Industrial Terminal Viewport',
        type: 'container',
        style: {
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'between',
          alignItems: 'stretch',
          padding: 6,
          width: 'full',
          minHeight: '520px',
          backgroundColor: '#18181B', // Deep dark industrial slate
        },
        props: {},
        children: [
          // Top Left: System Tag
          {
            id: 'top-tag-row',
            name: 'Top Header Row',
            type: 'container',
            style: {
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'start',
              alignItems: 'center',
              width: 'full',
              padding: 0,
            },
            props: {},
            children: [
              {
                id: 'ctc-system-tag',
                name: 'System Identifier Tag',
                type: 'text',
                style: {
                  fontSize: 'sm',
                  fontWeight: 'bold',
                  textColor: '#FFFFFF',
                  textAlign: 'left',
                },
                props: {
                  content: 'CTC AUTO LOG (PD3)',
                  tag: 'h2',
                },
              },
            ],
          },

          // Center: Kiosk Content Stack (Title + Bare White Input Box + Instruction)
          {
            id: 'center-kiosk-frame',
            name: 'Center Scanner Stack',
            type: 'container',
            style: {
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              padding: 4,
              width: 'full',
            },
            props: {},
            children: [
              // Giant Centered Title: MES CARRIER
              {
                id: 'mes-carrier-title',
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
              },

              // Bare White Input Box (No label, thick black border, huge font)
              {
                id: 'carrier-barcode-input',
                name: 'Bare Barcode Input',
                type: 'input',
                style: {
                  width: 'half',
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
                  borderWidth: 3,
                  textColor: '#000000',
                  autoFocus: true,
                  validation: { required: true },
                },
              },

              // Instructional Subtitle
              {
                id: 'scan-instruction-text',
                name: 'Instruction Subtitle',
                type: 'text',
                style: {
                  fontSize: 'base',
                  fontWeight: 'medium',
                  textColor: '#FFFFFF',
                  textAlign: 'center',
                },
                props: {
                  content: 'สแกนบัตรพนักงานเพื่อเข้าใช้งาน',
                  tag: 'p',
                },
              },
            ],
          },

          // Bottom Bar: Version (Left) & Red EXIT Button (Right)
          {
            id: 'bottom-footer-bar',
            name: 'Bottom Anchor Bar',
            type: 'container',
            style: {
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'between',
              alignItems: 'end',
              width: 'full',
              padding: 0,
            },
            props: {},
            children: [
              // Bottom Left Version
              {
                id: 'ctc-version-tag',
                name: 'Version Label',
                type: 'text',
                style: {
                  fontSize: 'xs',
                  fontWeight: 'semibold',
                  textColor: '#E4E4E7',
                  textAlign: 'left',
                },
                props: {
                  content: 'V1.2.0',
                  tag: 'caption',
                },
              },

              // Bottom Right: High-Contrast Red EXIT Button
              {
                id: 'ctc-exit-btn',
                name: 'Safety Exit Button',
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
              },
            ],
          },
        ],
      },
    },

    // --- STATION 02: CLEAN BLANK CANVAS (For custom composition from scratch) ---
    {
      id: 'station-blank-custom',
      name: 'Station 02: Blank Canvas',
      slug: 'station-02',
      title: 'Blank Industrial Station',
      description: 'Clean empty canvas for building custom bare HMI terminals.',
      isHome: false,
      isPublished: true,
      publishedAt: new Date().toISOString(),
      rootNode: {
        id: 's2-blank-root',
        name: 'Blank Workstation Viewport',
        type: 'container',
        style: {
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          justifyContent: 'between',
          padding: 6,
          width: 'full',
          minHeight: '520px',
          backgroundColor: '#18181B',
        },
        props: {},
        children: [],
      },
    },
  ],
};
