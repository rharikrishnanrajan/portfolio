import 'package:flutter/material.dart';
import 'package:animate_do/animate_do.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import '../theme/app_colors.dart';
import '../services/supabase_service.dart';
import 'hover_widgets.dart';

class CertificationsSection extends StatefulWidget {
  const CertificationsSection({super.key});

  @override
  State<CertificationsSection> createState() => _CertificationsSectionState();
}

class _CertificationsSectionState extends State<CertificationsSection> {
  List<Map<String, dynamic>> _certs = [];

  /// Hardcoded fallback certificates (original data)
  List<Map<String, String>> get _defaultCerts => [
        {
          'title': 'Fundamentals of Agile Methodology with DevOps Integration',
          'issuer': 'L&T EduTech',
          'period': 'Aug 2023 – Nov 2023',
          'link': dotenv.get('CERT_AGILE_URL', fallback: ''),
        },
        {
          'title': 'DevOps and Cloud',
          'issuer': 'L&T EduTech',
          'period': 'Jan 2024 – Apr 2024',
          'link': dotenv.get('CERT_DEVOPS_CLOUD_URL', fallback: ''),
        },
        {
          'title': 'DevOps Container Services',
          'issuer': 'L&T EduTech',
          'period': 'Jun 2024 – Oct 2024',
          'link': dotenv.get('CERT_CONTAINER_URL', fallback: ''),
        },
      ];

  @override
  void initState() {
    super.initState();
    _loadCertificates();
  }

  Future<void> _loadCertificates() async {
    final data = await SupabaseService.instance.getCertificatesData();
    if (mounted) {
      setState(() {
        if (data.isNotEmpty) {
          _certs = data;
        }
      });
    }
  }

  /// Returns either Supabase data or fallback defaults
  List<Map<String, dynamic>> get _displayCerts =>
      _certs.isNotEmpty ? _certs : _defaultCerts;

  Future<void> _launchURL(String url) async {
    if (url.isEmpty) return;
    final Uri uri = Uri.parse(url);
    if (!await launchUrl(uri, webOnlyWindowName: '_blank')) {
      debugPrint('Could not launch $url');
    }
  }

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;
    final screenWidth = MediaQuery.of(context).size.width;
    final isMobile = screenWidth < 800;
    final c = AppColorScheme.of(context);

    return FadeInUp(
      duration: const Duration(milliseconds: 800),
      child: Container(
        padding: EdgeInsets.symmetric(
          horizontal: isMobile ? 24 : 100,
          vertical: 80,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Text('Certifications', style: textTheme.headlineLarge),
                const SizedBox(width: 20),
                Expanded(
                  child: Container(
                    height: 1,
                    color: c.textSecondary.withValues(alpha: 0.3),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 40),
            ..._displayCerts.asMap().entries.map((entry) {
              final cert = entry.value;
              final link = (cert['link'] ?? '') as String;
              return FadeInLeft(
                delay: Duration(milliseconds: entry.key * 150),
                duration: const Duration(milliseconds: 600),
                child: Padding(
                  padding: const EdgeInsets.only(bottom: 16),
                  child: GestureDetector(
                    onTap: () => _launchURL(link),
                    child: MouseRegion(
                      cursor: SystemMouseCursors.click,
                      child: HoverCard(
                        borderColor: c.accent,
                        child: Padding(
                          padding: const EdgeInsets.all(20),
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.center,
                            children: [
                              Container(
                                width: 44,
                                height: 44,
                                decoration: BoxDecoration(
                                  color: c.accent.withValues(alpha: 0.1),
                                  shape: BoxShape.circle,
                                  border: Border.all(
                                    color: c.accent.withValues(alpha: 0.3),
                                  ),
                                ),
                                child: Icon(
                                  Icons.verified_rounded,
                                  color: c.accent,
                                  size: 22,
                                ),
                              ),
                              const SizedBox(width: 18),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      (cert['title'] ?? '') as String,
                                      style: textTheme.bodyLarge?.copyWith(
                                        color: c.text,
                                        fontWeight: FontWeight.w600,
                                      ),
                                    ),
                                    const SizedBox(height: 5),
                                    Text(
                                      '${cert['issuer'] ?? ''} • ${cert['period'] ?? ''}',
                                      style: textTheme.bodyMedium?.copyWith(
                                        color: c.accent,
                                        fontSize: 12,
                                        fontFamily: 'Roboto Mono',
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              Icon(
                                Icons.open_in_new_rounded,
                                color: c.textSecondary,
                                size: 18,
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
              );
            }),
          ],
        ),
      ),
    );
  }
}
