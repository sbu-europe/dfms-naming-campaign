---
title: Mobile Platform Guidelines (Flutter)
category: design-system
section: platforms
status: approved
created: 2026-02-23
---

# Mobile Platform Guidelines

> Guidelines for DFMS Flutter mobile apps: Driver app, QC app, and Vendor app.

---

## Platform Targets

| App | Users | Platforms |
|-----|-------|-----------|
| Driver App | Drivers, Helpers | Android (primary), iOS |
| QC App | QC Supervisors, Lab technicians | Android (primary), iOS |
| Vendor App | Vendor staff, dispatchers | Android (primary), iOS |

**Minimum SDK**: Android 8.0 (API 26), iOS 14.

---

## Flutter Theme Setup

All apps share the same `AppTheme` — defined in `lib/core/theme/`:

```
lib/core/theme/
  app_colors.dart        # Color constants
  app_text_styles.dart   # TextStyle definitions
  app_spacing.dart       # Spacing constants
  app_theme.dart         # ThemeData configuration
```

### `app_theme.dart`

```dart
import 'package:flutter/material.dart';
import 'app_colors.dart';
import 'app_text_styles.dart';

class AppTheme {
  static ThemeData get light => ThemeData(
    useMaterial3: true,
    colorScheme: ColorScheme.fromSeed(
      seedColor: AppColors.primary,
      primary: AppColors.primary,
      secondary: AppColors.accent,
      error: AppColors.danger,
      surface: AppColors.white,
      background: AppColors.grey100,
    ),
    fontFamily: 'Inter',
    appBarTheme: const AppBarTheme(
      backgroundColor: AppColors.white,
      foregroundColor: AppColors.grey900,
      elevation: 0,
      shadowColor: Colors.transparent,
      surfaceTintColor: Colors.transparent,
      titleTextStyle: AppTextStyles.h3,
      centerTitle: false,
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: AppColors.primary,
        foregroundColor: AppColors.white,
        minimumSize: const Size.fromHeight(48),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
        textStyle: AppTextStyles.label,
      ),
    ),
    outlinedButtonTheme: OutlinedButtonThemeData(
      style: OutlinedButton.styleFrom(
        foregroundColor: AppColors.primary,
        side: const BorderSide(color: AppColors.primary, width: 1.5),
        minimumSize: const Size.fromHeight(48),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
        textStyle: AppTextStyles.label,
      ),
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: AppColors.white,
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(4),
        borderSide: const BorderSide(color: AppColors.grey300),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(4),
        borderSide: const BorderSide(color: AppColors.grey300),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(4),
        borderSide: const BorderSide(color: AppColors.primary, width: 2),
      ),
      errorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(4),
        borderSide: const BorderSide(color: AppColors.danger),
      ),
      labelStyle: AppTextStyles.label,
      hintStyle: AppTextStyles.bodySm.copyWith(color: AppColors.grey400),
      errorStyle: AppTextStyles.caption.copyWith(color: AppColors.danger),
    ),
    cardTheme: CardTheme(
      color: AppColors.white,
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(8),
        side: const BorderSide(color: AppColors.grey200),
      ),
      margin: const EdgeInsets.only(bottom: 12),
    ),
    dividerTheme: const DividerThemeData(
      color: AppColors.grey200,
      thickness: 1,
    ),
    scaffoldBackgroundColor: AppColors.grey100,
  );
}
```

---

## Mobile Layout Conventions

### Navigation

- **Bottom navigation bar**: max 5 tabs, icons + labels
- **App bar**: back button (auto), title left-aligned, actions right (max 2 icons)
- **Drawer**: not used — bottom nav preferred for discoverability
- **Floating action button**: single primary action per screen only

### Screen Structure

```
+--[AppBar: back | title | actions]--+
|                                     |
|  [Content: scrollable]              |
|  Padding: 16px sides                |
|                                     |
+--[Bottom NavBar]--------------------+
```

### List Items

```
+--[Leading icon/avatar]--[Title (14px semibold)]--[Trailing icon/badge]--+
|                         [Subtitle (12px grey-500)]                       |
+--------------------------------------------------------------------------+
Height: 64px (default), 56px (compact), 80px (with two-line subtitle)
Divider: 1px grey-200, inset 16px from left
```

---

## Mobile Touch Targets

- Minimum touch target: **48x48px** (Material 3 / WCAG guideline)
- Buttons: always full-width inside forms (`.fromHeight(48)`)
- Action buttons inside list items: 40x40px minimum
- Spacing between adjacent touch targets: minimum 8px

---

## Offline Support

Driver and QC apps must function in low/no connectivity:

| Data | Cache Strategy | Sync On Reconnect |
|------|---------------|-------------------|
| Active trip details | Cache for 24h | Push local changes |
| QC checklist forms | Cache indefinitely (until new version) | Pull updates |
| Vehicle/driver info | Cache on last load | Background refresh |
| GPS coordinates | Queue locally | Flush on reconnect |
| Photo/document uploads | Queue in local DB | Upload in background |

Use `Hive` for local storage, background sync via `WorkManager`.

---

## Push Notifications

Firebase Cloud Messaging (FCM) for all apps.

| Event | App | Notification |
|-------|-----|-------------|
| New TO assigned | Driver | "New trip assigned: TO-2026-0234" |
| Departure gate open | Driver | "You're cleared to depart from Depot A" |
| Vendor bid won | Vendor | "Your bid for TO-2026-0234 was accepted" |
| QC sample ready | QC | "Sample #SMP-0892 ready for inspection" |
| Gate queue position | Driver | "You are next in queue at Gate 2" |

Notification tap opens the relevant screen directly (deep link).

---

## Camera & File Handling

Used for: POD photo, QC sample photo, document upload, QR scan.

- **Camera**: `image_picker` package, compress to JPEG 80% quality, max 1200px
- **QR/Barcode scan**: `mobile_scanner` package
- **Document upload**: `file_picker` for PDF/image selection
- **Preview before upload**: mandatory — show thumbnail with "Retake" option
- **Offline queue**: if no connectivity, store locally and upload on reconnect

---

## Loading & Error States

| State | Widget |
|-------|--------|
| Full page loading | Centered `CircularProgressIndicator` with color `AppColors.primary` |
| List loading | Shimmer skeleton using `shimmer` package |
| Inline loading | `CircularProgressIndicator.adaptive()` 16px inside button |
| Empty state | Centered icon + text + optional CTA button |
| Network error | `SnackBar` with "No connection. Changes will sync when online." |
| Server error | Inline error card with retry button |
