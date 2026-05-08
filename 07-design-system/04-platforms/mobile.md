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
  app_colors.dart        # Color constants (light + dark)
  app_text_styles.dart   # TextStyle definitions
  app_spacing.dart       # Spacing constants
  app_theme.dart         # ThemeData — light and dark
```

### Design Influence: Material 3 (Structural)

DFMS Flutter apps use Material 3 (`useMaterial3: true`) as the **structural foundation** — component APIs, touch targets (48×48px minimum), and `ThemeData` token slots. We do **not** use M3's visual language:

- **No** `ColorScheme.fromSeed()` — it auto-generates tonal variants that override brand colors. Always use an **explicit** `ColorScheme` so `#122056` and `#5B65DC` are preserved exactly.
- **No** tonal surface fills on cards, dialogs, or nav bars — use `surfaceTintColor: Colors.transparent`.
- **No** M3 expressive shapes (stadium buttons, mega-rounded cards) — border radius follows design tokens (`radius-md` = 8px for most components).

### `app_theme.dart`

```dart
import 'package:flutter/material.dart';
import 'app_colors.dart';
import 'app_text_styles.dart';

class AppTheme {
  // ── Shared component styles ───────────────────────────────────
  static ElevatedButtonThemeData _elevatedButton(Color bg, Color fg) =>
      ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: bg,
          foregroundColor: fg,
          minimumSize: const Size.fromHeight(48),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
          elevation: 0,
          textStyle: AppTextStyles.label,
        ),
      );

  static OutlinedButtonThemeData _outlinedButton(Color fg) =>
      OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: fg,
          side: BorderSide(color: fg, width: 1.5),
          minimumSize: const Size.fromHeight(48),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
          textStyle: AppTextStyles.label,
        ),
      );

  static InputDecorationTheme _inputDecoration({
    required Color fill,
    required Color border,
    required Color focusBorder,
    required Color hint,
  }) =>
      InputDecorationTheme(
        filled: true,
        fillColor: fill,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: BorderSide(color: border),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: BorderSide(color: border),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: BorderSide(color: focusBorder, width: 2),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: AppColors.danger),
        ),
        focusedErrorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: AppColors.danger, width: 2),
        ),
        hintStyle: AppTextStyles.bodySm.copyWith(color: hint),
        errorStyle: AppTextStyles.caption.copyWith(color: AppColors.danger),
      );

  // ── Light Theme ───────────────────────────────────────────────
  static ThemeData get light => ThemeData(
    useMaterial3: true,
    colorScheme: const ColorScheme.light(
      primary:             Color(0xFF5B65DC),   // Pantone 2726 C
      onPrimary:           Color(0xFFFFFFFF),
      primaryContainer:    Color(0xFFEEEFFD),
      onPrimaryContainer:  Color(0xFF122056),
      secondary:           Color(0xFF122056),   // Pantone 2766 C
      onSecondary:         Color(0xFFFFFFFF),
      surface:             Color(0xFFFFFFFF),
      onSurface:           Color(0xFF111827),
      surfaceContainerLow: Color(0xFFFAFAFD),
      error:               Color(0xFFC0392B),
      onError:             Color(0xFFFFFFFF),
    ),
    scaffoldBackgroundColor: const Color(0xFFFAFAFD),
    fontFamily: 'Inter',
    appBarTheme: AppBarTheme(
      backgroundColor: const Color(0xFFFFFFFF),
      foregroundColor: const Color(0xFF111827),
      elevation: 0,
      shadowColor: Colors.transparent,
      surfaceTintColor: Colors.transparent,   // disable M3 tonal tint
      titleTextStyle: AppTextStyles.h3,
      centerTitle: false,
    ),
    elevatedButtonTheme: _elevatedButton(
      const Color(0xFF5B65DC), const Color(0xFFFFFFFF),
    ),
    outlinedButtonTheme: _outlinedButton(const Color(0xFF5B65DC)),
    inputDecorationTheme: _inputDecoration(
      fill:        const Color(0xFFFFFFFF),
      border:      const Color(0xFFD1D5DB),
      focusBorder: const Color(0xFF5B65DC),
      hint:        const Color(0xFF9CA3AF),
    ),
    cardTheme: CardTheme(
      color: const Color(0xFFFFFFFF),
      elevation: 0,
      surfaceTintColor: Colors.transparent,   // disable M3 tonal tint
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: const BorderSide(color: Color(0xFFE5E7EB)),
      ),
      margin: const EdgeInsets.only(bottom: 12),
    ),
    dividerTheme: const DividerThemeData(
      color: Color(0xFFE5E7EB),
      thickness: 1,
    ),
    bottomNavigationBarTheme: const BottomNavigationBarThemeData(
      backgroundColor: Color(0xFFFFFFFF),
      selectedItemColor: Color(0xFF5B65DC),
      unselectedItemColor: Color(0xFF6B7280),
      elevation: 8,
    ),
  );

  // ── Dark Theme ────────────────────────────────────────────────
  static ThemeData get dark => ThemeData(
    useMaterial3: true,
    colorScheme: const ColorScheme.dark(
      primary:             Color(0xFF7580F0),   // brightened for dark surfaces
      onPrimary:           Color(0xFFFFFFFF),
      primaryContainer:    Color(0xFF1C2044),
      onPrimaryContainer:  Color(0xFFEEEFFD),
      secondary:           Color(0xFF122056),
      onSecondary:         Color(0xFFFFFFFF),
      surface:             Color(0xFF161929),
      onSurface:           Color(0xFFF0F1FA),
      surfaceContainerLow: Color(0xFF0D0F1A),
      error:               Color(0xFFF87171),
      onError:             Color(0xFF2A0D0D),
    ),
    scaffoldBackgroundColor: const Color(0xFF0D0F1A),
    fontFamily: 'Inter',
    appBarTheme: AppBarTheme(
      backgroundColor: const Color(0xFF122056),   // top nav unchanged in dark
      foregroundColor: const Color(0xFFFFFFFF),
      elevation: 0,
      shadowColor: Colors.transparent,
      surfaceTintColor: Colors.transparent,
      titleTextStyle: AppTextStyles.h3.copyWith(color: const Color(0xFFFFFFFF)),
      centerTitle: false,
    ),
    elevatedButtonTheme: _elevatedButton(
      const Color(0xFF7580F0), const Color(0xFFFFFFFF),
    ),
    outlinedButtonTheme: _outlinedButton(const Color(0xFF7580F0)),
    inputDecorationTheme: _inputDecoration(
      fill:        const Color(0xFF161929),
      border:      const Color(0xFF252A40),
      focusBorder: const Color(0xFF7580F0),
      hint:        const Color(0xFF5E6A8A),
    ),
    cardTheme: CardTheme(
      color: const Color(0xFF161929),
      elevation: 0,
      surfaceTintColor: Colors.transparent,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: const BorderSide(color: Color(0xFF252A40)),
      ),
      margin: const EdgeInsets.only(bottom: 12),
    ),
    dividerTheme: const DividerThemeData(
      color: Color(0xFF252A40),
      thickness: 1,
    ),
    bottomNavigationBarTheme: const BottomNavigationBarThemeData(
      backgroundColor: Color(0xFF161929),
      selectedItemColor: Color(0xFF7580F0),
      unselectedItemColor: Color(0xFF5E6A8A),
      elevation: 8,
    ),
  );
}
```

### Applying the Theme in `main.dart`

```dart
MaterialApp(
  theme: AppTheme.light,
  darkTheme: AppTheme.dark,
  themeMode: ThemeMode.system,   // respects OS preference; override per user setting
  // ...
)
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
