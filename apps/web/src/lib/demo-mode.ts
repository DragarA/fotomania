import type {
    CataloguePublicResDto,
    CollectionPhotoPublicResDto,
    DeliveryPublicResDto,
    PhotoResDto,
} from '@repo/sdk';

import type { Catalogue, Collection } from '../features/gallery/types';

export const IS_DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true';

const DEMO_STORAGE_KEY = 'fotomania-demo-state-v1';

interface DemoUser {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    image: string | null;
    businessName: string;
    businessAddress: string;
    businessPhone: string;
    businessEmail: string;
    businessWebsite: string;
    businessLogo: string | null;
    businessDescription: string;
    brandColorMain: string;
    brandColorAccent: string;
    preferredLanguage: string;
    collectClientName: boolean;
    collectClientAddress: boolean;
    collectClientPhone: boolean;
    collectClientNotes: boolean;
    createdAt: string;
    updatedAt: string;
}

interface DemoCollection extends Collection {
    catalogueId: string;
    type: 'proofing' | 'delivery';
}

interface DemoFavouriteSession {
    sessionId: string;
    catalogueId: string;
    email: string;
    createdAt: string;
    photoIds: string[];
    clientName?: string;
    clientAddressCity?: string;
    clientAddressCountry?: string;
    clientNotes?: string;
}

interface DemoState {
    user: DemoUser;
    catalogues: Catalogue[];
    collections: DemoCollection[];
    photos: PhotoResDto[];
    favourites: DemoFavouriteSession[];
}

