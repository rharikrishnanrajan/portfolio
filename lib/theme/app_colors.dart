import 'package:flutter/material.dart';

/// Immutable color palette — use static const so they're valid in const contexts.
/// For theming, use [AppColorScheme] via [ThemeNotifier].
class AppColors {
  // ── Dark Theme (Apple Dark) ──────────────────────────────────────────
  static const Color darkPrimary = Color(0xFF000000);
  static const Color darkSecondary = Color(0xFF1C1C1E);
  static const Color darkAccent = Color(0xFF2997FF);
  static const Color darkText = Color(0xFFF5F5F7);
  static const Color darkTextSecondary = Color(0xFF86868B);
  static const Color darkBackground = Color(0xFF000000);

  // ── Light Theme (Apple Light) ────────────────────────────────────────
  static const Color lightPrimary = Color(0xFFFFFFFF);
  static const Color lightSecondary = Color(0xFFF2F2F7);
  static const Color lightAccent = Color(0xFF0066CC);
  static const Color lightText = Color(0xFF1D1D1F);
  static const Color lightTextSecondary = Color(0xFF6E6E73);
  static const Color lightBackground = Color(0xFFFFFFFF);
}

/// Runtime color scheme resolved from the current [ThemeMode].
class AppColorScheme {
  final Color primary;
  final Color secondary;
  final Color accent;
  final Color text;
  final Color textSecondary;
  final Color background;
  final bool isDark;

  const AppColorScheme._({
    required this.primary,
    required this.secondary,
    required this.accent,
    required this.text,
    required this.textSecondary,
    required this.background,
    required this.isDark,
  });

  static const AppColorScheme dark = AppColorScheme._(
    primary: AppColors.darkPrimary,
    secondary: AppColors.darkSecondary,
    accent: AppColors.darkAccent,
    text: AppColors.darkText,
    textSecondary: AppColors.darkTextSecondary,
    background: AppColors.darkBackground,
    isDark: true,
  );

  static const AppColorScheme light = AppColorScheme._(
    primary: AppColors.lightPrimary,
    secondary: AppColors.lightSecondary,
    accent: AppColors.lightAccent,
    text: AppColors.lightText,
    textSecondary: AppColors.lightTextSecondary,
    background: AppColors.lightBackground,
    isDark: false,
  );

  static AppColorScheme of(BuildContext context) {
    return ThemeNotifier.of(context).colors;
  }
}

/// [ChangeNotifier] that owns the [ThemeMode] and current [AppColorScheme].
class ThemeNotifier extends ChangeNotifier {
  ThemeMode _mode = ThemeMode.dark;

  ThemeMode get mode => _mode;
  AppColorScheme get colors =>
      _mode == ThemeMode.dark ? AppColorScheme.dark : AppColorScheme.light;

  void toggle() {
    _mode = _mode == ThemeMode.dark ? ThemeMode.light : ThemeMode.dark;
    notifyListeners();
  }

  // InheritedWidget-style static accessor
  static ThemeNotifier of(BuildContext context) {
    return context
        .dependOnInheritedWidgetOfExactType<_ThemeNotifierScope>()!
        .notifier;
  }
}

/// Wraps the widget tree so any descendant can call [ThemeNotifier.of(context)].
class ThemeNotifierProvider extends StatefulWidget {
  final Widget child;
  const ThemeNotifierProvider({super.key, required this.child});

  @override
  State<ThemeNotifierProvider> createState() => _ThemeNotifierProviderState();
}

class _ThemeNotifierProviderState extends State<ThemeNotifierProvider> {
  final ThemeNotifier _notifier = ThemeNotifier();

  @override
  void initState() {
    super.initState();
    _notifier.addListener(() => setState(() {}));
  }

  @override
  void dispose() {
    _notifier.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return _ThemeNotifierScope(
      notifier: _notifier,
      child: widget.child,
    );
  }
}

class _ThemeNotifierScope extends InheritedWidget {
  final ThemeNotifier notifier;
  const _ThemeNotifierScope({required this.notifier, required super.child});

  @override
  bool updateShouldNotify(_ThemeNotifierScope oldWidget) => true;
}
