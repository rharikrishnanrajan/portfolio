import 'package:flutter/material.dart';
import 'dart:math';
import 'package:visibility_detector/visibility_detector.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../theme/app_colors.dart';

// ─────────────────────────────────────────────────────────────────────────────
// AnimatedTextMask — animated gradient text masking
// ─────────────────────────────────────────────────────────────────────────────
class AnimatedTextMask extends StatefulWidget {
  final String text;
  final TextStyle style;
  final Color accentColor;

  const AnimatedTextMask({super.key, required this.text, required this.style, required this.accentColor});

  @override
  State<AnimatedTextMask> createState() => _AnimatedTextMaskState();
}

class _AnimatedTextMaskState extends State<AnimatedTextMask> with SingleTickerProviderStateMixin {
  late final AnimationController _ctrl = AnimationController(vsync: this, duration: const Duration(seconds: 4))..repeat();

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _ctrl,
      builder: (context, child) {
        return ShaderMask(
          blendMode: BlendMode.srcIn,
          shaderCallback: (bounds) {
            return LinearGradient(
              colors: [
                widget.accentColor,
                const Color(0xFF00D4FF),
                widget.accentColor,
                const Color(0xFF00D4FF),
                widget.accentColor,
              ],
              stops: const [0.0, 0.25, 0.5, 0.75, 1.0],
              transform: GradientRotation(_ctrl.value * 2 * pi),
            ).createShader(bounds);
          },
          child: Text(widget.text, style: widget.style),
        );
      },
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ScrollReveal — animate when visible in viewport
// ─────────────────────────────────────────────────────────────────────────────
class ScrollReveal extends StatefulWidget {
  final Widget child;
  final Duration delay;
  final double yOffset;

  const ScrollReveal({super.key, required this.child, this.delay = Duration.zero, this.yOffset = 0.15});

  @override
  State<ScrollReveal> createState() => _ScrollRevealState();
}

class _ScrollRevealState extends State<ScrollReveal> {
  bool _isVisible = false;
  late final Key _key = UniqueKey();

