declare module 'cypress-image-snapshot/command' {
  export function addMatchImageSnapshotCommand(
    options?: {
      customDiffConfig?: {
        threshold?: number;
        includeAA?: boolean;
      };
      failureThreshold?: number;
      failureThresholdType?: 'pixel' | 'percent';
      customSnapshotsDir?: string;
      customDiffDir?: string;
    }
  ): void;
}
