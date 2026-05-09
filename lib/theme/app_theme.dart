import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'app_colors.dart';

class AppTheme {
  // ── Dark (Apple Dark) ────────────────────────────────────────────────
  static ThemeData get darkTheme => _build(AppColorScheme.dark);

  // ── Light (Apple Light) ──────────────────────────────────────────────
  static ThemeData get lightTheme => _build(AppColorScheme.light);

  static ThemeData _build(AppColorScheme c) {
    final brightness = c.isDark ? Brightness.dark : Brightness.light;
    return ThemeData(
      brightness: brightness,
      primaryColor: c.primary,
      scaffoldBackgroundColor: c.background,
      colorScheme: ColorScheme(
        brightness: brightness,
        primary: c.accent,
        onPrimary: c.primary,
        secondary: c.accent,
        onSecondary: c.primary,
        error: Colors.redAccent,
        onError: c.primary,
        surface: c.secondary,
        onSurface: c.text,
      ),
      textTheme: TextTheme(
        displayLarge: GoogleFonts.inter(
          color: c.text,
          fontWeight: FontWeight.bold,
          fontSize: 64,
        ),
        displayMedium: GoogleFonts.inter(
          color: c.text,
          fontWeight: FontWeight.bold,
          fontSize: 48,
        ),
        headlineLarge: GoogleFonts.inter(
          color: c.text,
          fontWeight: FontWeight.bold,
          fontSize: 32,
        ),
        headlineMedium: GoogleFonts.inter(
          color: c.textSecondary,
          fontWeight: FontWeight.w600,
          fontSize: 24,
        ),
        bodyLarge: GoogleFonts.roboto(
          color: c.text,
          fontSize: 18,
          height: 1.5,
        ),
        bodyMedium: GoogleFonts.roboto(
          color: c.textSecondary,
          fontSize: 16,
          height: 1.5,
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: Colors.transparent,
          foregroundColor: c.accent,
          side: BorderSide(color: c.accent, width: 1.5),
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(4),
          ),
          textStyle: GoogleFonts.roboto(
            fontSize: 16,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
      popupMenuTheme: PopupMenuThemeData(
        color: c.secondary,
        textStyle: TextStyle(color: c.text),
      ),
    );
  }
}
