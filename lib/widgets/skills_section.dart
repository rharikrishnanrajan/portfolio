import 'package:flutter/material.dart';
import 'package:visibility_detector/visibility_detector.dart';
import '../theme/app_colors.dart';
import 'animated_widgets.dart';

class SkillsSection extends StatelessWidget {
  const SkillsSection({super.key});

  static const List<Map<String, dynamic>> _skillCategories = [
    {
      'category': 'Cloud Platforms (AWS)',
      'icon': Icons.cloud_queue_rounded,
      'skills': ['EC2', 'ECR', 'ECS', 'Route 53', 'IAM', 'SSM'],
      'progress': 0.88,
      'color': Color(0xFF2997FF),
    },
    {
      'category': 'Containerization',
      'icon': Icons.layers_rounded,
      'skills': ['Docker', 'Docker Swarm', 'AWS ECS (Fargate)'],
      'progress': 0.92,
      'color': Color(0xFF00D4FF),
    },
    {
      'category': 'CI/CD Tools',
      'icon': Icons.settings_backup_restore_rounded,
      'skills': ['Jenkins', 'Pipeline-as-Code', 'Jenkinsfile'],
      'progress': 0.85,
      'color': Color(0xFF5E5CE6),
    },
    {
      'category': 'Security & Quality',
      'icon': Icons.security_rounded,
      'skills': ['SonarQube'],
      'progress': 0.75,
      'color': Color(0xFF30D158),
    },
    {
      'category': 'Version Control',
      'icon': Icons.fork_right_rounded,
      'skills': ['Git', 'GitHub'],
      'progress': 0.90,
      'color': Color(0xFFFF9F0A),
    },
    {
      'category': 'Operating Systems',
      'icon': Icons.terminal_rounded,
      'skills': ['Linux', 'Amazon Linux', 'Ubuntu'],
      'progress': 0.85,
      'color': Color(0xFFFF453A),
    },
  ];

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;
    final screenWidth = MediaQuery.of(context).size.width;
    final isMobile = screenWidth < 800;
    final c = AppColorScheme.of(context);

    return Container(
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
          const SizedBox(height: 16),
          ScrollReveal(
            delay: const Duration(milliseconds: 100),
            child: Text(
              'Core competencies built through real-world DevOps projects',
              style: TextStyle(
                color: c.textSecondary,
                fontSize: 14,
                fontFamily: 'Roboto Mono',
              ),
            ),
          ),
          const SizedBox(height: 48),
          isMobile
              ? Column(
                  children: _skillCategories.asMap().entries.map((e) {
                    return ScrollReveal(
                      delay: Duration(milliseconds: e.key * 80),
                      child: _SkillBarCard(
                        category: e.value['category'] as String,
                        icon: e.value['icon'] as IconData,
                        skills: List<String>.from(e.value['skills'] as List),
                        progress: e.value['progress'] as double,
                        barColor: e.value['color'] as Color,
                      ),
                    );
                  }).toList(),
                )
              : Column(
                  children: _skillCategories.asMap().entries.map((e) {
                    return ScrollReveal(
                      delay: Duration(milliseconds: e.key * 80),
                      child: _SkillBarCard(
                        category: e.value['category'] as String,
                        icon: e.value['icon'] as IconData,
                        skills: List<String>.from(e.value['skills'] as List),
                        progress: e.value['progress'] as double,
                        barColor: e.value['color'] as Color,
                      ),
                    );
                  }).toList(),
                ),
        ],
      ),
    );
  }
}

// ─── Animated Skill Bar Card ──────────────────────────────────────────────────
class _SkillBarCard extends StatefulWidget {
  final String category;
  final IconData icon;
  final List<String> skills;
  final double progress;
  final Color barColor;

  const _SkillBarCard({
    required this.category,
    required this.icon,
    required this.skills,
    required this.progress,
    required this.barColor,
  });

  @override
  State<_SkillBarCard> createState() => _SkillBarCardState();
}