function buildInitialState(): DemoState {
    const now = new Date().toISOString();
    const yesterday = new Date(Date.now() - 86400 * 1000).toISOString();
    const lastWeek = new Date(Date.now() - 7 * 86400 * 1000).toISOString();

    const user: DemoUser = {
        id: 'demo-photographer-1',
        name: 'Anže Dragar',
        email: 'studio@anzedragar.com',
        emailVerified: true,
        image: null,
        businessName: 'Anže Dragar Photography',
        businessAddress: 'Ljubljana, Slovenia',
        businessPhone: '+386 40 000 000',
        businessEmail: 'studio@anzedragar.com',
        businessWebsite: 'https://portfolio.anzedragar.com',
        businessLogo: null,
        businessDescription: 'Editorial travel, portrait, and night photography.',
        brandColorMain: '#292524',
        brandColorAccent: '#a8a29e',
        preferredLanguage: 'en',
        collectClientName: true,
        collectClientAddress: false,
        collectClientPhone: false,
        collectClientNotes: true,
        createdAt: lastWeek,
        updatedAt: now,
    };

    const catalogues: Catalogue[] = [
        {
            id: 'cat-tuscany',
            title: 'Tuscany & Budapest Editorial',
            description:
                'Golden hour hills over Val d’Orcia paired with long-exposure night frames along the Danube.',
            coverImage: 'demo/tuscany-balloon.jpg',
            password: null,
            publicUrlSlug: 'tuscany-golden-hour',
            ownerId: user.id,
            createdAt: yesterday,
            updatedAt: now,
            photoCount: 6,
            status: 'published',
            isProtected: false,
        },
        {
            id: 'cat-portraits',
            title: 'Spring Arboretum Portraits',
            description:
                'Outdoor natural-light portrait session in full bloom — Sony α7 III prime lenses.',
            coverImage: 'demo/aussie-golden-hour.jpg',
            password: null,
            publicUrlSlug: 'spring-arboretum',
            ownerId: user.id,
            createdAt: lastWeek,
            updatedAt: yesterday,
            photoCount: 3,
            status: 'published',
            isProtected: false,
        },
    ];

    const collections: DemoCollection[] = [
        {
            id: 'col-tuscany-morning',
            catalogueId: 'cat-tuscany',
            name: 'Morning Drift · Tuscany',
            type: 'proofing',
            photoCount: 3,
        },
        {
            id: 'col-budapest-night',
            catalogueId: 'cat-tuscany',
            name: 'Danube After Dark · Budapest',
            type: 'proofing',
            photoCount: 3,
        },
        {
            id: 'col-tuscany-delivery',
            catalogueId: 'cat-tuscany',
            name: 'Final Delivery · Elena Rossi',
            type: 'delivery',
            clientSessionId: 'sess-elena',
            deliverySlug: 'tuscany-delivery',
            clientEmail: 'elena.rossi@example.com',
            hasInvoice: true,
            photoCount: 3,
        },
        {
            id: 'col-portraits-main',
            catalogueId: 'cat-portraits',
            name: 'Golden Hour & Tulips',
            type: 'proofing',
            photoCount: 3,
        },
    ];

    const photos: PhotoResDto[] = [
        {
            id: 'ph-1',
            originalFileName: 'DSC04120_Tuscany_Balloon.jpg',
            storagePath: 'demo/tuscany-balloon.jpg',
            thumbnailPath: 'demo/tuscany-balloon.jpg',
            mimeType: 'image/jpeg',
            width: 1600,
            height: 1067,
            size: 368269,
            collectionId: 'col-tuscany-morning',
        },
        {
            id: 'ph-2',
            originalFileName: 'DSC04185_Golden_Watch.jpg',
            storagePath: 'demo/aussie-golden-hour.jpg',
            thumbnailPath: 'demo/aussie-golden-hour.jpg',
            mimeType: 'image/jpeg',
            width: 1600,
            height: 1067,
            size: 354761,
            collectionId: 'col-tuscany-morning',
        },
        {
            id: 'ph-3',
            originalFileName: 'DSC04210_Spring_Tulips.jpg',
            storagePath: 'demo/aussie-tulips.jpg',
            thumbnailPath: 'demo/aussie-tulips.jpg',
            mimeType: 'image/jpeg',
            width: 1600,
            height: 1067,
            size: 333905,
            collectionId: 'col-tuscany-morning',
        },
        {
            id: 'ph-4',
            originalFileName: 'DSC05012_Danube_Night.jpg',
            storagePath: 'demo/budapest-night.jpg',
            thumbnailPath: 'demo/budapest-night.jpg',
            mimeType: 'image/jpeg',
            width: 1600,
            height: 1067,
            size: 340551,
            collectionId: 'col-budapest-night',
        },
        {
            id: 'ph-5',
            originalFileName: 'DSC05044_Chain_Bridge.jpg',
            storagePath: 'demo/budapest-bridge-frame.jpg',
            thumbnailPath: 'demo/budapest-bridge-frame.jpg',
            mimeType: 'image/jpeg',
            width: 1600,
            height: 1067,
            size: 330151,
            collectionId: 'col-budapest-night',
        },
        {
            id: 'ph-6',
            originalFileName: 'DSC05091_Morning_Light.jpg',
            storagePath: 'demo/tuscany-balloon.jpg',
            thumbnailPath: 'demo/tuscany-balloon.jpg',
            mimeType: 'image/jpeg',
            width: 1600,
            height: 1067,
            size: 368269,
            collectionId: 'col-budapest-night',
        },
        // Delivery collection photos
        {
            id: 'ph-d1',
            originalFileName: 'Tuscany_Balloon_Print.jpg',
            storagePath: 'demo/tuscany-balloon.jpg',
            thumbnailPath: 'demo/tuscany-balloon.jpg',
            mimeType: 'image/jpeg',
            width: 1600,
            height: 1067,
            size: 368269,
            collectionId: 'col-tuscany-delivery',
        },
        {
            id: 'ph-d2',
            originalFileName: 'Danube_After_Dark_Print.jpg',
            storagePath: 'demo/budapest-night.jpg',
            thumbnailPath: 'demo/budapest-night.jpg',
            mimeType: 'image/jpeg',
            width: 1600,
            height: 1067,
            size: 340551,
            collectionId: 'col-tuscany-delivery',
        },
        {
            id: 'ph-d3',
            originalFileName: 'Chain_Bridge_Symmetry_Print.jpg',
            storagePath: 'demo/budapest-bridge-frame.jpg',
            thumbnailPath: 'demo/budapest-bridge-frame.jpg',
            mimeType: 'image/jpeg',
            width: 1600,
            height: 1067,
            size: 330151,
            collectionId: 'col-tuscany-delivery',
        },
        // Portraits catalogue
        {
            id: 'ph-p1',
            originalFileName: 'Arboretum_Golden_Hour.jpg',
            storagePath: 'demo/aussie-golden-hour.jpg',
            thumbnailPath: 'demo/aussie-golden-hour.jpg',
            mimeType: 'image/jpeg',
            width: 1600,
            height: 1067,
            size: 354761,
            collectionId: 'col-portraits-main',
        },
        {
            id: 'ph-p2',
            originalFileName: 'Arboretum_Tulips.jpg',
            storagePath: 'demo/aussie-tulips.jpg',
            thumbnailPath: 'demo/aussie-tulips.jpg',
            mimeType: 'image/jpeg',
            width: 1600,
            height: 1067,
            size: 333905,
            collectionId: 'col-portraits-main',
        },
        {
            id: 'ph-p3',
            originalFileName: 'Tuscany_Sunrise.jpg',
            storagePath: 'demo/tuscany-balloon.jpg',
            thumbnailPath: 'demo/tuscany-balloon.jpg',
            mimeType: 'image/jpeg',
            width: 1600,
            height: 1067,
            size: 368269,
            collectionId: 'col-portraits-main',
        },
    ];

    const favourites: DemoFavouriteSession[] = [
        {
            sessionId: 'sess-elena',
            catalogueId: 'cat-tuscany',
            email: 'elena.rossi@example.com',
            createdAt: yesterday,
            photoIds: ['ph-1', 'ph-4', 'ph-5'],
            clientName: 'Elena Rossi',
            clientAddressCity: 'Florence',
            clientAddressCountry: 'Italy',
            clientNotes: 'Love the warm light on the balloon shot and the Danube reflections!',
        },
    ];

    return { user, catalogues, collections, photos, favourites };
}

