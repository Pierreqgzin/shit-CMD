
export enum LogType {
  COMMAND = 'COMMAND',
  OUTPUT = 'OUTPUT',
  ERROR = 'ERROR',
  INFO = 'INFO',
  SYSTEM = 'SYSTEM',
  WARN = 'WARN',
  COMPONENT = 'COMPONENT'
}

export interface LogEntry {
  id: string;
  type: LogType;
  content: string; 
  timestamp: Date;
}

export interface ThemeConfig {
  backgroundColor: string;
  textColor: string;
  fontFamily: string; // 'Fira Code', 'Courier New', 'Arial', etc.
  layoutMode: 'standard' | 'centered' | 'wide';
  inputStyle: 'classic' | 'floating' | 'block';
}

export interface PackageMetadata {
  description: string;
  version: string;
  category: string;
}

export interface Package {
  name: string;
  version: string;
  description: string;
  type: 'SYSTEM' | 'USER'; 
  installedAt: Date;
  themeConfig?: ThemeConfig; // New field for app capability
}

export interface CommandResponse {
  output: string;
  type: LogType;
}