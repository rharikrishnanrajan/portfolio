import 'package:flutter/material.dart';
import '../theme/app_colors.dart';
import 'animated_widgets.dart';
import 'three_d_widgets.dart';

class SkillsSection extends StatelessWidget {
  const SkillsSection({super.key});

  static const List<Map<String, dynamic>> _skillCategories = [
    {
      'category': 'Cloud Platforms (AWS)',
      'skills': ['EC2', 'ECR', 'ECS', 'Route 53', 'IAM', 'SSM'],
      'progress': 0.88,
    },
    {
      'category': 'Containerization',
      'skills': ['Docker', 'Docker Swarm', 'AWS ECS (Fargate)'],
      'progress': 0.92,
    },
    {
      'category': 'CI/CD Tools',
      'skills': ['Jenkins', 'Pipeline-as-Code', 'Jenkinsfile'],
      'progress': 0.85,
    },
    {
      'category': 'Security & Quality',
      'skills': ['SonarQube', 'Trivy'],
      'progress': 0.78,
    },
    {
      'category': 'Version Control',
      'skills': ['Git', 'GitHub'],
      'progress': 0.90,
    },
    {
      'category': 'Operating Systems',
      'skills': ['Linux', 'Amazon Linux', 'Ubuntu'],
      'progress': 0.85,
    },
  ];

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;
    final screenWidth = MediaQuery.of(context).size.width;
    final isMobile = screenWidth < 800;
    final c = AppColorScheme.of(context);

    return FloatingGeometryBackground(
      child: Container(
        padding: EdgeInsets.symmetric(
          horizontal: isMobile ? 24 : 100,
          vertical: 80,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            ScrollReveal(
              child: Row(
                children: [
                  AnimatedTextMask(
                    text: 'Skills & Technologies',
                    style: textTheme.headlineLarge ?? const TextStyle(),
                    accentColor: c.accent,
                  ),
                  const SizedBox(width: 20),
                  Expanded(
                    child: Container(
                      height: 1,
                      color: c.textSecondary.withValues(alpha: 0.3),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 50),
            isMobile
                ? Column(
                    children: _skillCategories
                        .asMap()
                        .entries
                        .map((e) => ScrollReveal(
                              delay: Duration(milliseconds: e.key * 100),
                              child: MouseTiltCard(
                                maxTilt: 0.04,
                                child: AnimatedSkillBar(
                                  category: e.value['category'],
                                  skills: List<String>.from(e.value['skills']),
                                  progress: e.value['progress'],
                                  delay: const Duration(milliseconds: 200),
                                ),
                              ),
                            ))
                        .toList(),
                  )
                : Wrap(
                    spacing: 20,
                    runSpacing: 0,
                    children: _skillCategories
                        .asMap()
                        .entries
                        .map((e) => SizedBox(
                              width: (screenWidth - 240) / 2,
                              child: ScrollReveal(
                                delay: Duration(milliseconds: e.key * 100),
                                child: MouseTiltCard(
                                  maxTilt: 0.04,
                                  child: AnimatedSkillBar(
                                    category: e.value['category'],
                                    skills:
                                        List<String>.from(e.value['skills']),
                                    progress: e.value['progress'],
                                    delay: const Duration(milliseconds: 200),
                                  ),
                                ),
                              ),
                            ))
                        .toList(),
                  ),
          ],
        ),
      ),
    );
  }
}
