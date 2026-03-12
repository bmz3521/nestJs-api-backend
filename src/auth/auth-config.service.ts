import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  GetSecretValueCommand,
  SecretsManagerClient,
} from '@aws-sdk/client-secrets-manager';

@Injectable()
export class AuthConfigService {
  private readonly logger = new Logger(AuthConfigService.name);
  private secretsCachePromise?: Promise<Record<string, string>>;

  constructor(private readonly configService: ConfigService) {}

  async preload() {
    if (this.shouldLoadFromSecretsManager()) {
      const secretName = this.configService.get<string>(
        'AWS_SECRETS_MANAGER_SECRET_NAME',
      );
      const region = this.getSecretsManagerRegion();
      const secrets = await this.getSecretsManagerValues();

      this.ensureSecretKeysExist(secrets, [
        'JWT_ACCESS_SECRET',
        'JWT_REFRESH_SECRET',
        'JWT_ACCESS_EXPIRES_IN',
        'JWT_REFRESH_EXPIRES_IN',
      ]);

      this.logger.log(
        `Auth config source: AWS Secrets Manager (${secretName}) in region ${region}`,
      );
      return;
    }

    if (this.hasJwtEnvConfig()) {
      this.logger.log(
        'Auth config source: local environment (.env / process.env)',
      );
      return;
    }

    this.logger.warn(
      'Auth config source: built-in fallback values. Configure JWT_* env vars or AWS Secrets Manager for non-development environments.',
    );
  }

  async getAccessSecret() {
    return this.getConfigValue(
      'JWT_ACCESS_SECRET',
      'dev-access-secret-change-me',
    );
  }

  async getRefreshSecret() {
    return this.getConfigValue(
      'JWT_REFRESH_SECRET',
      'dev-refresh-secret-change-me',
    );
  }

  async getAccessExpiresIn() {
    return this.getConfigValue('JWT_ACCESS_EXPIRES_IN', '15m');
  }

  async getRefreshExpiresIn() {
    return this.getConfigValue('JWT_REFRESH_EXPIRES_IN', '30d');
  }

  private async getConfigValue(key: string, fallbackValue: string) {
    if (this.shouldLoadFromSecretsManager()) {
      const secrets = await this.getSecretsManagerValues();
      if (secrets[key]) {
        return secrets[key];
      }

      throw new Error(
        `Missing "${key}" in AWS Secrets Manager secret "${this.configService.get<string>(
          'AWS_SECRETS_MANAGER_SECRET_NAME',
        )}"`,
      );
    }

    const envValue = this.configService.get<string>(key);
    if (envValue) {
      return envValue;
    }

    return fallbackValue;
  }

  private async getSecretsManagerValues() {
    if (!this.shouldLoadFromSecretsManager()) {
      return {};
    }

    if (!this.secretsCachePromise) {
      this.secretsCachePromise = this.fetchSecretsManagerValues();
    }

    return this.secretsCachePromise;
  }

  private shouldLoadFromSecretsManager() {
    return Boolean(
      this.configService.get<string>('AWS_SECRETS_MANAGER_SECRET_NAME'),
    );
  }

  private async fetchSecretsManagerValues(): Promise<Record<string, string>> {
    const secretName = this.configService.get<string>(
      'AWS_SECRETS_MANAGER_SECRET_NAME',
    );

    if (!secretName) {
      return {};
    }

    const region = this.getSecretsManagerRegion();

    const client = new SecretsManagerClient({
      region,
    });

    const response = await client.send(
      new GetSecretValueCommand({
        SecretId: secretName,
      }),
    );

    const secretString = response.SecretString
      ? response.SecretString
      : response.SecretBinary
        ? Buffer.from(response.SecretBinary).toString('utf8')
        : '{}';

    const parsedSecret = JSON.parse(secretString) as Record<string, unknown>;

    return Object.fromEntries(
      Object.entries(parsedSecret).map(([key, value]) => [key, String(value)]),
    );
  }

  private hasJwtEnvConfig() {
    return Boolean(
      this.configService.get<string>('JWT_ACCESS_SECRET') &&
        this.configService.get<string>('JWT_REFRESH_SECRET'),
    );
  }

  private getSecretsManagerRegion() {
    return (
      this.configService.get<string>('AWS_SECRETS_MANAGER_REGION') ??
      this.configService.get<string>('AWS_REGION') ??
      this.configService.get<string>('AWS_DEFAULT_REGION') ??
      'ap-southeast-2'
    );
  }

  private ensureSecretKeysExist(
    secrets: Record<string, string>,
    requiredKeys: string[],
  ) {
    const missingKeys = requiredKeys.filter((key) => !secrets[key]);

    if (missingKeys.length > 0) {
      throw new Error(
        `AWS Secrets Manager secret "${this.configService.get<string>(
          'AWS_SECRETS_MANAGER_SECRET_NAME',
        )}" is missing required keys: ${missingKeys.join(', ')}`,
      );
    }
  }
}
