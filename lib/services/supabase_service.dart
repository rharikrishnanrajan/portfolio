import 'package:flutter/foundation.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

/// Centralized Supabase data service for the portfolio.
/// Fetches all dynamic content from Supabase tables and caches it in memory.
class SupabaseService {
  SupabaseService._();
  static final SupabaseService instance = SupabaseService._();

  SupabaseClient get _client => Supabase.instance.client;

  // ── In-memory cache ─────────────────────────────────────────────────────────
  Map<String, dynamic>? _heroData;
  Map<String, dynamic>? _aboutData;
  List<Map<String, dynamic>>? _skillsData;
  List<Map<String, dynamic>>? _projectsData;
  List<Map<String, dynamic>>? _certificatesData;

  // ── Hero Section ────────────────────────────────────────────────────────────
  Future<Map<String, dynamic>?> getHeroData() async {
    if (_heroData != null) return _heroData;
    try {
      final response = await _client.from('hero_section').select().limit(1);
      if (response.isNotEmpty) {
        _heroData = response.first;
      }
    } catch (e) {
      debugPrint('SupabaseService: Failed to fetch hero_section — $e');
    }
    return _heroData;
  }

  // ── About Me ────────────────────────────────────────────────────────────────
  Future<Map<String, dynamic>?> getAboutData() async {
    if (_aboutData != null) return _aboutData;
    try {
      final response = await _client.from('about_me').select().limit(1);
      if (response.isNotEmpty) {
        _aboutData = response.first;
      }
    } catch (e) {
      debugPrint('SupabaseService: Failed to fetch about_me — $e');
    }
    return _aboutData;
  }

  // ── Skills ──────────────────────────────────────────────────────────────────
  Future<List<Map<String, dynamic>>> getSkillsData() async {
    if (_skillsData != null) return _skillsData!;
    try {
      final response = await _client.from('skills').select().order('id');
      _skillsData = List<Map<String, dynamic>>.from(response);
    } catch (e) {
      debugPrint('SupabaseService: Failed to fetch skills — $e');
    }
    return _skillsData ?? [];
  }

  // ── Projects ────────────────────────────────────────────────────────────────
  Future<List<Map<String, dynamic>>> getProjectsData() async {
    if (_projectsData != null) return _projectsData!;
    try {
      final response = await _client.from('projects').select().order('id');
      _projectsData = List<Map<String, dynamic>>.from(response);
    } catch (e) {
      debugPrint('SupabaseService: Failed to fetch projects — $e');
    }
    return _projectsData ?? [];
  }

  // ── Certificates ────────────────────────────────────────────────────────────
  Future<List<Map<String, dynamic>>> getCertificatesData() async {
    if (_certificatesData != null) return _certificatesData!;
    try {
      final response = await _client.from('certificates').select().order('id');
      _certificatesData = List<Map<String, dynamic>>.from(response);
    } catch (e) {
      debugPrint('SupabaseService: Failed to fetch certificates — $e');
    }
    return _certificatesData ?? [];
  }

  /// Clear all cached data (useful for pull-to-refresh or hot-reload)
  void clearCache() {
    _heroData = null;
    _aboutData = null;
    _skillsData = null;
    _projectsData = null;
    _certificatesData = null;
  }
}
