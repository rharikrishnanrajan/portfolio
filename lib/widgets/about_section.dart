import 'package:flutter/material.dart';
import 'package:animate_do/animate_do.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import '../theme/app_colors.dart';

class AboutSection extends StatelessWidget {
  const AboutSection({super.key});

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
                Text('About Me', style: textTheme.headlineLarge),
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
            isMobile
                ? Column(
                    children: [
                      _buildText(textTheme, c),
                      const SizedBox(height: 40),
                      _buildImage(),
                    ],
                  )
                : Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(flex: 3, child: _buildText(textTheme, c)),
                      const SizedBox(width: 60),
                      Expanded(flex: 2, child: _buildImage()),
                    ],
                  ),
          ],
        ),
      ),
    );
  }

  Widget _buildText(TextTheme textTheme, AppColorScheme c) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          "Hi! I'm Harikrishnan R, a passionate DevOps Engineer from India with hands-on expertise in cloud infrastructure, containerization, and CI/CD automation.",
          style: textTheme.bodyLarge?.copyWith(height: 1.8),
        ),
        const SizedBox(height: 16),
        Text(
          'I specialize in building and scaling infrastructure on AWS — architecting multi-region deployments, automating software delivery pipelines with Jenkins, and containerizing applications with Docker and ECS Fargate.',
          style: textTheme.bodyLarge?.copyWith(height: 1.8),
        ),
        const SizedBox(height: 16),
        Text(
          'My goal is to bridge the gap between development and operations by implementing robust DevOps practices that increase velocity, reliability, and security of software systems.',
          style: textTheme.bodyLarge?.copyWith(height: 1.8),
        ),
        const SizedBox(height: 28),
        Wrap(
          spacing: 20,
          runSpacing: 12,
          children: [
            _buildInfoChip(Icons.location_on_rounded, 'India', c),
            _buildInfoChip(Icons.work_rounded, 'DevOps Engineer', c),
            _buildInfoChip(Icons.verified_rounded, 'L&T EduTech Certified', c),
          ],
        ),
      ],
    );
  }

  Widget _buildInfoChip(IconData icon, String label, AppColorScheme c) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, color: c.accent, size: 16),
        const SizedBox(width: 6),
        Text(
          label,
          style: TextStyle(
            color: c.textSecondary,
            fontSize: 14,
            fontFamily: 'Roboto Mono',
          ),
        ),
      ],
    );
  }

  Widget _buildImage() {
    return const Center(child: _HoverImage());
  }
}

class _HoverImage extends StatefulWidget {
  const _HoverImage();

  @override
  State<_HoverImage> createState() => _HoverImageState();
}

class _HoverImageState extends State<_HoverImage>
    with SingleTickerProviderStateMixin {
  bool _hovered = false;
  late AnimationController _ctrl;
  late Animation<double> _tilt;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 300),
    );
    _tilt = Tween<double>(
      begin: 0,
      end: 0.05,
    ).animate(CurvedAnimation(parent: _ctrl, curve: Curves.easeOutCubic));
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final c = AppColorScheme.of(context);
    return MouseRegion(
      onEnter: (_) {
        setState(() => _hovered = true);
        _ctrl.forward();
      },
      onExit: (_) {
        setState(() => _hovered = false);
        _ctrl.reverse();
      },
      child: AnimatedBuilder(
        animation: _ctrl,
        builder: (context, child) => Transform(
          alignment: Alignment.center,
          transform: Matrix4.identity()
            ..setEntry(3, 2, 0.001)
            ..rotateY(_tilt.value),
          child: Transform.translate(
            offset: Offset(0.0, _hovered ? -6.0 : 0.0),
            child: child,
          ),
        ),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOutCubic,
          width: 280,
          height: 280,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(10),
            border: Border.all(
              color: _hovered ? c.accent : c.accent.withValues(alpha: 0.5),
              width: 2,
            ),
            boxShadow: [
              BoxShadow(
                color: c.accent.withValues(alpha: _hovered ? 0.3 : 0.1),
                blurRadius: _hovered ? 30 : 15,
                spreadRadius: _hovered ? 3 : 0,
                offset: const Offset(0, 8),
              ),
            ],
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(8),
            child: Image.network(dotenv.env['ABOUT_IMAGE_URL'] ?? '', fit: BoxFit.cover),
          ),
        ),
      ),
    );
  }
}
