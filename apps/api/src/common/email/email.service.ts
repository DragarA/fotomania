import * as fs from 'fs';
import * as path from 'path';

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import FormData from 'form-data';
import Handlebars from 'handlebars';
import Mailgun from 'mailgun.js';
import { I18nService } from 'nestjs-i18n';

import { EmailTemplate } from './email.constants';

const DEFAULT_LANGUAGE = 'en';

export interface EmailAttachment {
    filename: string;
    data: Buffer;
    contentType: string;
}

export interface SendEmailOptions {
    to: string | string[];
    template: EmailTemplate;
    language?: string;
    context: Record<string, unknown>;
    attachments?: EmailAttachment[];
}

// Map template enum values to translation keys
const TEMPLATE_TO_TRANSLATION_KEY: Record<EmailTemplate, string> = {
    [EmailTemplate.DELIVERY_READY]: 'delivery_ready',
    [EmailTemplate.FAVOURITES_SUBMITTED]: 'favourites_submitted',
};

@Injectable()
export class EmailService implements OnModuleInit {
    private readonly logger = new Logger(EmailService.name);
    private mg: ReturnType<Mailgun['client']>;
    private templates: Map<string, Handlebars.TemplateDelegate> = new Map();
    private baseTemplate!: Handlebars.TemplateDelegate;

    private readonly domain: string;
    private readonly fromEmail: string;
    private readonly fromName: string;

    constructor(
        private readonly configService: ConfigService,
        private readonly i18n: I18nService
    ) {
        const mailgun = new Mailgun(FormData);
        this.mg = mailgun.client({
            username: 'api',
            key: this.configService.getOrThrow<string>('MAILGUN_API_KEY'),
        });

        this.domain = this.configService.getOrThrow<string>('MAILGUN_DOMAIN');
        this.fromEmail =
            this.configService.getOrThrow<string>('MAILGUN_FROM_EMAIL');
        this.fromName =
            this.configService.getOrThrow<string>('MAILGUN_FROM_NAME');
    }

    onModuleInit() {
        this.loadTemplates();
        this.registerPartials();
        this.registerI18nHelper();
        this.logger.log('Email templates loaded and compiled');
    }

    async send(options: SendEmailOptions): Promise<void> {
        const { template, context, to, attachments } = options;
        const language = options.language || DEFAULT_LANGUAGE;

        // Get the translated subject
        const translationKey = TEMPLATE_TO_TRANSLATION_KEY[template];
        const subject = this.i18n.t(`emails.${translationKey}.subject`, {
            lang: language,
            args: context,
        });

        const html = this.renderTemplate(template, context, language);
        const recipients = Array.isArray(to) ? to : [to];

        try {
            // Build message options
            const messageOptions: Parameters<
                typeof this.mg.messages.create
            >[1] = {
                from: `${this.fromName} <${this.fromEmail}>`,
                to: recipients,
                subject,
                html,
            };

            // Add attachments if provided
            if (attachments && attachments.length > 0) {
                messageOptions.attachment = attachments.map((att) => ({
                    filename: att.filename,
                    data: att.data,
                    contentType: att.contentType,
                }));
            }

            const result = await this.mg.messages.create(
                this.domain,
                messageOptions
            );

            this.logger.log(
                `Email sent successfully to ${recipients.join(', ')}: ${result.id}`
            );
        } catch (error) {
            this.logger.error(
                `Failed to send email to ${recipients.join(', ')}`,
                error
            );
            throw error;
        }
    }

    private loadTemplates(): void {
        const templatesDir = path.join(__dirname, 'templates');

        // Load base template
        const baseTemplatePath = path.join(templatesDir, 'base.hbs');
        const baseTemplateSource = fs.readFileSync(baseTemplatePath, 'utf-8');
        this.baseTemplate = Handlebars.compile(baseTemplateSource);

        // Load all email templates
        for (const template of Object.values(EmailTemplate)) {
            const templatePath = path.join(templatesDir, `${template}.hbs`);
            const templateSource = fs.readFileSync(templatePath, 'utf-8');
            this.templates.set(template, Handlebars.compile(templateSource));
        }
    }

    private registerPartials(): void {
        const partialsDir = path.join(__dirname, 'templates', 'partials');

        if (!fs.existsSync(partialsDir)) {
            return;
        }

        const partialFiles = fs.readdirSync(partialsDir);

        for (const file of partialFiles) {
            if (file.endsWith('.hbs')) {
                const partialName = path.basename(file, '.hbs');
                const partialPath = path.join(partialsDir, file);
                const partialSource = fs.readFileSync(partialPath, 'utf-8');
                Handlebars.registerPartial(partialName, partialSource);
            }
        }
    }

    private registerI18nHelper(): void {
        // Store reference to i18n service for use in helper
        const i18n = this.i18n;

        // Register the 't' helper for translations
        // Usage in templates: {{t 'emails.key' arg1=value1 arg2=value2}}
        Handlebars.registerHelper(
            't',
            function (
                this: Record<string, unknown>,
                key: string,
                options: Handlebars.HelperOptions
            ) {
                const lang = this._lang as string;
                const args = options.hash || {};

                return i18n.t(key, { lang, args });
            }
        );
    }

    private renderTemplate(
        template: EmailTemplate,
        context: Record<string, unknown>,
        language: string
    ): string {
        const contentTemplate = this.templates.get(template);

        if (!contentTemplate) {
            throw new Error(`Template "${template}" not found`);
        }

        // Add language to context for the 't' helper
        const contextWithLang = {
            ...context,
            _lang: language,
        };

        // Render the content template first
        const body = contentTemplate(contextWithLang);

        // Wrap the content in the base layout with common context
        return this.baseTemplate({
            ...contextWithLang,
            body,
            year: new Date().getFullYear(),
        });
    }
}
