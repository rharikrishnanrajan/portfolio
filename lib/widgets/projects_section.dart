import 'package:flutter/material.dart';
import '../theme/app_colors.dart';
import 'hover_widgets.dart';
import 'three_d_widgets.dart';
import 'animated_widgets.dart';

class ProjectsSection extends StatelessWidget {
  const ProjectsSection({super.key});

  static const List<Map<String, dynamic>> _projects = [
    {
      'title': 'Multi-Region Application Deployment with Docker & AWS Route 53',
      'type': 'Final Year Project',
      'description':
          'Containerized a Tic-Tac-Toe web app and deployed it across two AWS regions (N. Virginia & Mumbai) using ECS Fargate. Route 53 latency-based routing + health checks achieved 100% availability during regional failover.',
      'highlights': [
        'Reduced latency with latency-based routing across 2 AWS regions',
        '100% availability during regional failover simulation',
        'Multi-region ECR image distribution with version control',
      ],
      'techStack': ['AWS EC2', 'ECR', 'ECS', 'Route 53', 'IAM', 'Docker', 'GitHub'],
    },
    {
      'title': 'Scalable Web Service Deployment using Docker Swarm',
      'type': 'L&T EduTech Project',
      'description':
          'Initialized a Docker Swarm cluster across three AWS EC2 instances (Manager + 2 Workers). Implemented service scaling and the built-in load balancer to distribute traffic efficiently across all replicas.',
      'highlights': [
        'Swarm cluster: 1 Manager + 2 Worker nodes on AWS EC2',
        'High availability with auto-scaling service replicas',
        'Built-in load balancing for efficient traffic distribution',
      ],
      'techStack': ['Docker', 'Docker Swarm', 'AWS EC2', 'Amazon Linux'],
    },
    {
      'title': 'CI/CD Pipeline for React Application on AWS',
      'type': 'L&T EduTech Project',
      'description':
          'Configured Jenkins on AWS EC2 to automate the full software delivery lifecycle for a React app. Integrated Trivy for vulnerability scanning and authored a Jenkinsfile Pipeline-as-Code for Docker build → tag → push to ECR.',
      'highlights': [
        'Integrated Trivy for filesystem & container image vulnerability scanning',
        'Automated Docker build → tag → push to ECR pipeline',
        'Full SDLC automation with Jenkinsfile Pipeline-as-Code',
      ],
      'techStack': ['Jenkins', 'Docker', 'Trivy', 'AWS EC2', 'ECR', 'React'],
    },
    {
      'title': 'Automated Web Application Deployment with Jenkins & Docker',
      'type': 'Personal Project',
      'description':
          'Developed a Jenkinsfile Pipeline-as-Code to automate the entire lifecycle from GitHub commit to production on AWS. Reduced deployment time from hours to minutes, eliminating manual errors completely.',
      'highlights': [
        'Deployment time reduced from hours to minutes',
        'Zero manual errors with fully automated release process',
        'ECR versioning enables reliable rollbacks to stable releases',
      ],
      'techStack': ['Jenkins', 'Docker', 'AWS EC2', 'ECR', 'Git', 'GitHub', 'React.js'],
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
                    text: 'Projects',
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
            ..._projects.asMap().entries.map((entry) {
              return ScrollReveal(
                delay: Duration(milliseconds: entry.key * 100),
                child: Padding(
                  padding: const EdgeInsets.only(bottom: 28),
                  // ── 3-D cursor-tracking tilt wraps each card ─────────
                  child: MouseTiltCard(
                    maxTilt: 0.06,
                    child: HoverCard(
                      child: Padding(
                        padding: const EdgeInsets.all(28),
                        child: _buildContent(context, entry.value, c),
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

  Widget _buildContent(
      BuildContext context, Map<String, dynamic> proj, AppColorScheme c) {
    final textTheme = Theme.of(context).textTheme;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
          decoration: BoxDecoration(
            color: c.accent.withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(4),
          ),
          child: Text(
            proj['type'],
            style: textTheme.bodyMedium?.copyWith(
              color: c.accent,
              fontSize: 11,
              fontFamily: 'Roboto Mono',
            ),
          ),
        ),
        const SizedBox(height: 12),
        Text(
          proj['title'],
          style: textTheme.headlineMedium?.copyWith(color: c.text, fontSize: 19),
        ),
        const SizedBox(height: 10),
        Text(proj['description'], style: textTheme.bodyMedium),
        const SizedBox(height: 14),
        ...((proj['highlights'] as List<String>).map((h) => Padding(
              padding: const EdgeInsets.only(bottom: 6),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('▹ ', style: TextStyle(color: c.accent, fontSize: 15)),
                  Expanded(
                      child: Text(h,
                          style: TextStyle(
                              color: c.textSecondary,
                              fontSize: 14,
                              height: 1.5))),
                ],
              ),
            ))),
        const SizedBox(height: 16),
        Wrap(
          spacing: 10,
          runSpacing: 8,
          children: (proj['techStack'] as List<String>).map((tech) {
            return Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: c.accent.withValues(alpha: 0.08),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: c.accent.withValues(alpha: 0.3)),
              ),
              child: Text(tech,
                  style: TextStyle(
                      fontSize: 12, color: c.accent, fontFamily: 'Roboto Mono')),
            );
          }).toList(),
        ),
      ],
    );
  }
}
