import 'dart:math';
import 'package:flutter/material.dart';
import '../theme/app_colors.dart';

// ─────────────────────────────────────────────────────────────────────────────
// 1. MouseTiltCard — real-time cursor-tracked 3-D perspective tilt
// ─────────────────────────────────────────────────────────────────────────────
class MouseTiltCard extends StatefulWidget {
  final Widget child;
  final double maxTilt;
  final double perspective;

  const MouseTiltCard({
    super.key,
    required this.child,
    this.maxTilt = 0.08,
    this.perspective = 0.0008,
  });

  @override
  State<MouseTiltCard> createState() => _MouseTiltCardState();
}

class _MouseTiltCardState extends State<MouseTiltCard> {
  double _tiltX = 0;
  double _tiltY = 0;

  void _onHover(PointerEvent e) {
    final box = context.findRenderObject() as RenderBox?;
    if (box == null) return;
    final local = box.globalToLocal(e.position);
    final s = box.size;
    final dx = (local.dx / s.width - 0.5) * 2;
    final dy = (local.dy / s.height - 0.5) * 2;
    setState(() {
      _tiltX = dy * widget.maxTilt;
      _tiltY = -dx * widget.maxTilt;
    });
  }

  @override
  Widget build(BuildContext context) {
    return MouseRegion(
      onHover: _onHover,
      onExit: (_) => setState(() {
        _tiltX = 0;
        _tiltY = 0;
      }),
      child: TweenAnimationBuilder<double>(
        tween: Tween(begin: 0, end: _tiltX),
        duration: const Duration(milliseconds: 160),
        builder: (context, tx, _) => TweenAnimationBuilder<double>(
          tween: Tween(begin: 0, end: _tiltY),
          duration: const Duration(milliseconds: 160),
          builder: (context, ty, child) => Transform(
            alignment: Alignment.center,
            transform: Matrix4.identity()
              ..setEntry(3, 2, widget.perspective)
              ..rotateX(tx)
              ..rotateY(ty),
            child: child,
          ),
          child: widget.child,
        ),
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. DevOpsOrbit — 3-D perspective orbit with tech-tool nodes
// ─────────────────────────────────────────────────────────────────────────────
class DevOpsOrbit extends StatefulWidget {
  final double size;
  const DevOpsOrbit({super.key, this.size = 340});

  @override
  State<DevOpsOrbit> createState() => _DevOpsOrbitState();
}

class _DevOpsOrbitState extends State<DevOpsOrbit>
    with TickerProviderStateMixin {
  late final AnimationController _c1 =
      AnimationController(vsync: this, duration: const Duration(seconds: 8))
        ..repeat();
  late final AnimationController _c2 =
      AnimationController(vsync: this, duration: const Duration(seconds: 13))
        ..repeat();
  late final AnimationController _c3 =
      AnimationController(vsync: this, duration: const Duration(seconds: 7))
        ..repeat();
  late final AnimationController _pulse =
      AnimationController(vsync: this, duration: const Duration(seconds: 2))
        ..repeat(reverse: true);

  @override
  void dispose() {
    _c1.dispose();
    _c2.dispose();
    _c3.dispose();
    _pulse.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final c = AppColorScheme.of(context);
    return AnimatedBuilder(
      animation: Listenable.merge([_c1, _c2, _c3, _pulse]),
      builder: (context, child) => CustomPaint(
        size: Size(widget.size, widget.size),
        painter: _OrbitPainter(
          p1: _c1.value,
          p2: _c2.value,
          p3: _c3.value,
          pulse: _pulse.value,
          accent: c.accent,
          isDark: c.isDark,
        ),
      ),
    );
  }
}

class _OrbitPainter extends CustomPainter {
  final double p1, p2, p3, pulse;
  final Color accent;
  final bool isDark;

  static const _r1 = ['Docker', 'AWS', 'Linux'];
  static const _r2 = ['Jenkins', 'Git', 'ECR'];
  static const _r3 = ['ECS', 'Trivy', 'Route53'];

  _OrbitPainter({
    required this.p1,
    required this.p2,
    required this.p3,
    required this.pulse,
    required this.accent,
    required this.isDark,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final cx = size.width / 2;
    final cy = size.height / 2;

    // Central glowing orb
    final pr = 20.0 + 5.0 * pulse;
    canvas.drawCircle(
      Offset(cx, cy),
      pr * 2.2,
      Paint()
        ..shader = RadialGradient(colors: [
          accent.withValues(alpha: 0.35),
          accent.withValues(alpha: 0.0),
        ]).createShader(Rect.fromCircle(
            center: Offset(cx, cy), radius: pr * 2.2)),
    );
    canvas.drawCircle(Offset(cx, cy), pr,
        Paint()..color = accent.withValues(alpha: 0.9));

    // Center label
    _drawLabel(canvas, '{ }', Offset(cx, cy), accent,
        isDark ? Colors.black : Colors.white, 10);

    // 3 orbit rings
    _drawRing(canvas, cx, cy, 78, 28, p1, _r1, accent, 0.0);
    _drawRing(canvas, cx, cy, 116, 42, p2, _r2,
        accent.withValues(alpha: 0.8), 2.1);
    _drawRing(canvas, cx, cy, 152, 56, -p3, _r3,
        accent.withValues(alpha: 0.6), 0.7);
  }

  void _drawRing(Canvas canvas, double cx, double cy, double rx, double ry,
      double prog, List<String> labels, Color col, double offset) {
    // Ellipse ring
    canvas.drawOval(
      Rect.fromCenter(center: Offset(cx, cy), width: rx * 2, height: ry * 2),
      Paint()
        ..color = col.withValues(alpha: 0.22)
        ..style = PaintingStyle.stroke
        ..strokeWidth = 1.0,
    );
    // Nodes
    for (int i = 0; i < labels.length; i++) {
      final angle = prog * 2 * pi + i * 2 * pi / labels.length + offset;
      final nx = cx + rx * cos(angle);
      final ny = cy + ry * sin(angle);
      // Glow
      canvas.drawCircle(
          Offset(nx, ny),
          12,
          Paint()
            ..color = col.withValues(alpha: 0.18)
            ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 6));
      // Circle
      canvas.drawCircle(Offset(nx, ny), 7, Paint()..color = col);
      // Label below node
      _drawLabel(canvas, labels[i], Offset(nx, ny + 14), col, col, 9);
    }
  }

  void _drawLabel(Canvas canvas, String text, Offset pos, Color col,
      Color textCol, double fontSize) {
    final tp = TextPainter(
      text: TextSpan(
        text: text,
        style: TextStyle(
          color: textCol,
          fontSize: fontSize,
          fontFamily: 'Roboto Mono',
          fontWeight: FontWeight.bold,
        ),
      ),
      textDirection: TextDirection.ltr,
    )..layout();
    tp.paint(canvas, pos - Offset(tp.width / 2, tp.height / 2));
  }

  @override
  bool shouldRepaint(_OrbitPainter old) => true;
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. FloatingGeometryBackground — ambient rotating wireframe shapes
// ─────────────────────────────────────────────────────────────────────────────
class FloatingGeometryBackground extends StatefulWidget {
  final Widget child;
  const FloatingGeometryBackground({super.key, required this.child});

  @override
  State<FloatingGeometryBackground> createState() =>
      _FloatingGeometryBackgroundState();
}

class _FloatingGeometryBackgroundState
    extends State<FloatingGeometryBackground> with SingleTickerProviderStateMixin {
  late final AnimationController _ctrl =
      AnimationController(vsync: this, duration: const Duration(seconds: 12))
        ..repeat();

  static final _rng = Random(77);
  static final _shapes = List.generate(
    9,
    (i) => _ShapeData(
      x: _rng.nextDouble(),
      y: _rng.nextDouble(),
      size: _rng.nextDouble() * 28 + 10,
      speed: _rng.nextDouble() * 0.4 + 0.1,
      rotSpeed: _rng.nextDouble() * 0.6 + 0.1,
      type: i % 3,
      opacity: _rng.nextDouble() * 0.05 + 0.02,
      phase: _rng.nextDouble(),
    ),
  );

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final c = AppColorScheme.of(context);
    return Stack(
      children: [
        Positioned.fill(
          child: AnimatedBuilder(
            animation: _ctrl,
            builder: (context, child) => CustomPaint(
              painter: _ShapesPainter(
                  progress: _ctrl.value,
                  accent: c.accent,
                  shapes: _shapes),
            ),
          ),
        ),
        widget.child,
      ],
    );
  }
}

class _ShapeData {
  final double x, y, size, speed, rotSpeed, opacity, phase;
  final int type;
  const _ShapeData({
    required this.x,
    required this.y,
    required this.size,
    required this.speed,
    required this.rotSpeed,
    required this.type,
    required this.opacity,
    required this.phase,
  });
}

class _ShapesPainter extends CustomPainter {
  final double progress;
  final Color accent;
  final List<_ShapeData> shapes;

  _ShapesPainter(
      {required this.progress, required this.accent, required this.shapes});

  @override
  void paint(Canvas canvas, Size size) {
    for (final s in shapes) {
      final t = (progress + s.phase) % 1.0;
      final x = s.x * size.width;
      final y =
          (s.y * size.height + sin(t * 2 * pi) * 24 * s.speed) % size.height;
      final rot = t * 2 * pi * s.rotSpeed;
      final paint = Paint()
        ..color = accent.withValues(alpha: s.opacity)
        ..style = PaintingStyle.stroke
        ..strokeWidth = 1.0;

      canvas.save();
      canvas.translate(x, y);
      canvas.rotate(rot);

      switch (s.type) {
        case 0: // Triangle
          canvas.drawPath(
            Path()
              ..moveTo(0, -s.size / 2)
              ..lineTo(s.size / 2, s.size / 2)
              ..lineTo(-s.size / 2, s.size / 2)
              ..close(),
            paint,
          );
          break;
        case 1: // Square
          canvas.drawRect(
            Rect.fromCenter(
                center: Offset.zero, width: s.size, height: s.size),
            paint,
          );
          break;
        default: // Hexagon
          final hex = Path();
          for (int i = 0; i < 6; i++) {
            final a = i * pi / 3 - pi / 6;
            if (i == 0) {
              hex.moveTo(cos(a) * s.size / 2, sin(a) * s.size / 2);
            } else {
              hex.lineTo(cos(a) * s.size / 2, sin(a) * s.size / 2);
            }
          }
          hex.close();
          canvas.drawPath(hex, paint);
      }
      canvas.restore();
    }
  }

  @override
  bool shouldRepaint(_ShapesPainter old) =>
      old.progress != progress || old.accent != accent;
}