class _SkillBarCardState extends State<_SkillBarCard>
    with SingleTickerProviderStateMixin {
  late AnimationController _ctrl;
  late Animation<double> _fillAnim;
  bool _animated = false;
  bool _hovered = false;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1400),
    );
    _fillAnim = Tween<double>(begin: 0.0, end: widget.progress).animate(
      CurvedAnimation(parent: _ctrl, curve: Curves.easeOutCubic),
    );
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  void _onVisible() {
    if (!_animated) {
      _animated = true;
      Future.delayed(const Duration(milliseconds: 200), () {
        if (mounted) _ctrl.forward();
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final c = AppColorScheme.of(context);
    return VisibilityDetector(
      key: Key('skill-${widget.category}'),
      onVisibilityChanged: (info) {
        if (info.visibleFraction > 0.15) _onVisible();
      },
      child: MouseRegion(
        onEnter: (_) => setState(() => _hovered = true),
        onExit: (_) => setState(() => _hovered = false),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 300),
          margin: const EdgeInsets.only(bottom: 18),
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            color: c.secondary,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: _hovered
                  ? widget.barColor.withValues(alpha: 0.5)
                  : widget.barColor.withValues(alpha: 0.15),
              width: 1.5,
            ),
            boxShadow: [
              BoxShadow(
                color: widget.barColor.withValues(alpha: _hovered ? 0.15 : 0.04),
                blurRadius: _hovered ? 28 : 8,
                spreadRadius: _hovered ? 2 : 0,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // ── Header row ────────────────────────────────────────────
              Row(
                children: [
                  AnimatedContainer(
                    duration: const Duration(milliseconds: 300),
                    width: 42,
                    height: 42,
                    decoration: BoxDecoration(
                      color: widget.barColor.withValues(alpha: _hovered ? 0.2 : 0.12),
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(
                        color: widget.barColor.withValues(alpha: _hovered ? 0.6 : 0.3),
                      ),
                    ),
                    child: Icon(widget.icon, color: widget.barColor, size: 20),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Text(
                      widget.category,
                      style: TextStyle(
                        color: c.text,
                        fontSize: 15,
                        fontWeight: FontWeight.w700,
                        letterSpacing: 0.3,
                      ),
                    ),
                  ),
                  // Animated percentage counter
                  AnimatedBuilder(
                    animation: _fillAnim,
                    builder: (_, child) => Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 10, vertical: 5),
                      decoration: BoxDecoration(
                        color: widget.barColor.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(
                            color: widget.barColor.withValues(alpha: 0.35)),
                        boxShadow: [
                          BoxShadow(
                            color: widget.barColor.withValues(alpha: 0.2),
                            blurRadius: 8,
                          ),
                        ],
                      ),
                      child: Text(
                        '${(_fillAnim.value * 100).toInt()}%',
                        style: TextStyle(
                          color: widget.barColor,
                          fontFamily: 'Roboto Mono',
                          fontWeight: FontWeight.bold,
                          fontSize: 13,
                          shadows: [
                            Shadow(
                              color: widget.barColor.withValues(alpha: 0.5),
                              blurRadius: 6,
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 20),

              // ── Animated progress bar ─────────────────────────────────
              AnimatedBuilder(
                animation: _fillAnim,
                builder: (_, child) => _InfographicBar(
                  progress: _fillAnim.value,
                  color: widget.barColor,
                  isDark: c.isDark,
                ),
              ),
              const SizedBox(height: 14),

              // ── Skill chips ──────────────────────────────────────────
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: widget.skills.map((skill) {
                  return AnimatedContainer(
                    duration: const Duration(milliseconds: 250),
                    padding:
                        const EdgeInsets.symmetric(horizontal: 12, vertical: 5),
                    decoration: BoxDecoration(
                      color: _hovered
                          ? widget.barColor.withValues(alpha: 0.15)
                          : widget.barColor.withValues(alpha: 0.07),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(
                        color: widget.barColor
                            .withValues(alpha: _hovered ? 0.5 : 0.25),
                      ),
                    ),
                    child: Text(
                      skill,
                      style: TextStyle(
                        fontSize: 12,
                        color: widget.barColor,
                        fontFamily: 'Roboto Mono',
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  );
                }).toList(),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ─── Infographic Bar ─────────────────────────────────────────────────────────
class _InfographicBar extends StatelessWidget {
  final double progress;
  final Color color;
  final bool isDark;

  const _InfographicBar({
    required this.progress,
    required this.color,
    required this.isDark,
  });

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final totalWidth = constraints.maxWidth;
        final fillWidth = (totalWidth * progress).clamp(0.0, totalWidth);

        return SizedBox(
          height: 18,
          child: Stack(
            children: [
              // Track
              Container(
                width: totalWidth,
                decoration: BoxDecoration(
                  color: color.withValues(alpha: isDark ? 0.08 : 0.12),
                  borderRadius: BorderRadius.circular(9),
                ),
              ),
              // Segment ticks
              ...List.generate(19, (i) {
                final x = totalWidth * (i + 1) / 20;
                return Positioned(
                  left: x,
                  top: 4,
                  bottom: 4,
                  child: Container(
                    width: 1,
                    color: (isDark ? Colors.black : Colors.white)
                        .withValues(alpha: 0.2),
                  ),
                );
              }),
              // Filled bar with gradient
              Container(
                width: fillWidth,
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [
                      color.withValues(alpha: 0.85),
                      color,
                      const Color(0xFF00D4FF),
                    ],
                  ),
                  borderRadius: BorderRadius.circular(9),
                  boxShadow: [
                    BoxShadow(
                      color: color.withValues(alpha: 0.45),
                      blurRadius: 10,
                      spreadRadius: 0,
                    ),
                  ],
                ),
              ),
              // Leading glow dot
              if (fillWidth > 12)
                Positioned(
                  left: fillWidth - 9,
                  top: 1,
                  bottom: 1,
                  child: Container(
                    width: 16,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: Colors.white.withValues(alpha: 0.9),
                      boxShadow: [
                        BoxShadow(
                          color: color.withValues(alpha: 0.9),
                          blurRadius: 8,
                          spreadRadius: 2,
                        ),
                      ],
                    ),
                  ),
                ),
            ],
          ),
        );
      },
    );
  }
}
