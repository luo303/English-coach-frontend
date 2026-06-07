import { Alert, Button, Card, Chip, Skeleton, Surface, Typography } from 'heroui-native';
import { ReactNode } from 'react';
import { View } from 'react-native';

import { AppPalette } from '@/constants/appPalette';

type ScreenProps = {
  children: ReactNode;
  bottomInset?: number;
};

type HeaderProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  action?: string;
  onActionPress?: () => void;
};

type MetricProps = {
  label: string;
  value: string;
};

type StateProps = {
  title: string;
  description?: string;
};

export function Screen({ children, bottomInset = 112 }: ScreenProps) {
  return (
    <View
      className="flex-1 bg-background"
      style={{ backgroundColor: AppPalette.background, flex: 1, paddingBottom: bottomInset }}
    >
      {children}
    </View>
  );
}

export function ScreenHeader({ action, eyebrow, onActionPress, subtitle, title }: HeaderProps) {
  return (
    <View className="mb-6 flex-row items-start justify-between gap-4">
      <View className="flex-1">
        {eyebrow ? (
          <Chip className="mb-3 self-start" color="accent" size="sm" variant="soft">
            {eyebrow}
          </Chip>
        ) : null}
        <Typography.Heading
          className="text-4xl font-black leading-[40px] text-foreground"
          style={{ color: AppPalette.foreground, fontSize: 33, fontWeight: '900', lineHeight: 40 }}
        >
          {title}
        </Typography.Heading>
        {subtitle ? (
          <Typography className="mt-3 text-base leading-6 text-muted" style={{ color: AppPalette.muted }}>
            {subtitle}
          </Typography>
        ) : null}
      </View>
      {action ? (
        <Button onPress={onActionPress} size="sm" variant="secondary">
          {action}
        </Button>
      ) : null}
    </View>
  );
}

export function ElevatedCard({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <Card
      className={`border border-border bg-surface p-5 ${className}`}
      style={{ backgroundColor: AppPalette.surface, borderColor: AppPalette.border, borderRadius: 18 }}
    >
      {children}
    </Card>
  );
}

export function MetricCard({ label, value }: MetricProps) {
  return (
    <Surface
      className="w-[48%] border border-border bg-surface p-4"
      style={{ backgroundColor: AppPalette.surface, borderColor: AppPalette.border, borderRadius: 18 }}
    >
      <Typography className="mb-2 text-sm font-semibold text-muted" style={{ color: AppPalette.muted }}>
        {label}
      </Typography>
      <Typography className="text-2xl font-black text-foreground" style={{ color: AppPalette.foreground }}>
        {value}
      </Typography>
    </Surface>
  );
}

export function EmptyState({ description, title }: StateProps) {
  return (
    <Alert status="default" className="mb-4">
      <Alert.Indicator />
      <Alert.Content>
        <Alert.Title>{title}</Alert.Title>
        {description ? <Alert.Description>{description}</Alert.Description> : null}
      </Alert.Content>
    </Alert>
  );
}

export function CardSkeletons() {
  return (
    <View className="gap-3">
      <Skeleton className="h-28 w-full rounded-2xl" />
      <Skeleton className="h-28 w-full rounded-2xl" />
    </View>
  );
}
