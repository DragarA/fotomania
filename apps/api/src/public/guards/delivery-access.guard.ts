import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

import { PublicService } from '../public.service';

@Injectable()
export class DeliveryAccessGuard implements CanActivate {
    constructor(private readonly publicService: PublicService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<Request>();
        const deliverySlug = request.params.deliverySlug;

        if (!deliverySlug) {
            throw new UnauthorizedException('Missing delivery slug');
        }

        // Check if the parent catalogue is password protected
        const isProtected =
            await this.publicService.isDeliveryPasswordProtected(deliverySlug);

        if (!isProtected) {
            // Catalogue is not password protected, allow access
            return true;
        }

        // Catalogue is password protected, check for valid token
        const token = this.extractTokenFromHeader(request);

        if (!token) {
            throw new UnauthorizedException(
                'This delivery is password protected'
            );
        }

        const isValid = this.publicService.validateDeliveryAccessToken(
            token,
            deliverySlug
        );

        if (!isValid) {
            throw new UnauthorizedException('Invalid or expired access token');
        }

        return true;
    }

    private extractTokenFromHeader(request: Request): string | undefined {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
}