function loadState(): DemoState {
    const raw = sessionStorage.getItem(DEMO_STORAGE_KEY);
    if (raw) {
        try {
            return JSON.parse(raw) as DemoState;
        } catch {
            // reset
        }
    }
    const fresh = buildInitialState();
    sessionStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(fresh));
    return fresh;
}

function saveState(state: DemoState): void {
    sessionStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(state));
}

export function resetFotomaniaDemo(): void {
    sessionStorage.removeItem(DEMO_STORAGE_KEY);
    seedDemoAuthSession();
}

export function seedDemoAuthSession(): void {
    const state = loadState();
    localStorage.setItem('accessToken', 'demo-access-token');
    localStorage.setItem('refreshToken', 'demo-refresh-token');
    localStorage.setItem(
        'user',
        JSON.stringify({
            id: state.user.id,
            email: state.user.email,
            name: state.user.name,
            emailVerified: true,
        })
    );
    localStorage.setItem(
        'tokenExpiry',
        String(Date.now() + 30 * 24 * 60 * 60 * 1000)
    );
    // Mark onboarding completed so demo opens cleanly
    localStorage.setItem('fotomania_onboarding_completed', 'true');
}

function jsonResponse(data: unknown, status = 200): Response {
    return new Response(JSON.stringify(data), {
        status,
        headers: { 'Content-Type': 'application/json' },
    });
}

function parseBody(init?: RequestInit): Record<string, unknown> {
    if (!init?.body || typeof init.body !== 'string') return {};
    try {
        return JSON.parse(init.body) as Record<string, unknown>;
    } catch {
        return {};
    }
}

