import 'package:flutter/material.dart';
import 'dart:async';
import 'dart:math';
import 'package:animate_do/animate_do.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import '../theme/app_colors.dart';
import '../services/supabase_service.dart';
import 'hover_widgets.dart';
import 'three_d_widgets.dart';

class HeroSection extends StatefulWidget {
  final VoidCallback onProjectsClick;
  const HeroSection({super.key, required this.onProjectsClick});

  @override
  State<HeroSection> createState() => _HeroSectionState();
}

class _HeroSectionState extends State<HeroSection>
    with TickerProviderStateMixin {
  late AnimationController _fadeCtrl;
  late AnimationController _particleCtrl;
  late Animation<double> _fadeAnimation;
  late Animation<Offset> _slideAnimation;
  Offset _mouseOffset = Offset.zero;

  // Dynamic data with defaults
  String _greeting = 'Hi, my name is';
  String _name = 'Harikrishnan R.';
  String _subtitle = 'I build as a ';
  String _description =
      'A passionate DevOps Engineer specializing in scalable AWS infrastructure, CI/CD pipelines with Jenkins, and containerized apps using Docker & ECS Fargate.';
  String _ctaText = 'Check out my projects!';
  List<String> _roles = [
    'DevOps Engineer',
    'Cloud Architect',
    'CI/CD Specialist',
    'Docker & AWS Expert',
    'Infrastructure Builder',
  ];

  int _roleIndex = 0;
  String _displayedText = '';
  int _charIndex = 0;
  bool _isDeleting = false;
  Timer? _typeTimer;

  @override
  void initState() {
    super.initState();
    _fadeCtrl = AnimationController(
        duration: const Duration(milliseconds: 1800), vsync: this);
    _particleCtrl =
        AnimationController(duration: const Duration(seconds: 8), vsync: this)
          ..repeat();
    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _fadeCtrl, curve: const Interval(0.0, 0.5, curve: Curves.easeIn)),
    );
    _slideAnimation =
        Tween<Offset>(begin: const Offset(0, 0.3), end: Offset.zero).animate(
      CurvedAnimation(parent: _fadeCtrl, curve: const Interval(0.1, 0.6, curve: Curves.easeOutCubic)),
    );
    _fadeCtrl.forward();
    _loadHeroData();
    Future.delayed(const Duration(milliseconds: 900), _startTypewriter);
  }

  Future<void> _loadHeroData() async {
    final data = await SupabaseService.instance.getHeroData();
    if (data != null && mounted) {
      setState(() {
        _greeting = data['greeting'] as String? ?? _greeting;
        _name = data['name'] as String? ?? _name;
        _subtitle = data['subtitle'] as String? ?? _subtitle;
        _description = data['description'] as String? ?? _description;
        _ctaText = data['cta_text'] as String? ?? _ctaText;
        final rolesRaw = data['roles'];
        if (rolesRaw is List && rolesRaw.isNotEmpty) {
          _roles = rolesRaw.map((e) => e.toString()).toList();
        }
      });
    }
  }

  void _startTypewriter() {
    _typeTimer = Timer.periodic(
      Duration(milliseconds: _isDeleting ? 55 : 95),
      (_) {
        if (!mounted) return;
        final fullText = _roles[_roleIndex];
        setState(() {
          if (_isDeleting) {
            _charIndex--;
            _displayedText = fullText.substring(0, _charIndex);
          } else {
            _charIndex++;
            _displayedText = fullText.substring(0, _charIndex);
          }
          if (!_isDeleting && _charIndex == fullText.length) {
            _typeTimer?.cancel();
            Future.delayed(const Duration(milliseconds: 2000), () {
              if (mounted) { _isDeleting = true; _startTypewriter(); }
            });
          } else if (_isDeleting && _charIndex == 0) {
            _isDeleting = false;
            _roleIndex = (_roleIndex + 1) % _roles.length;
            _typeTimer?.cancel();
            Future.delayed(const Duration(milliseconds: 350), _startTypewriter);
          }
        });
      },
    );
  }

  @override
  void dispose() {
    _fadeCtrl.dispose();
    _particleCtrl.dispose();
    _typeTimer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;
    final screenWidth = MediaQuery.of(context).size.width;
    final screenHeight = MediaQuery.of(context).size.height;
    final isMobile = screenWidth < 800;
    final c = AppColorScheme.of(context);

    return MouseRegion(
      onHover: (e) {
        final dx = (e.localPosition.dx / screenWidth - 0.5) * 2;
        final dy = (e.localPosition.dy / screenHeight - 0.5) * 2;
        setState(() => _mouseOffset = Offset(dx, dy));
      },
      onExit: (_) => setState(() => _mouseOffset = Offset.zero),
      child: Stack(
        children: [
          Positioned.fill(
            child: AnimatedBuilder(
              animation: _particleCtrl,
              builder: (context, child) => CustomPaint(
                painter: _ParticlePainter(_particleCtrl.value, c.accent),
              ),
            ),
          ),
          Positioned.fill(child: _AmbientShapes(accent: c.accent)),
          Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // ── Upper: Headline + Typewriter + (DevOpsOrbit on desktop) ──
              Container(
                padding: EdgeInsets.symmetric(
                  horizontal: isMobile ? 24 : 100,
                  vertical: 0,
                ),
                child: Padding(
                  padding: EdgeInsets.only(top: isMobile ? 100 : 120),
                  child: isMobile
                      ? _buildHeadline(textTheme, c, isMobile)
                      : Row(
                          crossAxisAlignment: CrossAxisAlignment.center,
                          children: [
                            Expanded(flex: 3, child: _buildHeadline(textTheme, c, isMobile)),
                            const SizedBox(width: 40),
                            Expanded(
                              flex: 2,
                              child: TweenAnimationBuilder<Offset>(
                                tween: Tween(begin: Offset.zero, end: Offset(_mouseOffset.dx * -12, _mouseOffset.dy * -12)),
                                duration: const Duration(milliseconds: 300),
                                builder: (_, off, child) => Transform.translate(offset: off, child: child),
                                child: const DevOpsOrbit(size: 340),
                              ),
                            ),
                          ],
                        ),
                ),
              ),

              // ── Center: Tech Stack Ticker ───────────────────────────────
              SizedBox(height: isMobile ? 40 : 52),
              const _SkillTickerRow(),
              SizedBox(height: isMobile ? 40 : 52),

              // ── Lower: Description + CTA ────────────────────────────────
              Container(
                padding: EdgeInsets.symmetric(
                  horizontal: isMobile ? 24 : 100,
                ),
                child: _buildDescription(textTheme, c, isMobile),
              ),
              const SizedBox(height: 60),
            ],
          ),
        ],
      ),
    );
  }

  // ── Headline block: greeting → name → typewriter ────────────────────────
  Widget _buildHeadline(TextTheme textTheme, AppColorScheme c, bool isMobile) {
    return TweenAnimationBuilder<Offset>(
      tween: Tween(begin: Offset.zero, end: Offset(_mouseOffset.dx * 8, _mouseOffset.dy * 8)),
      duration: const Duration(milliseconds: 350),
      builder: (_, off, child) => Transform.translate(offset: off, child: child),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          FadeTransition(
            opacity: _fadeAnimation,
            child: Text(_greeting, style: textTheme.bodyLarge?.copyWith(
              color: c.accent, fontFamily: 'Roboto Mono', fontSize: 16, letterSpacing: 1.2,
            )),
          ),
          const SizedBox(height: 18),
          SlideTransition(
            position: _slideAnimation,
            child: FadeTransition(
              opacity: _fadeAnimation,
              child: Text(_name, style: textTheme.displayLarge?.copyWith(
                fontSize: isMobile ? 46 : 76, letterSpacing: -1,
              )),
            ),
          ),
          const SizedBox(height: 10),
          SlideTransition(
            position: _slideAnimation,
            child: FadeTransition(
              opacity: _fadeAnimation,
              child: Wrap(
                crossAxisAlignment: WrapCrossAlignment.center,
                children: [
                  Text(_subtitle, style: textTheme.displayMedium?.copyWith(
                    color: c.textSecondary, fontSize: isMobile ? 24 : 38,
                  )),
                  Text(_displayedText, style: textTheme.displayMedium?.copyWith(
                    color: c.accent, fontSize: isMobile ? 24 : 38,
                  )),
                  _BlinkingCursor(fontSize: isMobile ? 24 : 38, accentColor: c.accent),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ── Description + CTA block ─────────────────────────────────────────────
  Widget _buildDescription(TextTheme textTheme, AppColorScheme c, bool isMobile) {
    return SlideTransition(
      position: _slideAnimation,
      child: FadeTransition(
        opacity: _fadeAnimation,
        child: Column(
          crossAxisAlignment: isMobile ? CrossAxisAlignment.start : CrossAxisAlignment.center,
          children: [
            SizedBox(
              width: isMobile ? double.infinity : 640,
              child: Text(
                _description,
                textAlign: isMobile ? TextAlign.start : TextAlign.center,
                style: textTheme.bodyLarge?.copyWith(height: 1.9, fontSize: 16),
              ),
            ),
            const SizedBox(height: 40),
            FadeInUp(
              delay: const Duration(milliseconds: 1100),
              duration: const Duration(milliseconds: 600),
              child: HoverElevatedButton(label: _ctaText, onPressed: widget.onProjectsClick),
            ),
          ],
        ),
      ),
    );
  }
}

// ── Blinking Cursor ───────────────────────────────────────────────────────────
class _BlinkingCursor extends StatefulWidget {
  final double fontSize;
  final Color accentColor;
  const _BlinkingCursor({this.fontSize = 38, required this.accentColor});
  @override
  State<_BlinkingCursor> createState() => _BlinkingCursorState();
}

class _BlinkingCursorState extends State<_BlinkingCursor>
    with SingleTickerProviderStateMixin {
  late final AnimationController _blink = AnimationController(
      vsync: this, duration: const Duration(milliseconds: 550))
    ..repeat(reverse: true);
  @override
  void dispose() { _blink.dispose(); super.dispose(); }
  @override
  Widget build(BuildContext context) {
    return FadeTransition(
      opacity: _blink,
      child: Text('|', style: TextStyle(
          color: widget.accentColor, fontSize: widget.fontSize, fontWeight: FontWeight.w200)),
    );
  }
}

// ── Ambient floating shapes ───────────────────────────────────────────────────
class _AmbientShapes extends StatefulWidget {
  final Color accent;
  const _AmbientShapes({required this.accent});
  @override
  State<_AmbientShapes> createState() => _AmbientShapesState();
}

class _AmbientShapesState extends State<_AmbientShapes>
    with SingleTickerProviderStateMixin {
  late final AnimationController _ctrl =
      AnimationController(vsync: this, duration: const Duration(seconds: 12))..repeat();
  static final _rng = Random(55);
  static final _shapes = List.generate(10, (i) => (
    x: _rng.nextDouble(), y: _rng.nextDouble(), r: _rng.nextDouble() * 25 + 8.0,
    spd: _rng.nextDouble() * 0.4 + 0.1, rot: _rng.nextDouble() * 0.5 + 0.1,
    t: i % 3, op: _rng.nextDouble() * 0.05 + 0.015, ph: _rng.nextDouble(),
  ));
  @override
  void dispose() { _ctrl.dispose(); super.dispose(); }
  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _ctrl,
      builder: (context, child) => CustomPaint(
        painter: _AmbientPainter(_ctrl.value, widget.accent, _shapes),
      ),
    );
  }
}

class _AmbientPainter extends CustomPainter {
  final double prog;
  final Color accent;
  final List<({double x, double y, double r, double spd, double rot, int t, double op, double ph})> shapes;
  _AmbientPainter(this.prog, this.accent, this.shapes);
  @override
  void paint(Canvas canvas, Size size) {
    for (final s in shapes) {
      final t = (prog + s.ph) % 1.0;
      final x = s.x * size.width;
      final y = (s.y * size.height + sin(t * 2 * pi) * 20 * s.spd) % size.height;
      final rot = t * 2 * pi * s.rot;
      final paint = Paint()..color = accent.withValues(alpha: s.op)..style = PaintingStyle.stroke..strokeWidth = 1.0;
      canvas.save();
      canvas.translate(x, y);
      canvas.rotate(rot);
      if (s.t == 0) {
        canvas.drawPath(Path()..moveTo(0, -s.r / 2)..lineTo(s.r / 2, s.r / 2)..lineTo(-s.r / 2, s.r / 2)..close(), paint);
      } else if (s.t == 1) {
        canvas.drawRect(Rect.fromCenter(center: Offset.zero, width: s.r, height: s.r), paint);
      } else {
        final hex = Path();
        for (int i = 0; i < 6; i++) {
          final a = i * pi / 3 - pi / 6;
          if (i == 0) { hex.moveTo(cos(a) * s.r / 2, sin(a) * s.r / 2); }
          else { hex.lineTo(cos(a) * s.r / 2, sin(a) * s.r / 2); }
        }
        hex.close();
        canvas.drawPath(hex, paint);
      }
      canvas.restore();
    }
  }
  @override
  bool shouldRepaint(_AmbientPainter old) => old.prog != prog || old.accent != accent;
}

// ── Particle background ───────────────────────────────────────────────────────
class _Particle {
  late double x, y, radius, opacity, speed, angle;
  _Particle(Random rng, Size size) {
    x = rng.nextDouble() * size.width; y = rng.nextDouble() * size.height;
    radius = rng.nextDouble() * 2.2 + 0.4; opacity = rng.nextDouble() * 0.35 + 0.05;
    speed = rng.nextDouble() * 0.3 + 0.05; angle = rng.nextDouble() * 2 * pi;
  }
}

class _ParticlePainter extends CustomPainter {
  final double progress;
  final Color accentColor;
  static final _rng = Random(42);
  static List<_Particle>? _particles;
  _ParticlePainter(this.progress, this.accentColor);
  @override
  void paint(Canvas canvas, Size size) {
    _particles ??= List.generate(60, (_) => _Particle(_rng, size));
    final paint = Paint();
    for (final p in _particles!) {
      final dx = p.x + cos(p.angle + progress * 2 * pi) * p.speed * 80;
      final dy = p.y + sin(p.angle + progress * 2 * pi) * p.speed * 80;
      paint.color = accentColor.withValues(alpha: p.opacity);
      canvas.drawCircle(Offset(dx % size.width, dy % size.height), p.radius, paint);
    }
  }
  @override
  bool shouldRepaint(_ParticlePainter old) => old.progress != progress || old.accentColor != accentColor;
}

// ── Skill Ticker Row ──────────────────────────────────────────────────────────
class _SkillTickerRow extends StatefulWidget {
  const _SkillTickerRow();
  @override
  State<_SkillTickerRow> createState() => _SkillTickerRowState();
}

class _SkillTickerRowState extends State<_SkillTickerRow>
    with SingleTickerProviderStateMixin {
  late AnimationController _ctrl;
  static const double _chipWidth = 140.0;
  static const double _chipMargin = 14.0;
  static const double _itemTotalWidth = _chipWidth + _chipMargin;
  static final List<(String, Widget Function(Color))> _skills = [
    ('AWS',       (c) => FaIcon(FontAwesomeIcons.aws,    color: c, size: 18)),
    ('Docker',    (c) => FaIcon(FontAwesomeIcons.docker, color: c, size: 18)),
    ('Linux',     (c) => FaIcon(FontAwesomeIcons.linux,  color: c, size: 18)),
    ('Git',       (c) => FaIcon(FontAwesomeIcons.git,    color: c, size: 18)),
    ('GitHub',    (c) => FaIcon(FontAwesomeIcons.github, color: c, size: 18)),
    ('Jenkins',   (c) => Icon(Icons.settings_backup_restore_rounded, color: c, size: 18)),
    ('SonarQube', (c) => Icon(Icons.shield_rounded, color: c, size: 18)),
    ('EC2',       (c) => Icon(Icons.cloud_queue_rounded, color: c, size: 18)),
    ('ECS',       (c) => Icon(Icons.layers_rounded, color: c, size: 18)),
    ('Route 53',  (c) => Icon(Icons.dns_rounded, color: c, size: 18)),
    ('IAM',       (c) => Icon(Icons.admin_panel_settings_rounded, color: c, size: 18)),
    ('Ubuntu',    (c) => Icon(Icons.terminal_rounded, color: c, size: 18)),
  ];

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(vsync: this, duration: const Duration(seconds: 22))..repeat();
  }
  @override
  void dispose() { _ctrl.dispose(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    final c = AppColorScheme.of(context);
    final singleCopyWidth = _skills.length * _itemTotalWidth;
    final allItems = [..._skills, ..._skills, ..._skills];
    final chips = allItems.map((s) => _buildSkillChip(s.$1, s.$2, c)).toList();

    return Column(
      children: [
        // ── Centered label with decorative lines ──────────────────────
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 40),
          child: Row(
            children: [
              Expanded(child: Container(height: 1, color: c.accent.withValues(alpha: 0.12))),
              const SizedBox(width: 16),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                decoration: BoxDecoration(
                  border: Border.all(color: c.accent.withValues(alpha: 0.25)),
                  borderRadius: BorderRadius.circular(20),
                  color: c.accent.withValues(alpha: 0.06),
                ),
                child: Text('TECH STACK', style: TextStyle(
                  color: c.accent.withValues(alpha: 0.8), fontSize: 11,
                  fontFamily: 'Roboto Mono', letterSpacing: 3,
                  fontWeight: FontWeight.w600,
                )),
              ),
              const SizedBox(width: 16),
              Expanded(child: Container(height: 1, color: c.accent.withValues(alpha: 0.12))),
            ],
          ),
        ),
        const SizedBox(height: 20),

        // ── Ticker with gradient edge fading ──────────────────────────
        SizedBox(
          height: 60,
          child: ShaderMask(
            shaderCallback: (Rect bounds) {
              return LinearGradient(
                colors: [
                  Colors.transparent,
                  Colors.white,
                  Colors.white,
                  Colors.transparent,
                ],
                stops: const [0.0, 0.08, 0.92, 1.0],
              ).createShader(bounds);
            },
            blendMode: BlendMode.dstIn,
            child: ClipRect(
              child: AnimatedBuilder(
                animation: _ctrl,
                builder: (context, child) => Transform.translate(
                  offset: Offset(-(_ctrl.value * singleCopyWidth), 0),
                  child: child,
                ),
                child: OverflowBox(
                  maxWidth: double.infinity,
                  alignment: Alignment.centerLeft,
                  child: Row(mainAxisSize: MainAxisSize.min, children: chips),
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildSkillChip(String label, Widget Function(Color) iconBuilder, AppColorScheme c) {
    return Container(
      width: _chipWidth,
      margin: EdgeInsets.symmetric(horizontal: _chipMargin / 2, vertical: 4),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: c.secondary,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: c.accent.withValues(alpha: 0.2), width: 1),
        boxShadow: [
          BoxShadow(color: c.accent.withValues(alpha: 0.08), blurRadius: 12, offset: const Offset(0, 4)),
        ],
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          iconBuilder(c.accent),
          const SizedBox(width: 10),
          Flexible(child: Text(label, overflow: TextOverflow.ellipsis, style: TextStyle(
            color: c.text, fontSize: 13, fontFamily: 'Roboto Mono', fontWeight: FontWeight.w500,
          ))),
        ],
      ),
    );
  }
}
