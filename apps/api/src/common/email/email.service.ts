import * as fs from 'fs';
import * as path from 'path';

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import FormData from 'form-data';
import Handlebars from 'handlebars';
import Mailgun from 'mailgun.js';

import { EmailTemplate } from './email.constants';

export interface SendEmailOptions {
    to: string | string[];
    subject: string;
    template: EmailTemplate;
    context: Record<string, unknown>;
}

@Injectable()
export class EmailService implements OnModuleInit {
    private readonly logger = new Logger(EmailService.name);
    private mg: ReturnType<Mailgun['client']>;
    private templates: Map<string, Handlebars.TemplateDelegate> = new Map();
    private baseTemplate!: Handlebars.TemplateDelegate;

    private readonly domain: string;
    private readonly fromEmail: string;
    private readonly fromName: string;

    constructor(private readonly configService: ConfigService) {
        const mailgun = new Mailgun(FormData);
        this.mg = mailgun.client({
            username: 'api',
            key: this.configService.getOrThrow<string>('MAILGUN_API_KEY'),
        });

        this.domain = this.configService.getOrThrow<string>('MAILGUN_DOMAIN');
        this.fromEmail = this.configService.getOrThrow<string>('MAILGUN_FROM_EMAIL');
        this.fromName = this.configService.getOrThrow<string>('MAILGUN_FROM_NAME');
    }

    onModuleInit() {
        this.loadTemplates();
        this.registerPartials();
        this.logger.log('Email templates loaded and compiled');
    }

    async send(options: SendEmailOptions): Promise<void> {
        const html = this.renderTemplate(options.template, options.context);
        const to = Array.isArray(options.to) ? options.to : [options.to];

        try {
            const result = await this.mg.messages.create(this.domain, {
                from: `${this.fromName} <${this.fromEmail}>`,
                to,
                subject: options.subject,
                html,
            });

            this.logger.log(
                `Email sent successfully to ${to.join(', ')}: ${result.id}`
            );
        } catch (error) {
            this.logger.error(
                `Failed to send email to ${to.join(', ')}`,
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

    private renderTemplate(
        template: EmailTemplate,
        context: Record<string, unknown>
    ): string {
        const contentTemplate = this.templates.get(template);

        if (!contentTemplate) {
            throw new Error(`Template "${template}" not found`);
        }

        // Render the content template first
        const body = contentTemplate(context);

        // Wrap the content in the base layout with common context
        return this.baseTemplate({
            ...context,
            body,
            year: new Date().getFullYear(),
        });
    }
}

