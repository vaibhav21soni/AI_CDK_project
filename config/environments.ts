export interface EnvironmentConfig {
  stage: string;
  domainName?: string;
  certificateArn?: string;
  corsOrigins: string[];
  logRetentionDays: number;
  enablePointInTimeRecovery: boolean;
  enableWaf: boolean;
}

export const environments: Record<string, EnvironmentConfig> = {
  dev: {
    stage: 'dev',
    corsOrigins: ['*'],
    logRetentionDays: 3,
    enablePointInTimeRecovery: false,
    enableWaf: false,
  },
  staging: {
    stage: 'staging',
    corsOrigins: ['https://staging.yourdomain.com'],
    logRetentionDays: 7,
    enablePointInTimeRecovery: true,
    enableWaf: true,
  },
  prod: {
    stage: 'prod',
    domainName: 'yourdomain.com',
    corsOrigins: ['https://yourdomain.com'],
    logRetentionDays: 30,
    enablePointInTimeRecovery: true,
    enableWaf: true,
  },
};

export function getEnvironmentConfig(stage: string): EnvironmentConfig {
  const config = environments[stage];
  if (!config) {
    throw new Error(`Unknown environment: ${stage}`);
  }
  return config;
}