function toPublicPhoto(p: PhotoResDto): CollectionPhotoPublicResDto {
    const now = new Date().toISOString();
    return {
        id: p.id,
        originalFileName: p.originalFileName,
        storagePath: p.storagePath,
        thumbnailPath: (p.thumbnailPath ?? p.storagePath) as unknown as Record<string, unknown>,
        mimeType: p.mimeType,
        width: p.width as unknown as Record<string, unknown>,
        height: p.height as unknown as Record<string, unknown>,
        size: p.size as unknown as Record<string, unknown>,
        createdAt: now,
        updatedAt: now,
    };
}

function recalcCounts(state: DemoState) {
    for (const col of state.collections) {
        col.photoCount = state.photos.filter((p) => p.collectionId === col.id).length;
    }
    for (const cat of state.catalogues) {
        const colIds = new Set(
            state.collections
                .filter((c) => c.catalogueId === cat.id && c.type !== 'delivery')
                .map((c) => c.id)
        );
        cat.photoCount = state.photos.filter((p) => colIds.has(p.collectionId)).length;
    }
}

function handleDemoRequest(urlStr: string, init?: RequestInit): Response | null {
    const basePrefix = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
    const url = new URL(urlStr, window.location.origin);
    let path = url.pathname;
    if (basePrefix && path.startsWith(basePrefix)) {
        path = path.slice(basePrefix.length) || '/';
    }

    // Let static assets (images, JS, CSS) pass through to normal fetch
    if (
        path.startsWith('/uploads/') ||
        path.startsWith('/assets/') ||
        path.startsWith('/locales/')
    ) {
        return null;
    }

    const method = (init?.method ?? 'GET').toUpperCase();
    const state = loadState();
    recalcCounts(state);

    // Auth endpoints
    if (path === '/auth/login' || path === '/auth/register' || path === '/auth/refresh') {
        seedDemoAuthSession();
        return jsonResponse({
            message: 'Demo authenticated',
            accessToken: 'demo-access-token',
            refreshToken: 'demo-refresh-token',
            user: {
                id: state.user.id,
                email: state.user.email,
                name: state.user.name,
                emailVerified: true,
            },
        });
    }
    if (path === '/auth/logout') {
        return jsonResponse({ message: 'Logged out' });
    }
    if (path === '/auth/me' || path === '/users/me') {
        if (method === 'PATCH') {
            const body = parseBody(init);
            state.user = { ...state.user, ...body, updatedAt: new Date().toISOString() };
            saveState(state);
        }
        return jsonResponse(state.user);
    }

    // Catalogues
    if (path === '/catalogues') {
        if (method === 'GET') return jsonResponse(state.catalogues);
        if (method === 'POST') {
            const body = parseBody(init);
            const id = `cat-${Date.now()}`;
            const slug = String(body.title ?? 'gallery')
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '') + '-' + String(Date.now()).slice(-4);
            const created: Catalogue = {
                id,
                title: String(body.title ?? 'Untitled Gallery'),
                description: body.description ? String(body.description) : null,
                coverImage: 'demo/tuscany-balloon.jpg',
                password: null,
                publicUrlSlug: slug,
                ownerId: state.user.id,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                photoCount: 0,
                status: 'draft',
                isProtected: false,
            };
            state.catalogues.unshift(created);
            state.collections.push({
                id: `col-${Date.now()}`,
                catalogueId: id,
                name: 'Highlights',
                type: 'proofing',
                photoCount: 0,
            });
            saveState(state);
            return jsonResponse(created, 201);
        }
    }

    const catCoverMatch = path.match(/^\/catalogues\/([^/]+)\/cover\/([^/]+)$/);
    if (catCoverMatch && method === 'PATCH') {
        const [, catId, photoId] = catCoverMatch;
        const cat = state.catalogues.find((c) => c.id === catId);
        const photo = state.photos.find((p) => p.id === photoId);
        if (cat && photo) {
            cat.coverImage = photo.storagePath;
            cat.updatedAt = new Date().toISOString();
            saveState(state);
            return jsonResponse(cat);
        }
        return jsonResponse({ message: 'Not found' }, 404);
    }

    const catStatusMatch = path.match(/^\/catalogues\/([^/]+)\/status$/);
    if (catStatusMatch && method === 'PATCH') {
        const cat = state.catalogues.find((c) => c.id === catStatusMatch[1]);
        if (!cat) return jsonResponse({ message: 'Not found' }, 404);
        const body = parseBody(init);
        if (body.status === 'published' || body.status === 'draft') {
            cat.status = body.status;
        }
        saveState(state);
        return jsonResponse(cat);
    }

    const catFavsMatch = path.match(/^\/catalogues\/([^/]+)\/favourites$/);
    if (catFavsMatch && method === 'GET') {
        const sessions = state.favourites
            .filter((f) => f.catalogueId === catFavsMatch[1])
            .map((f) => ({
                sessionId: f.sessionId,
                email: f.email,
                createdAt: f.createdAt,
                photoCount: f.photoIds.length,
                clientName: f.clientName,
                clientAddressCity: f.clientAddressCity,
                clientAddressCountry: f.clientAddressCountry,
                clientNotes: f.clientNotes,
            }));
        return jsonResponse(sessions);
    }

    const catIdMatch = path.match(/^\/catalogues\/([^/]+)$/);
    if (catIdMatch) {
        const id = catIdMatch[1];
        const cat = state.catalogues.find((c) => c.id === id);
        if (!cat) return jsonResponse({ message: 'Not found' }, 404);
        if (method === 'GET') return jsonResponse(cat);
        if (method === 'PATCH') {
            const body = parseBody(init);
            if (body.title !== undefined) cat.title = String(body.title);
            if (body.description !== undefined) cat.description = body.description ? String(body.description) : null;
            cat.updatedAt = new Date().toISOString();
            saveState(state);
            return jsonResponse(cat);
        }
        if (method === 'DELETE') {
            state.catalogues = state.catalogues.filter((c) => c.id !== id);
            saveState(state);
            return jsonResponse({ message: 'Deleted' });
        }
    }

    // Client sessions favourites detail
    const sessFavMatch = path.match(/^\/client-sessions\/([^/]+)\/favourites\/([^/]+)$/);
    if (sessFavMatch && method === 'GET') {
        const [, catId, sessId] = sessFavMatch;
        const sess = state.favourites.find((f) => f.catalogueId === catId && f.sessionId === sessId);
        if (!sess) return jsonResponse({ message: 'Not found' }, 404);
        const sessPhotos = state.photos.filter((p) => sess.photoIds.includes(p.id));
        return jsonResponse({
            sessionId: sess.sessionId,
            email: sess.email,
            createdAt: sess.createdAt,
            photos: sessPhotos,
            clientName: sess.clientName ?? null,
            clientAddressCity: sess.clientAddressCity ?? null,
            clientAddressCountry: sess.clientAddressCountry ?? null,
            clientNotes: sess.clientNotes ?? null,
        });
    }

    // Collections
    if (path === '/collections') {
        if (method === 'GET') {
            const catId = url.searchParams.get('catalogueId');
            const list = catId
                ? state.collections.filter((c) => c.catalogueId === catId)
                : state.collections;
            return jsonResponse(list);
        }
        if (method === 'POST') {
            const body = parseBody(init);
            const created: DemoCollection = {
                id: `col-${Date.now()}`,
                catalogueId: String(body.catalogueId ?? ''),
                name: String(body.name ?? 'New Collection'),
                type: 'proofing',
                photoCount: 0,
            };
            state.collections.push(created);
            saveState(state);
            return jsonResponse(created, 201);
        }
    }

    const fromSessMatch = path.match(/^\/collections\/from-session\/([^/]+)$/);
    if (fromSessMatch && method === 'POST') {
        const sess = state.favourites.find((f) => f.sessionId === fromSessMatch[1]);
        if (!sess) return jsonResponse({ message: 'Session not found' }, 404);
        const existing = state.collections.find((c) => c.clientSessionId === sess.sessionId);
        if (existing) return jsonResponse(existing);
        const newColId = `col-del-${Date.now()}`;
        const slug = `delivery-${String(Date.now()).slice(-5)}`;
        const created: DemoCollection = {
            id: newColId,
            catalogueId: sess.catalogueId,
            name: `Delivery · ${sess.clientName || sess.email}`,
            type: 'delivery',
            clientSessionId: sess.sessionId,
            deliverySlug: slug,
            clientEmail: sess.email,
            hasInvoice: false,
            photoCount: sess.photoIds.length,
        };
        state.collections.push(created);
        for (const pid of sess.photoIds) {
            const orig = state.photos.find((p) => p.id === pid);
            if (orig) {
                state.photos.push({ ...orig, id: `ph-d-${Date.now()}-${pid}`, collectionId: newColId });
            }
        }
        saveState(state);
        return jsonResponse(created, 201);
    }

    const sendEmailMatch = path.match(/^\/collections\/([^/]+)\/send-delivery-email$/);
    if (sendEmailMatch && method === 'POST') {
        return jsonResponse({ message: 'Demo delivery email simulated' });
    }

    const colIdMatch = path.match(/^\/collections\/([^/]+)$/);
    if (colIdMatch) {
        const id = colIdMatch[1];
        const col = state.collections.find((c) => c.id === id);
        if (!col) return jsonResponse({ message: 'Not found' }, 404);
        if (method === 'GET') return jsonResponse(col);
        if (method === 'PATCH') {
            const body = parseBody(init);
            if (body.name !== undefined) col.name = String(body.name);
            saveState(state);
            return jsonResponse(col);
        }
        if (method === 'DELETE') {
            state.collections = state.collections.filter((c) => c.id !== id);
            state.photos = state.photos.filter((p) => p.collectionId !== id);
            saveState(state);
            return jsonResponse({ message: 'Deleted' });
        }
    }

    // Photos
    if (path === '/photos' && method === 'GET') {
        const colId = url.searchParams.get('collectionId');
        const list = colId ? state.photos.filter((p) => p.collectionId === colId) : state.photos;
        return jsonResponse(list);
    }
    const photoIdMatch = path.match(/^\/photos\/([^/]+)$/);
    if (photoIdMatch) {
        const id = photoIdMatch[1];
        if (method === 'DELETE') {
            state.photos = state.photos.filter((p) => p.id !== id);
            saveState(state);
            return jsonResponse({ message: 'Deleted' });
        }
        const photo = state.photos.find((p) => p.id === id);
        if (photo) return jsonResponse(photo);
    }

    // Public catalogue
    const pubPhotosMatch = path.match(/^\/public\/catalogue\/([^/]+)\/collection\/([^/]+)\/photos$/);
    if (pubPhotosMatch && method === 'GET') {
        const [, , colId] = pubPhotosMatch;
        const list = state.photos.filter((p) => p.collectionId === colId).map(toPublicPhoto);
        return jsonResponse(list);
    }

    const pubFavsMatch = path.match(/^\/public\/catalogue\/([^/]+)\/favourites$/);
    if (pubFavsMatch && method === 'POST') {
        const slug = pubFavsMatch[1];
        const cat = state.catalogues.find((c) => c.publicUrlSlug === slug);
        const body = parseBody(init);
        const email = String(body.email ?? 'client@example.com');
        const photoIds = Array.isArray(body.photoIds) ? (body.photoIds as string[]) : [];
        if (cat) {
            state.favourites.unshift({
                sessionId: `sess-${Date.now()}`,
                catalogueId: cat.id,
                email,
                createdAt: new Date().toISOString(),
                photoIds,
                clientName: body.clientName ? String(body.clientName) : undefined,
                clientNotes: body.clientNotes ? String(body.clientNotes) : undefined,
            });
            saveState(state);
        }
        return jsonResponse({ success: true, clientSessionEmail: email }, 201);
    }

    const pubCatMatch = path.match(/^\/public\/catalogue\/([^/]+)$/);
    if (pubCatMatch && method === 'GET') {
        const slug = pubCatMatch[1];
        const cat = state.catalogues.find((c) => c.publicUrlSlug === slug) ?? state.catalogues[0];
        if (!cat) return jsonResponse({ message: 'Not found' }, 404);
        const cols = state.collections
            .filter((c) => c.catalogueId === cat.id && c.type !== 'delivery')
            .map((c) => ({
                id: c.id,
                name: c.name,
                photoCount: state.photos.filter((p) => p.collectionId === c.id).length,
            }));
        const resDto: CataloguePublicResDto = {
            id: cat.id,
            title: cat.title,
            description: (cat.description ?? undefined) as unknown as Record<string, unknown>,
            coverImage: (cat.coverImage ?? undefined) as unknown as Record<string, unknown>,
            publicUrlSlug: cat.publicUrlSlug,
            createdAt: cat.createdAt,
            updatedAt: cat.updatedAt,
            collections: cols,
            collectClientName: state.user.collectClientName,
            collectClientAddress: state.user.collectClientAddress,
            collectClientPhone: state.user.collectClientPhone,
            collectClientNotes: state.user.collectClientNotes,
            photographerBusinessName: state.user.businessName as unknown as Record<string, unknown>,
            photographerBusinessWebsite: state.user.businessWebsite as unknown as Record<string, unknown>,
            photographerLogo: null,
            photographerBrandColorMain: state.user.brandColorMain as unknown as Record<string, unknown>,
            photographerBrandColorAccent: state.user.brandColorAccent as unknown as Record<string, unknown>,
        };
        return jsonResponse(resDto);
    }

    // Public delivery
    const pubDelPhotosMatch = path.match(/^\/public\/delivery\/([^/]+)\/photos$/);
    if (pubDelPhotosMatch && method === 'GET') {
        const slug = pubDelPhotosMatch[1];
        const col =
            state.collections.find((c) => c.deliverySlug === slug) ??
            state.collections.find((c) => c.type === 'delivery');
        if (!col) return jsonResponse([]);
        const list = state.photos.filter((p) => p.collectionId === col.id).map(toPublicPhoto);
        return jsonResponse(list);
    }

    const pubDelMatch = path.match(/^\/public\/delivery\/([^/]+)$/);
    if (pubDelMatch && method === 'GET') {
        const slug = pubDelMatch[1];
        const col =
            state.collections.find((c) => c.deliverySlug === slug) ??
            state.collections.find((c) => c.type === 'delivery');
        if (!col) return jsonResponse({ message: 'Not found' }, 404);
        const cat = state.catalogues.find((c) => c.id === col.catalogueId);
        const dto: DeliveryPublicResDto = {
            id: col.id,
            name: col.name,
            clientEmail: (col.clientEmail ?? undefined) as unknown as Record<string, unknown>,
            catalogueTitle: cat?.title ?? 'Tuscany & Budapest Editorial',
            deliverySlug: col.deliverySlug ?? slug,
            photoCount: state.photos.filter((p) => p.collectionId === col.id).length,
            hasInvoice: Boolean(col.hasInvoice),
            photographerBusinessName: state.user.businessName as unknown as Record<string, unknown>,
            photographerBusinessWebsite: state.user.businessWebsite as unknown as Record<string, unknown>,
            photographerLogo: null,
            photographerBrandColorMain: state.user.brandColorMain as unknown as Record<string, unknown>,
            photographerBrandColorAccent: state.user.brandColorAccent as unknown as Record<string, unknown>,
        };
        return jsonResponse(dto);
    }

    return null;
}

let installed = false;

export function installFotomaniaDemoMode(): void {
    if (!IS_DEMO_MODE || typeof window === 'undefined' || installed) return;
    installed = true;

    seedDemoAuthSession();

    const originalFetch = window.fetch.bind(window);
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
        const urlStr =
            typeof input === 'string'
                ? input
                : input instanceof URL
                  ? input.toString()
                  : input.url;
        const mocked = handleDemoRequest(urlStr, init);
        if (mocked) {
            return mocked;
        }
        return originalFetch(input, init);
    };
}
