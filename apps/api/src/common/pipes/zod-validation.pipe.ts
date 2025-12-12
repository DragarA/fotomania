import {
    PipeTransform,
    BadRequestException,
    Injectable,
    Optional,
} from '@nestjs/common';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { ZodType, ZodError } from 'zod';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
    constructor(
        private schema: ZodType,
        @Optional() private i18nService?: I18nService
    ) {}

    transform(value: unknown) {
        try {
            const parsedValue = this.schema.parse(value);
            return parsedValue;
        } catch (error) {
            if (error instanceof ZodError) {
                const i18n = this.i18nService ? I18nContext.current() : null;

                const errorMessages = error.issues.map((issue) => {
                    const path = issue.path.join('.');
                    const message = issue.message;
                    return path ? `${path}: ${message}` : message;
                });

                const validationFailedMessage = i18n
                    ? i18n.t('validation.failed')
                    : 'Validation failed';

                throw new BadRequestException({
                    message: validationFailedMessage,
                    errors: errorMessages,
                    details: error.issues,
                });
            }
            throw new BadRequestException('Validation failed');
        }
    }
}
