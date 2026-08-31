import type Stripe from 'stripe'

export interface WebhookEvent {
  id: string
  type: Stripe.Event.Type
  data: unknown
  timestamp: number
}

export interface IdempotencyConfig {
  store: IdempotencyStore
  ttlSeconds?: number
}

export interface IdempotencyStore {
  get(key: string): Promise<unknown | null>
  set(key: string, value: unknown, ttlSeconds?: number): Promise<void>
}

export class StripeWebhookHandler {
  private secret: string
  private idempotencyConfig?: IdempotencyConfig

  constructor(webhookSecret: string, idempotencyConfig?: IdempotencyConfig) {
    this.secret = webhookSecret
    this.idempotencyConfig = idempotencyConfig
  }

  async handleWebhook(
    body: string,
    signature: string
  ): Promise<WebhookEvent | null> {
    try {
      const event = this.verifySignature(body, signature)
      if (!event) return null

      // Check idempotency if configured
      if (this.idempotencyConfig) {
        const cached = await this.idempotencyConfig.store.get(event.id)
        if (cached) {
          return cached as WebhookEvent
        }
      }

      // Store result for idempotency
      if (this.idempotencyConfig) {
        const ttl = this.idempotencyConfig.ttlSeconds || 3600
        await this.idempotencyConfig.store.set(event.id, event, ttl)
      }

      return event
    } catch (error) {
      console.error('Webhook verification failed:', error)
      return null
    }
  }

  private verifySignature(body: string, signature: string): WebhookEvent | null {
    // TODO: Implement Stripe signature verification using the webhook secret
    // Stub returns parsed event; production uses crypto.subtle or crypto module
    try {
      return JSON.parse(body) as WebhookEvent
    } catch {
      return null
    }
  }
}

export async function createWebhookHandler(
  secret: string,
  idempotencyStore?: IdempotencyStore
): Promise<StripeWebhookHandler> {
  return new StripeWebhookHandler(secret, {
    store: idempotencyStore || new InMemoryIdempotencyStore(),
    ttlSeconds: 3600,
  })
}

class InMemoryIdempotencyStore implements IdempotencyStore {
  private store = new Map<string, { value: unknown; expiresAt: number }>()

  async get(key: string): Promise<unknown | null> {
    const entry = this.store.get(key)
    if (!entry) return null
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key)
      return null
    }
    return entry.value
  }

  async set(
    key: string,
    value: unknown,
    ttlSeconds: number = 3600
  ): Promise<void> {
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    })
  }
}
