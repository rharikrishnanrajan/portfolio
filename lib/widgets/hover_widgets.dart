import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import '../theme/app_colors.dart';

/// A card that lifts, glows, and scales on hover — with a subtle 3-D tilt effect.
class HoverCard extends StatefulWidget {
  final Widget child;
  final Color? borderColor;
  final double borderRadius;
  final Color? backgroundColor;

  const HoverCard({
    super.key,
    required this.child,
    this.borderColor,
    this.borderRadius = 10,
    this.backgroundColor,
  });

  @override
  State<HoverCard> createState() => _HoverCardState();
}

class _HoverCardState extends State<HoverCard>
    with SingleTickerProviderStateMixin {
  bool _hovered = false;
  late AnimationController _ctrl;
  late Animation<double> _scale;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 220),
    );
    _scale = Tween<double>(begin: 1.0, end: 1.028).animate(
      CurvedAnimation(parent: _ctrl, curve: Curves.easeOutCubic),
    );
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final c = AppColorScheme.of(context);
    final borderColor = widget.borderColor ?? c.accent;
    final bgColor = widget.backgroundColor ?? c.secondary;

    return MouseRegion(
      onEnter: (_) {
        setState(() => _hovered = true);
        _ctrl.forward();
      },
      onExit: (_) {
        setState(() => _hovered = false);
        _ctrl.reverse();
      },
      cursor: SystemMouseCursors.click,
      child: AnimatedBuilder(
        animation: _ctrl,
        builder: (_, child) => Transform.scale(
          scale: _scale.value,
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 220),
            decoration: BoxDecoration(
              color: bgColor,
              borderRadius: BorderRadius.circular(widget.borderRadius),
              border: Border.all(
                color: _hovered
                    ? borderColor.withValues(alpha: 0.7)
                    : borderColor.withValues(alpha: 0.15),
                width: 1.5,
              ),
              boxShadow: _hovered
                  ? [
                      BoxShadow(
                        color: borderColor.withValues(alpha: 0.18),
                        blurRadius: 28,
                        spreadRadius: 2,
                        offset: const Offset(0, 10),
                      ),
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.18),
                        blurRadius: 18,
                        offset: const Offset(0, 6),
                      ),
                    ]
                  : [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.08),
                        blurRadius: 8,
                        offset: const Offset(0, 4),
                      ),
                    ],
            ),
            child: child,
          ),
        ),
        child: widget.child,
      ),
    );
  }
}

/// MagneticWrapper - pulls the child slightly towards the cursor
class MagneticWrapper extends StatefulWidget {
  final Widget child;
  final double strength;

  const MagneticWrapper({super.key, required this.child, this.strength = 8});

  @override
  State<MagneticWrapper> createState() => _MagneticWrapperState();
}

class _MagneticWrapperState extends State<MagneticWrapper> {
  Offset _position = Offset.zero;

  @override
  Widget build(BuildContext context) {
    return MouseRegion(
      onHover: (e) {
        final box = context.findRenderObject() as RenderBox?;
        if (box == null) return;
        final local = box.globalToLocal(e.position);
        final w = box.size.width;
        final h = box.size.height;
        final x = (local.dx - w / 2) / (w / 2);
        final y = (local.dy - h / 2) / (h / 2);
        setState(() {
          _position = Offset(x * widget.strength, y * widget.strength);
        });
      },
      onExit: (_) {
        setState(() => _position = Offset.zero);
      },
      child: TweenAnimationBuilder<Offset>(
        tween: Tween(begin: Offset.zero, end: _position),
        duration: const Duration(milliseconds: 150),
        curve: Curves.easeOutCubic,
        builder: (_, off, child) => Transform.translate(
          offset: off,
          child: child,
        ),
        child: widget.child,
      ),
    );
  }
}

/// A nav button with underline hover animation, magnetic pull, and active state
class HoverNavButton extends StatefulWidget {
  final String title;
  final VoidCallback onPressed;
  final bool isActive;

  const HoverNavButton({
    super.key,
    required this.title,
    required this.onPressed,
    this.isActive = false,
  });

  @override
  State<HoverNavButton> createState() => _HoverNavButtonState();
}

class _HoverNavButtonState extends State<HoverNavButton> {
  bool _hovered = false;
  bool _isDown = false;

