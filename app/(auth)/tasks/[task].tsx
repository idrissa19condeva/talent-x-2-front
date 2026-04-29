import { useMemo, useState } from 'react';
import { Link, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useClerk } from '@clerk/clerk-expo';
import { ScreenContainer } from '@/components/ScreenContainer';
import { AuthHeader } from '@/components/AuthHeader';
import { Button } from '@/components/Button';
import { colors, spacing, typography } from '@/theme';

type TaskKey = 'choose-organization' | 'reset-password' | 'setup-mfa';

function getTaskContent(task: string) {
    switch (task as TaskKey) {
        case 'choose-organization':
            return {
                title: 'Action required',
                subtitle: 'Your account must choose an organization before continuing.',
                hint: 'Please complete organization setup in Clerk Dashboard or use a user without organization requirement.',
            };
        case 'reset-password':
            return {
                title: 'Reset password required',
                subtitle: 'Your account must reset its password before sign-in can complete.',
                hint: 'Use the forgot password flow below to continue.',
            };
        case 'setup-mfa':
            return {
                title: 'MFA setup required',
                subtitle: 'Your account must configure multi-factor authentication.',
                hint: 'Enable and complete MFA in your Clerk account settings, then sign in again.',
            };
        default:
            return {
                title: 'Additional verification required',
                subtitle: 'A session task must be completed before access is granted.',
                hint: 'Complete the required task, then retry sign in.',
            };
    }
}

export default function PendingTaskScreen() {
    const { task } = useLocalSearchParams<{ task?: string }>();
    const clerk = useClerk();
    const [loading, setLoading] = useState(false);

    const content = useMemo(() => getTaskContent(task ?? ''), [task]);

    async function onSignOut() {
        setLoading(true);
        try {
            await clerk.signOut();
        } finally {
            setLoading(false);
        }
    }

    return (
        <ScreenContainer>
            <AuthHeader title={content.title} subtitle={content.subtitle} />

            <View style={styles.card}>
                <Text style={[typography.body, styles.hint]}>{content.hint}</Text>
            </View>

            {task === 'reset-password' ? (
                <Link href="/(auth)/forgot-password" asChild>
                    <Pressable accessibilityRole="button" style={styles.linkBtn}>
                        <Text style={[typography.bodyStrong, styles.linkText]}>Go to forgot password</Text>
                    </Pressable>
                </Link>
            ) : null}

            <Button
                label="Sign out and return"
                variant="secondary"
                onPress={onSignOut}
                loading={loading}
                testID="pending-task-sign-out"
            />

            <Link href="/(auth)/sign-in" asChild>
                <Pressable accessibilityRole="button" style={styles.linkBtn}>
                    <Text style={[typography.bodyStrong, styles.linkText]}>Back to sign in</Text>
                </Pressable>
            </Link>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    card: {
        padding: spacing.lg,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 12,
        marginBottom: spacing.lg,
    },
    hint: {
        color: colors.text,
    },
    linkBtn: {
        alignSelf: 'center',
        paddingVertical: spacing.sm,
        marginBottom: spacing.sm,
    },
    linkText: {
        color: colors.primary,
    },
});
