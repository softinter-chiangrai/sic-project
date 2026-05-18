export interface AppThemeConfig {
  mode?: 'light' | 'dark';

  crmPrimary?: string;
  crmSuccess?: string;
  crmDanger?: string;

  lightBg?: string;
  lightSidebar?: string;
  lightSidebarHover?: string;
  lightText?: string;
  lightTextMuted?: string;
  lightTextActive?: string;
  lightBorder?: string;

  darkBg?: string;
  darkSidebar?: string;
  darkSidebarHover?: string;
  darkText?: string;
  darkTextMuted?: string;
  darkTextActive?: string;
  darkBorder?: string;
}

export interface AppConfig {
  theme?: AppThemeConfig;
}