  @override
  Widget build(BuildContext context) {
    final c = AppColorScheme.of(context);
    final bool active = widget.isActive || _hovered;

    return MagneticWrapper(
      strength: 6,
      child: MouseRegion(
        onEnter: (_) => setState(() => _hovered = true),
        onExit: (_) => setState(() => _hovered = false),
        child: GestureDetector(
          onTapDown: (_) => setState(() => _isDown = true),
          onTapUp: (_) => setState(() => _isDown = false),
          onTapCancel: () => setState(() => _isDown = false),
          onTap: widget.onPressed,
          child: AnimatedScale(
            scale: _isDown ? 0.94 : 1.0,
            duration: const Duration(milliseconds: 100),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
              decoration: BoxDecoration(
                border: Border(
                  bottom: BorderSide(
                    color: active ? c.accent : Colors.transparent,
                    width: 1.5,
                  ),
                ),
              ),
              child: AnimatedDefaultTextStyle(
                duration: const Duration(milliseconds: 200),
                style: TextStyle(
                  color: active ? c.accent : c.text,
                  fontFamily: 'Roboto Mono',
                  fontSize: 13,
                  fontWeight: widget.isActive ? FontWeight.bold : FontWeight.normal,
                ),
                child: Text(widget.title),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

/// An icon button with hover glow effect
class HoverSocialButton extends StatefulWidget {
  final dynamic iconData;
  final String tooltip;
  final VoidCallback onTap;

  const HoverSocialButton({
    super.key,
    required this.iconData,
    required this.tooltip,
    required this.onTap,
  });

  @override
  State<HoverSocialButton> createState() => _HoverSocialButtonState();
}

class _HoverSocialButtonState extends State<HoverSocialButton> {
  bool _hovered = false;
  bool _isDown = false;

  @override
  Widget build(BuildContext context) {
    final c = AppColorScheme.of(context);
    return MagneticWrapper(
      strength: 8,
      child: Tooltip(
        message: widget.tooltip,
        child: MouseRegion(
          onEnter: (_) => setState(() => _hovered = true),
          onExit: (_) => setState(() => _hovered = false),
          cursor: SystemMouseCursors.click,
          child: GestureDetector(
            onTapDown: (_) => setState(() => _isDown = true),
            onTapUp: (_) => setState(() => _isDown = false),
            onTapCancel: () => setState(() => _isDown = false),
            onTap: widget.onTap,
            child: AnimatedScale(
              scale: _isDown ? 0.92 : 1.0,
              duration: const Duration(milliseconds: 100),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 200),
                curve: Curves.easeOutCubic,
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: _hovered
                      ? c.accent.withValues(alpha: 0.1)
                      : c.secondary,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(
                    color: _hovered
                        ? c.accent
                        : c.accent.withValues(alpha: 0.2),
                    width: 1.5,
                  ),
                  boxShadow: _hovered
                      ? [
                          BoxShadow(
                            color: c.accent.withValues(alpha: 0.2),
                            blurRadius: 16,
                            spreadRadius: 1,
                          )
                        ]
                      : [],
                ),
                child: Transform.translate(
                  offset: _hovered ? const Offset(0, -2) : Offset.zero,
                  child: FaIcon(
                    widget.iconData,
                    size: 28,
                    color: _hovered ? c.accent : c.textSecondary,
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

/// A reusable ElevatedButton with hover effect
class HoverElevatedButton extends StatefulWidget {
  final String label;
  final VoidCallback onPressed;

  const HoverElevatedButton(
      {super.key, required this.label, required this.onPressed});

  @override
  State<HoverElevatedButton> createState() => _HoverElevatedButtonState();
}

class _HoverElevatedButtonState extends State<HoverElevatedButton> {
  bool _hovered = false;
  bool _isDown = false;

  @override
  Widget build(BuildContext context) {
    final c = AppColorScheme.of(context);
    return MagneticWrapper(
      strength: 8,
      child: MouseRegion(
        onEnter: (_) => setState(() => _hovered = true),
        onExit: (_) => setState(() => _hovered = false),
        cursor: SystemMouseCursors.click,
        child: GestureDetector(
          onTapDown: (_) => setState(() => _isDown = true),
          onTapUp: (_) => setState(() => _isDown = false),
          onTapCancel: () => setState(() => _isDown = false),
          onTap: widget.onPressed,
          child: AnimatedScale(
            scale: _isDown ? 0.94 : 1.0,
            duration: const Duration(milliseconds: 100),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              curve: Curves.easeOutCubic,
              padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 14),
              decoration: BoxDecoration(
                color: _hovered
                    ? c.accent.withValues(alpha: 0.15)
                    : Colors.transparent,
                borderRadius: BorderRadius.circular(4),
                border: Border.all(color: c.accent, width: 1.5),
                boxShadow: _hovered
                    ? [
                        BoxShadow(
                            color: c.accent.withValues(alpha: 0.2),
                            blurRadius: 12,
                            spreadRadius: 1)
                      ]
                    : [],
              ),
              child: AnimatedDefaultTextStyle(
                duration: const Duration(milliseconds: 200),
                style: TextStyle(
                  color: c.accent,
                  fontFamily: 'Roboto Mono',
                  fontWeight: FontWeight.bold,
                  fontSize: _hovered ? 15 : 14,
                ),
                child: Text(widget.label),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

/// 3D-style theme toggle button (sun / moon)
class ThemeToggleButton extends StatefulWidget {
  const ThemeToggleButton({super.key});

  @override
  State<ThemeToggleButton> createState() => _ThemeToggleButtonState();
}

class _ThemeToggleButtonState extends State<ThemeToggleButton>
    with SingleTickerProviderStateMixin {
  late AnimationController _ctrl;
  late Animation<double> _spin;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(
        vsync: this, duration: const Duration(milliseconds: 400));
    _spin = Tween<double>(begin: 0, end: 1).animate(
        CurvedAnimation(parent: _ctrl, curve: Curves.easeInOutBack));
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  void _toggle() {
    final notifier = ThemeNotifier.of(context);
    _ctrl.forward(from: 0);
    notifier.toggle();
  }

  @override
  Widget build(BuildContext context) {
    final notifier = ThemeNotifier.of(context);
    final c = notifier.colors;
    final isDark = c.isDark;

    return Tooltip(
      message: isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode',
      child: GestureDetector(
        onTap: _toggle,
        child: MouseRegion(
          cursor: SystemMouseCursors.click,
          child: AnimatedBuilder(
            animation: _spin,
            builder: (context, child) => Transform(
              alignment: Alignment.center,
              transform: Matrix4.identity()
                ..setEntry(3, 2, 0.001)
                ..rotateY(3.14159 * _spin.value),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 300),
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: c.accent.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(
                      color: c.accent.withValues(alpha: 0.3), width: 1.5),
                ),
                child: Icon(
                  isDark ? Icons.dark_mode_rounded : Icons.light_mode_rounded,
                  color: c.accent,
                  size: 20,
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
