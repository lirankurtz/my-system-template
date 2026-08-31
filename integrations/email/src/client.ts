export interface EmailAttachment {
  filename: string
  content: Buffer | string
  contentType?: string
}

export interface EmailMessage {
  to: string | string[]
  subject: string
  html?: string
  text?: string
  replyTo?: string
  cc?: string | string[]
  bcc?: string | string[]
  attachments?: EmailAttachment[]
}

export interface SendEmailResult {
  id: string
  success: boolean
  error?: string
}

export interface EmailProvider {
  send(message: EmailMessage): Promise<SendEmailResult>
}

export type EmailProviderType = 'resend' | 'sendgrid'

export interface EmailConfig {
  provider: EmailProviderType
  apiKey: string
  fromEmail: string
  fromName?: string
}

export class EmailClient {
  private config: EmailConfig
  private provider: EmailProvider

  constructor(config: EmailConfig) {
    this.config = config
    this.provider = this.initializeProvider(config)
  }

  private initializeProvider(config: EmailConfig): EmailProvider {
    switch (config.provider) {
      case 'resend':
        return new ResendProvider(config)
      case 'sendgrid':
        return new SendGridProvider(config)
      default:
        throw new Error(`Unknown email provider: ${config.provider}`)
    }
  }

  async send(message: EmailMessage): Promise<SendEmailResult> {
    try {
      return await this.provider.send(message)
    } catch (error) {
      return {
        id: '',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }
}

class ResendProvider implements EmailProvider {
  private config: EmailConfig

  constructor(config: EmailConfig) {
    this.config = config
  }

  async send(message: EmailMessage): Promise<SendEmailResult> {
    // TODO: Implement Resend API call
    // const resend = new Resend(this.config.apiKey)
    // return await resend.emails.send({...})
    throw new Error('Resend provider not yet implemented')
  }
}

class SendGridProvider implements EmailProvider {
  private config: EmailConfig

  constructor(config: EmailConfig) {
    this.config = config
  }

  async send(message: EmailMessage): Promise<SendEmailResult> {
    // TODO: Implement SendGrid API call
    // sgMail.setApiKey(this.config.apiKey)
    // return await sgMail.send({...})
    throw new Error('SendGrid provider not yet implemented')
  }
}

export function createEmailClient(config: EmailConfig): EmailClient {
  return new EmailClient(config)
}
