import 'package:flutter/material.dart';
import 'package:animate_do/animate_do.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import '../theme/app_colors.dart';
import '../services/supabase_service.dart';

class AboutSection extends StatefulWidget {
  const AboutSection({super.key});

  @override
  State<AboutSection> createState() => _AboutSectionState();
}

class _AboutSectionState extends State<AboutSection> {
  // Defaults matching the original hardcoded values
  List<String> _paragraphs = [
    "Hi! I'm Harikrishnan R, a passionate DevOps Engineer from India with hands-on expertise in cloud infrastructure, containerization, and CI/CD automation.",
    'I specialize in building and scaling infrastructure on AWS — architecting multi-region deployments, automating software delivery pipelines with Jenkins, and containerizing applications with Docker and ECS Fargate.',
    'My goal is to bridge the gap between development and operations by implementing robust DevOps practices that increase velocity, reliability, and security of software systems.',
  ];
  String _location = 'India';
  String _role = 'DevOps Engineer';
  String _certification = 'L&T EduTech Certified';
  String _imageUrl = '';

  @override
  void initState() {
    super.initState();
    _imageUrl = dotenv.env['ABOUT_IMAGE_URL'] ?? '';
    _loadAboutData();
  }

  Future<void> _loadAboutData() async {
    final data = await SupabaseService.instance.getAboutData();
    if (data != null && mounted) {
      setState(() {
        // paragraphs can be a Postgres text[] array or JSON array
        final parasRaw = data['paragraphs'];
        if (parasRaw is List && parasRaw.isNotEmpty) {
          _paragraphs = parasRaw.map((e) => e.toString()).toList();
        }
        _location = data['location'] as String? ?? _location;
        _role = data['role'] as String? ?? _role;
        _certification = data['certification'] as String? ?? _certification;
        final img = data['image_url'] as String?;
        if (img != null && img.isNotEmpty) _imageUrl = img;
      });
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
        ..._paragraphs.map((p) => Padding(
              padding: const EdgeInsets.only(bottom: 16),
              child: Text(p, style: textTheme.bodyLarge?.copyWith(height: 1.8)),
            )),
        const SizedBox(height: 12),
        Wrap(
          spacing: 20,
          runSpacing: 12,
          children: [
            _buildInfoChip(Icons.location_on_rounded, _location, c),
            _buildInfoChip(Icons.work_rounded, _role, c),
            _buildInfoChip(Icons.verified_rounded, _certification, c),
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
    return Center(child: _HoverImage(imageUrl: _imageUrl));
  }
}

class _HoverImage extends StatefulWidget {
  final String imageUrl;
  const _HoverImage({required this.imageUrl});

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
    _tilt = Tween<double>(begin: 0, end: 0.05)
        .animate(CurvedAnimation(parent: _ctrl, curve: Curves.easeOutCubic));
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
      onEnter: (_) { setState(() => _hovered = true); _ctrl.forward(); },
      onExit: (_) { setState(() => _hovered = false); _ctrl.reverse(); },
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
            child: widget.imageUrl.isNotEmpty
                ? Image.network(widget.imageUrl, fit: BoxFit.cover)
                : Container(color: c.secondary),
          ),
        ),
      ),
    );
  }
}
