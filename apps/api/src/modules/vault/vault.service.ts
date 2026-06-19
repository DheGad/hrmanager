// @ts-nocheck
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { AuditService } from '../audit/audit.service';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class VaultService {
  private readonly logger = new Logger(VaultService.name);
  private s3Client: S3Client;

  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
    private configService: ConfigService
  ) {
    this.s3Client = new S3Client({
      region: this.configService.get<string>('storage.region') || 'us-east-1',
      endpoint: this.configService.get<string>('storage.endpoint') || 'http://localhost:9000',
      credentials: {
        accessKeyId: this.configService.get<string>('storage.accessKey') || 'minioadmin',
        secretAccessKey: this.configService.get<string>('storage.secretKey') || 'minioadmin'
      },
      forcePathStyle: true // Required for MinIO
    });
  }

  /**
   * Generates a securely signed URL valid for 15 minutes to view a file
   */
  async getPresignedUrl(tenantId: string, employeeId: string, fileId: string, userId: string): Promise<string> {
    const file = await this.prisma.employeeFile.findFirst({
      where: { id: fileId, tenantId, employeeId }
    });

    if (!file) throw new NotFoundException('File not found in employee vault');

    const bucketName = this.configService.get<string>('storage.bucketName') || 'hrmanager4u';
    // Expect fileUrl to be stored as a key like `tenants/123/employees/456/passport.pdf`
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: file.fileUrl
    });

    try {
      const url = await getSignedUrl(this.s3Client, command, { expiresIn: 900 });

      // @AuditedRead equivalent for manual service invocation
      this.auditService.log({
        action: 'VAULT_FILE_READ',
        resource: 'EmployeeFile',
        resourceId: file.id,
        tenantId,
        userId,
        description: `Generated presigned URL for \${file.category} file`
      });

      return url;
    } catch (e) {
      this.logger.error('Failed to generate presigned URL', e);
      throw new Error('Could not access secure vault storage');
    }
  }

  async recordFileUpload(tenantId: string, employeeId: string, category: any, title: string, fileUrl: string, fileSize: number, mimeType: string, isEncrypted: boolean, userId: string) {
    const file = await this.prisma.employeeFile.create({
      data: {
        tenantId,
        employeeId,
        category,
        title,
        fileUrl,
        fileSize,
        mimeType,
        isEncrypted,
        uploadedBy: userId
      }
    });

    this.auditService.log({
      action: 'VAULT_FILE_UPLOADED',
      resource: 'EmployeeFile',
      resourceId: file.id,
      tenantId,
      userId,
      description: `Uploaded \${category} to vault`
    });

    return file;
  }
}
