import { theme as antdTheme, type ThemeConfig } from 'antd';

/**
 * Obsidian Green — near-black surfaces with emerald-green accents.
 * Shared palette used across the entire Admin Dashboard (shell + pages).
 */
export const ADMIN_COLORS = {
  bgBase: '#000000',
  bgContainer: '#0B0B0B',
  bgElevated: '#141414',
  bgHover: '#1A1A1A',
  border: '#232323',
  borderSubtle: '#171717',
  green: '#22C55E',
  greenBright: '#4ADE80',
  greenDim: '#14532D',
  greenSoft: 'rgba(34, 197, 94, 0.14)',
  textPrimary: '#E8F5EC',
  textSecondary: '#9BA8A0',
  textMuted: '#5F6B64',
};

export const adminTheme: ThemeConfig = {
  algorithm: antdTheme.darkAlgorithm,
  token: {
    colorPrimary: ADMIN_COLORS.green,
    colorInfo: ADMIN_COLORS.green,
    colorSuccess: ADMIN_COLORS.greenBright,
    colorBgBase: ADMIN_COLORS.bgBase,
    colorBgContainer: ADMIN_COLORS.bgContainer,
    colorBgElevated: ADMIN_COLORS.bgElevated,
    colorBorder: ADMIN_COLORS.border,
    colorBorderSecondary: ADMIN_COLORS.borderSubtle,
    colorText: ADMIN_COLORS.textPrimary,
    colorTextSecondary: ADMIN_COLORS.textSecondary,
    colorTextDescription: ADMIN_COLORS.textSecondary,
    colorTextDisabled: ADMIN_COLORS.textMuted,
    colorSplit: ADMIN_COLORS.borderSubtle,
    borderRadius: 12,
    fontFamily: "'Geist', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  components: {
    Layout: {
      bodyBg: ADMIN_COLORS.bgBase,
      headerBg: ADMIN_COLORS.bgBase,
      siderBg: ADMIN_COLORS.bgBase,
    },
    Menu: {
      darkItemBg: ADMIN_COLORS.bgBase,
      darkSubMenuItemBg: ADMIN_COLORS.bgContainer,
      darkItemColor: ADMIN_COLORS.textSecondary,
      darkItemHoverBg: ADMIN_COLORS.bgHover,
      darkItemHoverColor: ADMIN_COLORS.textPrimary,
      darkItemSelectedBg: ADMIN_COLORS.greenDim,
      darkItemSelectedColor: ADMIN_COLORS.greenBright,
      itemBorderRadius: 10,
      itemMarginInline: 8,
    },
    Table: {
      headerBg: '#0F0F0F',
      headerColor: ADMIN_COLORS.greenBright,
      headerSplitColor: ADMIN_COLORS.borderSubtle,
      rowHoverBg: 'rgba(34, 197, 94, 0.06)',
      borderColor: ADMIN_COLORS.borderSubtle,
      cellPaddingBlock: 12,
    },
    Button: {
      primaryColor: '#04150B',
      primaryShadow: '0 6px 16px -4px rgba(34, 197, 94, 0.35)',
      defaultBg: ADMIN_COLORS.bgElevated,
      defaultBorderColor: '#2A2A2A',
      defaultColor: ADMIN_COLORS.textPrimary,
      defaultHoverBg: ADMIN_COLORS.bgHover,
      fontWeight: 500,
    },
    Modal: {
      contentBg: ADMIN_COLORS.bgElevated,
      headerBg: ADMIN_COLORS.bgElevated,
      titleColor: ADMIN_COLORS.textPrimary,
      titleFontSize: 17,
    },
    Card: { colorBgContainer: ADMIN_COLORS.bgContainer },
    Select: {
      optionSelectedBg: 'rgba(34, 197, 94, 0.18)',
      optionSelectedColor: ADMIN_COLORS.greenBright,
    },
    Input: { colorBgContainer: '#0F0F0F' },
    InputNumber: { colorBgContainer: '#0F0F0F' },
    DatePicker: { colorBgContainer: '#0F0F0F' },
    Tag: { defaultBg: ADMIN_COLORS.bgElevated, defaultColor: ADMIN_COLORS.textSecondary },
    Spin: { colorPrimary: ADMIN_COLORS.green },
    Progress: { defaultColor: ADMIN_COLORS.green },
    Statistic: { contentFontSize: 30 },
    Descriptions: {
      labelBg: '#0F0F0F',
    },
    Popconfirm: { colorBgElevated: ADMIN_COLORS.bgElevated },
  },
};
