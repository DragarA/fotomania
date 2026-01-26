import {
    createContext,
    ReactNode,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react';

const ONBOARDING_STORAGE_KEY = 'fotomania_onboarding';

const onboardingSteps = [
    'welcome',
    'create-catalogue',
    'explain-ui',
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
}

export interface OnboardingContextType extends OnboardingState {
    startOnboarding: () => void;
    nextStep: () => void;
    skipOnboarding: () => void;
    resetOnboarding: () => void;
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
    const [state, setState] = useState<OnboardingState>(defaultState);

    useEffect(() => {
        const stored = localStorage.getItem(ONBOARDING_STORAGE_KEY);
        if (!stored) {
            return;
        }

        try {
            const parsed = JSON.parse(stored) as Partial<OnboardingState>;
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
            });
        } catch (error) {
            console.error('Failed to parse onboarding state', error);
        }
    }, []);

    useEffect(() => {
        localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(state));
    }, [state]);

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
    }, []);

    const value = useMemo(
        () => ({
            ...state,
            startOnboarding,
            nextStep,
            skipOnboarding,
            resetOnboarding,
        }),
        [state, nextStep, resetOnboarding, skipOnboarding, startOnboarding]
    );

    return (
        <OnboardingContext.Provider value={value}>
            {children}
        </OnboardingContext.Provider>
    );
}