  @override
  Widget build(BuildContext context) {
    return VisibilityDetector(
      key: _key,
      onVisibilityChanged: (info) {
        if (info.visibleFraction > 0.05 && !_isVisible) {
          if (mounted) {
            setState(() => _isVisible = true);
          }
        }
      },
      child: _isVisible
          ? widget.child
              .animate(delay: widget.delay)
              .fadeIn(duration: 600.ms, curve: Curves.easeOut)
              .slideY(begin: widget.yOffset, end: 0, duration: 600.ms, curve: Curves.easeOutCubic)
          : Opacity(opacity: 0, child: widget.child),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ScrollAnimatedWidget — 3-D perspective entrance on mount
// ─────────────────────────────────────────────────────────────────────────────
class ScrollAnimatedWidget extends StatefulWidget {
  final Widget child;
  final Duration delay;
  final Duration duration;
  final Offset beginOffset;

  const ScrollAnimatedWidget({
    super.key,
    required this.child,
    this.delay = Duration.zero,
    this.duration = const Duration(milliseconds: 600),
    this.beginOffset = const Offset(0, 0.15),
  });

  @override
  State<ScrollAnimatedWidget> createState() => _ScrollAnimatedWidgetState();
}

class _ScrollAnimatedWidgetState extends State<ScrollAnimatedWidget>
    with SingleTickerProviderStateMixin {
  late AnimationController _ctrl;
  late Animation<double> _opacity;
  late Animation<Offset> _slide;
  late Animation<double> _persp;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(vsync: this, duration: widget.duration);
    _opacity = Tween<double>(begin: 0, end: 1).animate(
        CurvedAnimation(parent: _ctrl, curve: Curves.easeOut));
    _slide = Tween<Offset>(begin: widget.beginOffset, end: Offset.zero)
        .animate(CurvedAnimation(parent: _ctrl, curve: Curves.easeOutCubic));
    _persp = Tween<double>(begin: 0.04, end: 0).animate(
        CurvedAnimation(parent: _ctrl, curve: Curves.easeOutCubic));

    WidgetsBinding.instance.addPostFrameCallback((_) {
      Future.delayed(widget.delay, () {
        if (mounted) _ctrl.forward();
      });
    });
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _ctrl,
      builder: (_, child) => Opacity(
        opacity: _opacity.value,
        child: Transform(
          alignment: Alignment.center,
          transform: Matrix4.identity()
            ..setEntry(3, 2, 0.001)
            ..rotateX(_persp.value),
          child: SlideTransition(position: _slide, child: child),
        ),
      ),
      child: widget.child,
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// AnimatedSkillBar — premium 3-D skill card with loading-bar animation
// ─────────────────────────────────────────────────────────────────────────────
class AnimatedSkillBar extends StatefulWidget {
  final String category;
  final List<String> skills;
  final double progress;
  final Duration delay;

  const AnimatedSkillBar({
    super.key,
    required this.category,
    required this.skills,
    required this.progress,
    this.delay = Duration.zero,
  });

  @override
  State<AnimatedSkillBar> createState() => _AnimatedSkillBarState();
}

class _AnimatedSkillBarState extends State<AnimatedSkillBar>
    with TickerProviderStateMixin {
  // Bar fill
  late AnimationController _fillCtrl;
  late Animation<double> _fillAnim;
  // Shimmer sweep (repeating after fill)
  late AnimationController _shimmerCtrl;
  late Animation<double> _shimmerAnim;
  // Card entrance (fade + 3-D tilt)
  late AnimationController _entranceCtrl;
  late Animation<double> _fadeAnim;
  late Animation<double> _tiltAnim;
  // Icon ring rotation
  late AnimationController _ringCtrl;
  // Pulse on the leading dot
  late AnimationController _pulseCtrl;
  late Animation<double> _pulseAnim;

  bool _hovered = false;

  // Icon per category
  static const _iconMap = {
    'Cloud Platforms (AWS)': Icons.cloud_queue_rounded,
    'Containerization': Icons.layers_rounded,
    'CI/CD Tools': Icons.settings_backup_restore_rounded,
    'Security & Quality': Icons.security_rounded,
    'Version Control': Icons.fork_right_rounded,
    'Operating Systems': Icons.terminal_rounded,
  };

  @override
  void initState() {
    super.initState();

    _entranceCtrl = AnimationController(
        vsync: this, duration: const Duration(milliseconds: 700));
    _fadeAnim = Tween<double>(begin: 0, end: 1).animate(
        CurvedAnimation(parent: _entranceCtrl, curve: Curves.easeOut));
    _tiltAnim = Tween<double>(begin: 0.1, end: 0).animate(
        CurvedAnimation(parent: _entranceCtrl, curve: Curves.easeOutCubic));

    _fillCtrl = AnimationController(
        vsync: this, duration: const Duration(milliseconds: 1400));
    _fillAnim = Tween<double>(begin: 0, end: widget.progress).animate(
        CurvedAnimation(parent: _fillCtrl, curve: Curves.easeOutCubic));

    _shimmerCtrl = AnimationController(
        vsync: this, duration: const Duration(milliseconds: 900));
    _shimmerAnim = Tween<double>(begin: 0, end: 1).animate(
        CurvedAnimation(parent: _shimmerCtrl, curve: Curves.easeInOut));

    _ringCtrl = AnimationController(
        vsync: this, duration: const Duration(seconds: 4))
      ..repeat();

    _pulseCtrl = AnimationController(
        vsync: this, duration: const Duration(milliseconds: 800))
      ..repeat(reverse: true);
    _pulseAnim = Tween<double>(begin: 0.4, end: 1.0).animate(
        CurvedAnimation(parent: _pulseCtrl, curve: Curves.easeInOut));

    WidgetsBinding.instance.addPostFrameCallback((_) {
      Future.delayed(widget.delay, () async {
        if (!mounted) return;
        _entranceCtrl.forward();
        await Future.delayed(const Duration(milliseconds: 200));
        if (!mounted) return;
        await _fillCtrl.forward();
        if (!mounted) return;
        _shimmerCtrl.repeat();
      });
    });
  }

  @override
  void dispose() {
    _entranceCtrl.dispose();
    _fillCtrl.dispose();
    _shimmerCtrl.dispose();
    _ringCtrl.dispose();
    _pulseCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final c = AppColorScheme.of(context);
    final icon = _iconMap[widget.category] ?? Icons.code_rounded;

    return AnimatedBuilder(
      animation: _entranceCtrl,
      builder: (_, child) => Opacity(
        opacity: _fadeAnim.value,
        child: Transform(
          alignment: Alignment.center,
          transform: Matrix4.identity()
            ..setEntry(3, 2, 0.001)
            ..rotateX(_tiltAnim.value),
          child: child,
        ),
      ),
      child: MouseRegion(
        onEnter: (_) => setState(() => _hovered = true),
        onExit: (_) => setState(() => _hovered = false),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 250),
          margin: const EdgeInsets.only(bottom: 20),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(16),
            // Glassmorphism-style gradient border
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [
                c.accent.withValues(alpha: _hovered ? 0.5 : 0.2),
                c.accent.withValues(alpha: 0.05),
                c.accent.withValues(alpha: _hovered ? 0.3 : 0.1),
              ],
            ),
            boxShadow: [
              BoxShadow(
                color: c.accent
                    .withValues(alpha: _hovered ? 0.18 : 0.06),
                blurRadius: _hovered ? 32 : 12,
                spreadRadius: _hovered ? 2 : 0,
                offset: const Offset(0, 6),
              ),
            ],
          ),
          child: Container(
            margin: const EdgeInsets.all(1.5), // border width
            padding: const EdgeInsets.all(22),
            decoration: BoxDecoration(
              color: c.secondary,
              borderRadius: BorderRadius.circular(15),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // ── Header row ───────────────────────────────────────────
                Row(
                  children: [
                    // 3-D rotating icon badge
                    _IconBadge(
                        icon: icon,
                        ringCtrl: _ringCtrl,
                        accent: c.accent),
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
                      builder: (context, child) => _GlowCounter(
                        value:
                            (_fillAnim.value * 100).toInt(),
                        accent: c.accent,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 18),

                // ── Loading bar ──────────────────────────────────────────
                AnimatedBuilder(
                  animation: Listenable.merge(
                      [_fillAnim, _shimmerAnim, _pulseAnim]),
                  builder: (context, child) => _LoadingBar(
                    progress: _fillAnim.value / widget.progress.clamp(0.01, 1),
                    filled: _fillAnim.value,
                    shimmer: _shimmerAnim.value,
                    pulse: _pulseAnim.value,
                    accent: c.accent,
                    isDark: c.isDark,
                  ),
                ),

                const SizedBox(height: 16),

                // ── Skill chips ──────────────────────────────────────────
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: widget.skills.map((skill) {
                    return AnimatedContainer(
                      duration: const Duration(milliseconds: 200),
                      padding: const EdgeInsets.symmetric(
                          horizontal: 12, vertical: 5),
                      decoration: BoxDecoration(
                        color: _hovered
                            ? c.accent.withValues(alpha: 0.15)
                            : c.accent.withValues(alpha: 0.07),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(
                            color: c.accent
                                .withValues(alpha: _hovered ? 0.5 : 0.25)),
                      ),
                      child: Text(
                        skill,
                        style: TextStyle(
                          fontSize: 12,
                          color: c.accent,
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
      ),
    );
  }
}

// ── Glowing percentage counter ────────────────────────────────────────────────
class _GlowCounter extends StatelessWidget {
  final int value;
  final Color accent;
  const _GlowCounter({required this.value, required this.accent});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: accent.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: accent.withValues(alpha: 0.3)),
        boxShadow: [
          BoxShadow(
              color: accent.withValues(alpha: 0.2),
              blurRadius: 8,
              spreadRadius: 0)
        ],
      ),
      child: Text(
        '$value%',
        style: TextStyle(
          color: accent,
          fontFamily: 'Roboto Mono',
          fontWeight: FontWeight.bold,
          fontSize: 13,
          shadows: [Shadow(color: accent.withValues(alpha: 0.5), blurRadius: 6)],
        ),
      ),
    );
  }
}

// ── 3-D rotating icon badge ───────────────────────────────────────────────────
class _IconBadge extends StatelessWidget {
  final IconData icon;
  final AnimationController ringCtrl;
  final Color accent;

  const _IconBadge(
      {required this.icon, required this.ringCtrl, required this.accent});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 46,
      height: 46,
      child: Stack(
        alignment: Alignment.center,
        children: [
          // Rotating ring
          AnimatedBuilder(
            animation: ringCtrl,
            builder: (context, child) => Transform.rotate(
              angle: ringCtrl.value * 2 * pi,
              child: CustomPaint(
                size: const Size(46, 46),
                painter: _RingPainter(accent: accent),
              ),
            ),
          ),
          // Icon
          Container(
            width: 34,
            height: 34,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: accent.withValues(alpha: 0.1),
              boxShadow: [
                BoxShadow(
                    color: accent.withValues(alpha: 0.3),
                    blurRadius: 10,
                    spreadRadius: 0)
              ],
            ),
            child: Icon(icon, color: accent, size: 18),
          ),
        ],
      ),
    );
  }
}

class _RingPainter extends CustomPainter {
  final Color accent;
  const _RingPainter({required this.accent});

  @override
  void paint(Canvas canvas, Size size) {
    final cx = size.width / 2;
    final cy = size.height / 2;
    final r = size.width / 2 - 1;

    // Dashed arc
    final paint = Paint()
      ..color = accent.withValues(alpha: 0.5)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.5;

    // Draw dotted ring
    for (int i = 0; i < 12; i++) {
      final start = i * (2 * pi / 12);
      canvas.drawArc(Rect.fromCircle(center: Offset(cx, cy), radius: r), start,
          0.25, false, paint);
    }

    // Bright dot at top
    canvas.drawCircle(Offset(cx, cy - r), 2.5,
        Paint()..color = accent.withValues(alpha: 0.9));
  }

  @override
  bool shouldRepaint(_RingPainter old) => old.accent != accent;
}

// ── Loading bar CustomPainter ─────────────────────────────────────────────────
class _LoadingBar extends StatelessWidget {
  final double progress; // animated 0→1 (normalised relative to target)
  final double filled; // actual filled fraction
  final double shimmer; // 0→1 sweep position
  final double pulse; // 0→1 pulse opacity
  final Color accent;
  final bool isDark;

  const _LoadingBar({
    required this.progress,
    required this.filled,
    required this.shimmer,
    required this.pulse,
    required this.accent,
    required this.isDark,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 14,
      child: CustomPaint(
        painter: _BarPainter(
          filled: filled,
          shimmer: shimmer,
          pulse: pulse,
          accent: accent,
          isDark: isDark,
        ),
      ),
    );
  }
}

class _BarPainter extends CustomPainter {
  final double filled;
  final double shimmer;
  final double pulse;
  final Color accent;
  final bool isDark;

  _BarPainter({
    required this.filled,
    required this.shimmer,
    required this.pulse,
    required this.accent,
    required this.isDark,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final h = size.height;
    final w = size.width;
    final r = Radius.circular(h / 2);

    // ── Track ────────────────────────────────────────────────────────
    final trackRRect =
        RRect.fromRectAndRadius(Rect.fromLTWH(0, 0, w, h), r);
    canvas.drawRRect(
        trackRRect,
        Paint()
          ..color = accent.withValues(
              alpha: isDark ? 0.08 : 0.12));

    // Segment ticks on track
    final segCount = 20;
    for (int i = 1; i < segCount; i++) {
      final x = w * i / segCount;
      canvas.drawLine(
          Offset(x, 2),
          Offset(x, h - 2),
          Paint()
            ..color =
                (isDark ? Colors.black : Colors.white).withValues(alpha: 0.15)
            ..strokeWidth = 1.0);
    }

    // ── Filled portion ────────────────────────────────────────────────
    final fillW = (w * filled).clamp(0.0, w);
    if (fillW < 2) return;

    final fillRect = Rect.fromLTWH(0, 0, fillW, h);
    final fillRRect = RRect.fromRectAndRadius(fillRect, r);

    // Gradient fill
    canvas.drawRRect(
        fillRRect,
        Paint()
          ..shader = LinearGradient(
            colors: [
              accent.withValues(alpha: 0.9),
              const Color(0xFF00D4FF),
            ],
          ).createShader(fillRect));

    // Shimmer sweep
    final shimX = fillW * shimmer;
    const sw = 60.0;
    if (shimX > 0) {
      final shimLeft = (shimX - sw).clamp(0.0, fillW);
      final shimRight = shimX.clamp(0.0, fillW);
      if (shimRight > shimLeft) {
        final shimRect = Rect.fromLTWH(shimLeft, 0, shimRight - shimLeft, h);
        canvas.save();
        canvas.clipRRect(fillRRect);
        canvas.drawRect(
            shimRect,
            Paint()
              ..shader = LinearGradient(
                colors: [
                  Colors.white.withValues(alpha: 0.0),
                  Colors.white.withValues(alpha: 0.45),
                  Colors.white.withValues(alpha: 0.0),
                ],
              ).createShader(shimRect));
        canvas.restore();
      }
    }

    // Leading-edge glow dot
    final dotX = fillW;
    final dotR = h * 0.7;
    // Outer glow
    canvas.drawCircle(
        Offset(dotX, h / 2),
        dotR * 2.2,
        Paint()
          ..color = accent.withValues(alpha: 0.25 * pulse)
          ..maskFilter =
              const MaskFilter.blur(BlurStyle.normal, 8));
    // Inner bright dot
    canvas.drawCircle(
        Offset(dotX, h / 2),
        dotR,
        Paint()..color = Colors.white.withValues(alpha: 0.9));
    canvas.drawCircle(
        Offset(dotX, h / 2),
        dotR * 0.5,
        Paint()..color = accent);
  }

  @override
  bool shouldRepaint(_BarPainter old) =>
      old.filled != filled ||
      old.shimmer != shimmer ||
      old.pulse != pulse ||
      old.accent != accent;
}
