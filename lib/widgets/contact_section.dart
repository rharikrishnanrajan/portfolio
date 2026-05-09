import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:animate_do/animate_do.dart';
import '../theme/app_colors.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'hover_widgets.dart';

class ContactSection extends StatelessWidget {
  const ContactSection({super.key});

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

    return FadeInUp(
      duration: const Duration(milliseconds: 800),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 120),
        alignment: Alignment.center,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Text(
              "What's Next?",
              style: textTheme.headlineMedium?.copyWith(
                color: c.accent,
                fontFamily: 'Roboto Mono',
              ),
            ),
            const SizedBox(height: 20),
            Text('Get In Touch', style: textTheme.displayLarge),
            const SizedBox(height: 20),
            SizedBox(
              width: 560,
              child: Text(
                "I'm currently looking for new DevOps opportunities. Whether you have a question, a project, or just want to say hi — I'll do my best to get back to you!",
                textAlign: TextAlign.center,
                style: textTheme.bodyLarge?.copyWith(height: 1.8),
              ),
            ),
            const SizedBox(height: 50),
            HoverElevatedButton(
              label: '  Say Hello  ',
              onPressed: () =>
                  _launchUrl('mailto:rharikrishnanrajan@zohomail.in'),
            ),
            const SizedBox(height: 60),
            FadeInUp(
              delay: const Duration(milliseconds: 400),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  HoverSocialButton(
                    iconData: FontAwesomeIcons.github,
                    tooltip: 'GitHub — github.com/rharikrishnanrajan',
                    onTap: () =>
                        _launchUrl('https://github.com/rharikrishnanrajan'),
                  ),
                  const SizedBox(width: 24),
                  HoverSocialButton(
                    iconData: FontAwesomeIcons.linkedin,
                    tooltip:
                        'LinkedIn — linkedin.com/in/rharikrishnanrajan',
                    onTap: () => _launchUrl(
                        'https://www.linkedin.com/in/rharikrishnanrajan'),
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
