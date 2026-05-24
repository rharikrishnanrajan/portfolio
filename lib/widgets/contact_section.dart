import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:animate_do/animate_do.dart';
import '../theme/app_colors.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import '../services/supabase_service.dart';
import 'hover_widgets.dart';

class ContactSection extends StatefulWidget {
  const ContactSection({super.key});

  @override
  State<ContactSection> createState() => _ContactSectionState();
}

class _ContactSectionState extends State<ContactSection> {
  // Defaults matching the original hardcoded values
  String _heading = "What's Next?";
  String _title = 'Get In Touch';
  String _description =
      "I'm currently looking for new DevOps opportunities. Whether you have a question, a project, or just want to say hi — I'll do my best to get back to you!";
  String _email = '';
  String _githubUrl = '';
  String _linkedinUrl = '';
  String _ctaText = '  Say Hello  ';

  @override
  void initState() {
    super.initState();
    // Load .env defaults first
    _email = dotenv.env['CONTACT_EMAIL'] ?? 'contact@example.com';
    _githubUrl = dotenv.env['GITHUB_URL'] ?? 'https://github.com';
    _linkedinUrl = dotenv.env['LINKEDIN_URL'] ?? 'https://linkedin.com';
    _loadContactData();
  }

  Future<void> _loadContactData() async {
    final data = await SupabaseService.instance.getContactData();
    if (data != null && mounted) {
      setState(() {
        _heading = data['heading'] as String? ?? _heading;
        _title = data['title'] as String? ?? _title;
        _description = data['description'] as String? ?? _description;
        final email = data['email'] as String?;
        if (email != null && email.isNotEmpty) _email = email;
        final gh = data['github_url'] as String?;
        if (gh != null && gh.isNotEmpty) _githubUrl = gh;
        final li = data['linkedin_url'] as String?;
        if (li != null && li.isNotEmpty) _linkedinUrl = li;
        _ctaText = data['cta_text'] as String? ?? _ctaText;
      });
    }
  }

  Future<void> _launchUrl(String urlString) async {
    final Uri url = Uri.parse(urlString);
    if (!await launchUrl(url, mode: LaunchMode.externalApplication)) {
      debugPrint('Could not launch $urlString');
    }
  }

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;
    final c = AppColorScheme.of(context);

    // Extract display-friendly labels from the env values
    final githubHandle = Uri.parse(_githubUrl).pathSegments
        .where((s) => s.isNotEmpty)
        .join('/');
    final linkedinHandle = Uri.parse(_linkedinUrl).pathSegments
        .where((s) => s.isNotEmpty)
        .join('/');

    return FadeInUp(
      duration: const Duration(milliseconds: 800),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 120),
        alignment: Alignment.center,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Text(
              _heading,
              style: textTheme.headlineMedium?.copyWith(
                color: c.accent,
                fontFamily: 'Roboto Mono',
              ),
            ),
            const SizedBox(height: 20),
            Text(_title, style: textTheme.displayLarge),
            const SizedBox(height: 20),
            SizedBox(
              width: 560,
              child: Text(
                _description,
                textAlign: TextAlign.center,
                style: textTheme.bodyLarge?.copyWith(height: 1.8),
              ),
            ),
            const SizedBox(height: 50),
            HoverElevatedButton(
              label: _ctaText,
              onPressed: () => _launchUrl('mailto:$_email'),
            ),
            const SizedBox(height: 60),
            FadeInUp(
              delay: const Duration(milliseconds: 400),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  HoverSocialButton(
                    iconData: FontAwesomeIcons.github,
                    tooltip: 'GitHub — $githubHandle',
                    onTap: () => _launchUrl(_githubUrl),
                  ),
                  const SizedBox(width: 24),
                  HoverSocialButton(
                    iconData: FontAwesomeIcons.linkedin,
                    tooltip: 'LinkedIn — $linkedinHandle',
                    onTap: () => _launchUrl(_linkedinUrl),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
