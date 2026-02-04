import {
    createContext,
    ReactNode,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react';

import { useAuth } from '@/features/auth/hooks';

const ONBOARDING_STORAGE_KEY = 'fotomania_onboarding';

const onboardingSteps = [
    'welcome',
    'create-catalogue',
    'explain-ui',
    'catalogue-status',
    'create-collection',
    'upload-photos',
    'favourites-delivery',
] as const;

export type OnboardingStep = (typeof onboardingSteps)[number];

type CompletedSteps = Record<OnboardingStep, boolean>;

interface OnboardingState {
    currentStep: OnboardingStep;
    completedSteps: CompletedSteps;
    isActive: boolean;
    isCompleted: boolean;
    userId?: string;
}

export interface OnboardingContextType extends OnboardingState {
    /** Whether this is a first-time user who should see onboarding */
    shouldShowWelcome: boolean;
    startOnboarding: () => void;
    nextStep: () => void;
    skipOnboarding: () => void;
    resetOnboarding: () => void;
    /** Call when welcome modal is completed to start the spotlight flow */
    completeWelcome: () => void;
}

const buildCompletedSteps = (override?: Partial<CompletedSteps>): CompletedSteps =>
    onboardingSteps.reduce((acc, step) => {
        acc[step] = Boolean(override?.[step]);
        return acc;
    }, {} as CompletedSteps);

const defaultState: OnboardingState = {
    currentStep: 'welcome',
    completedSteps: buildCompletedSteps(),
    isActive: false,
    isCompleted: false,
};

export const OnboardingContext = createContext<
    OnboardingContextType | undefined
>(undefined);

export function OnboardingProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const [state, setState] = useState<OnboardingState>(defaultState);
    const [_isFirstTime, setIsFirstTime] = useState<boolean>(false);
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        if (!user?.id) {
            setState(defaultState);
            setIsFirstTime(false);
            setIsInitialized(true);
            return;
        }

        const stored = localStorage.getItem(ONBOARDING_STORAGE_KEY);

        if (!stored) {
            setState({ ...defaultState, userId: user.id });
            setIsFirstTime(true);
            setIsInitialized(true);
            return;
        }

        try {
            const parsed = JSON.parse(stored) as Partial<OnboardingState>;
            if (parsed.userId && parsed.userId !== user.id) {
                setState({ ...defaultState, userId: user.id });
                setIsFirstTime(true);
                setIsInitialized(true);
                return;
            }
            const currentStep = onboardingSteps.includes(
                parsed.currentStep as OnboardingStep
            )
                ? (parsed.currentStep as OnboardingStep)
                : defaultState.currentStep;

            setState({
                currentStep,
                completedSteps: buildCompletedSteps(parsed.completedSteps),
                isActive: Boolean(parsed.isActive),
                isCompleted: Boolean(parsed.isCompleted),
                userId: user.id,
            });
            setIsFirstTime(false);
        } catch (error) {
            console.error('Failed to parse onboarding state', error);
            setState({ ...defaultState, userId: user.id });
            setIsFirstTime(true);
        }
        setIsInitialized(true);
    }, [user?.id]);

    useEffect(() => {
        if (!user?.id) {
            return;
        }

        localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(state));
    }, [state, user?.id]);

    const startOnboarding = useCallback(() => {
        setState({
            ...defaultState,
            isActive: true,
        });
    }, []);

    const nextStep = useCallback(() => {
        setState((previous) => {
            if (!previous.isActive) {
                return previous;
            }

            const currentIndex = onboardingSteps.indexOf(previous.currentStep);
            if (currentIndex === -1) {
                return {
                    ...defaultState,
                    isActive: previous.isActive,
                };
            }
            const updatedCompleted = {
                ...previous.completedSteps,
                [previous.currentStep]: true,
            } as CompletedSteps;

            if (currentIndex === onboardingSteps.length - 1) {
                return {
                    ...previous,
                    completedSteps: updatedCompleted,
                    isActive: false,
                    isCompleted: true,
                };
            }

            const nextStep = onboardingSteps[currentIndex + 1];

            if (!nextStep) {
                return {
                    ...previous,
                    completedSteps: updatedCompleted,
                    isActive: false,
                    isCompleted: true,
                };
            }

            return {
                ...previous,
                currentStep: nextStep,
                completedSteps: updatedCompleted,
            };
        });
    }, []);

    const skipOnboarding = useCallback(() => {
        setState({
            ...defaultState,
            completedSteps: buildCompletedSteps(
                onboardingSteps.reduce((acc, step) => {
                    acc[step] = true;
                    return acc;
                }, {} as CompletedSteps)
            ),
            isActive: false,
            isCompleted: true,
        });
    }, []);

    const resetOnboarding = useCallback(() => {
        setState(defaultState);
        setIsFirstTime(true);
        localStorage.removeItem(ONBOARDING_STORAGE_KEY);
    }, []);

    const completeWelcome = useCallback(() => {
        setState((prev) => ({
            ...prev,
            currentStep: 'create-catalogue',
            completedSteps: {
                ...prev.completedSteps,
                welcome: true,
            },
            isActive: true,
        }));
        setIsFirstTime(false);
    }, []);

    // Should show welcome modal: user hasn't completed welcome and isn't mid-flow
    const shouldShowWelcome = useMemo(() => {
        if (!isInitialized) return false;
        return (
            Boolean(user?.id) &&
            !state.completedSteps.welcome &&
            !state.isCompleted &&
            !state.isActive
        );
    }, [isInitialized, state.completedSteps.welcome, state.isCompleted, state.isActive, user?.id]);

    const value = useMemo(
        () => ({
            ...state,
            shouldShowWelcome,
            startOnboarding,
            nextStep,
            skipOnboarding,
            resetOnboarding,
            completeWelcome,
        }),
        [state, shouldShowWelcome, nextStep, resetOnboarding, skipOnboarding, startOnboarding, completeWelcome]
    );

    return (
        <OnboardingContext.Provider value={value}>
            {children}
        </OnboardingContext.Provider>
    );
}
