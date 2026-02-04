import { z } from 'zod';

export interface CollectionSettings {
    collectClientName: boolean;
    collectClientAddress: boolean;
    collectClientPhone: boolean;
    collectClientNotes: boolean;
}

export interface ValidationMessages {
    emailRequired: string;
    emailInvalid: string;
    nameRequired: string;
    streetRequired: string;
    cityRequired: string;
    postalCodeRequired: string;
    countryRequired: string;
    phoneRequired: string;
}

export function createSaveFavouritesSchema(
    settings: CollectionSettings,
    messages: ValidationMessages
) {
    return z.object({
        email: z
            .string()
            .min(1, messages.emailRequired)
            .email(messages.emailInvalid),
        // photoIds are passed directly as a prop, not from form input
        clientName: settings.collectClientName
            ? z.string().min(1, messages.nameRequired)
            : z.string().optional(),
        clientAddressStreet: settings.collectClientAddress
            ? z.string().min(1, messages.streetRequired)
            : z.string().optional(),
        clientAddressCity: settings.collectClientAddress
            ? z.string().min(1, messages.cityRequired)
            : z.string().optional(),
        clientAddressPostalCode: settings.collectClientAddress
            ? z.string().min(1, messages.postalCodeRequired)
            : z.string().optional(),
        clientAddressCountry: settings.collectClientAddress
            ? z.string().min(1, messages.countryRequired)
            : z.string().optional(),
        clientPhoneNumber: settings.collectClientPhone
            ? z.string().min(1, messages.phoneRequired)
            : z.string().optional(),
        // Notes are always optional, even when the field is shown
        clientNotes: z.string().optional(),
    });
}
