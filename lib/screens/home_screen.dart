import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../theme/app_colors.dart';
import '../widgets/hero_section.dart';
import '../widgets/about_section.dart';
import '../widgets/skills_section.dart';
import '../widgets/projects_section.dart';
import '../widgets/certifications_section.dart';
import '../widgets/contact_section.dart';
import '../widgets/hover_widgets.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final ScrollController _scrollController = ScrollController();
  double _scrollOffset = 0;
  double _maxScroll = 1;

  final GlobalKey _aboutKey = GlobalKey();
  final GlobalKey _skillsKey = GlobalKey();
  final GlobalKey _projectsKey = GlobalKey();
  final GlobalKey _certsKey = GlobalKey();
  final GlobalKey _contactKey = GlobalKey();

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(() {
      if (_scrollController.hasClients) {
        setState(() {
          _scrollOffset = _scrollController.offset;
          _maxScroll = _scrollController.position.maxScrollExtent;
          if (_maxScroll == 0) _maxScroll = 1;
        });
      }
    });
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  void _scrollToSection(GlobalKey key) {
    final ctx = key.currentContext;
    if (ctx != null) {
      Scrollable.ensureVisible(
        ctx,
        duration: const Duration(milliseconds: 700),
        curve: Curves.easeInOutCubic,
      );
    }
  }

  Future<void> _openResume() async {
    final Uri url = Uri.parse(
        'https://drive.google.com/file/d/1GugnCFzKq0sIWZDrf7VohJOFUpcQ2TgT/view?usp=sharing');
    if (!await launchUrl(url, mode: LaunchMode.externalApplication)) {
      debugPrint('Could not launch resume link');
    }
  }

  bool get _isScrolled => _scrollOffset > 50;

  @override
  Widget build(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;
    final isMobile = screenWidth < 800;
    final c = AppColorScheme.of(context);

    return Scaffold(
      appBar: PreferredSize(
        preferredSize: const Size.fromHeight(68),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeInOut,
          decoration: BoxDecoration(
            color: _isScrolled
                ? c.background.withValues(alpha: 0.97)
                : c.background,
            boxShadow: _isScrolled
                ? [
                    BoxShadow(
                        color: Colors.black.withValues(alpha: 0.18),
                        blurRadius: 14,
                        offset: const Offset(0, 4))
                  ]
                : [],
          ),
          child: Stack(
            children: [
              Positioned.fill(
                child: SafeArea(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: [
                        AnimatedDefaultTextStyle(
                          duration: const Duration(milliseconds: 300),
                          style: TextStyle(
                            color: c.accent,
                            fontWeight: FontWeight.bold,
                            fontSize: _isScrolled ? 17 : 21,
                            fontFamily: 'Roboto Mono',
                            shadows: _isScrolled
                                ? [
                                    Shadow(
                                        color: c.accent.withValues(alpha: 0.4),
                                        blurRadius: 10)
                                  ]
                                : [],
                          ),
                          child: const Text('Harikrishnan Portfolio'),
                        ),
                        const Spacer(),
                        if (isMobile) ...[
                          const ThemeToggleButton(),
                          const SizedBox(width: 8),
                          _buildMobileMenu(c),
                        ] else ...[
                          HoverNavButton(
                              title: 'About',
                              onPressed: () => _scrollToSection(_aboutKey)),
                          HoverNavButton(
                              title: 'Skills',
                              onPressed: () => _scrollToSection(_skillsKey)),
                          HoverNavButton(
                              title: 'Projects',
                              onPressed: () => _scrollToSection(_projectsKey)),
                          HoverNavButton(
                              title: 'Certifications',
                              onPressed: () => _scrollToSection(_certsKey)),
                          HoverNavButton(
                              title: 'Contact',
                              onPressed: () => _scrollToSection(_contactKey)),
                          const SizedBox(width: 16),
                          HoverElevatedButton(label: 'Resume', onPressed: _openResume),
                          const SizedBox(width: 12),
                          // ── Theme Toggle Button ──────────────────────────────
                          const ThemeToggleButton(),
                        ],
                      ],
                    ),
                  ),
                ),
              ),
              // Reading Progress Bar
              Positioned(
                bottom: 0,
                left: 0,
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 100),
                  height: 2.5,
                  width: screenWidth * (_scrollOffset / _maxScroll).clamp(0.0, 1.0),
                  decoration: BoxDecoration(
                    color: c.accent,
                    boxShadow: [
                      BoxShadow(
                        color: c.accent.withValues(alpha: 0.5),
                        blurRadius: 6,
                        spreadRadius: 1,
                      )
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
      body: SingleChildScrollView(
        controller: _scrollController,
        child: Column(
          children: [
            HeroSection(onProjectsClick: () => _scrollToSection(_projectsKey)),
            Container(key: _aboutKey, child: const AboutSection()),
            Container(key: _skillsKey, child: const SkillsSection()),
            Container(key: _projectsKey, child: const ProjectsSection()),
            Container(key: _certsKey, child: const CertificationsSection()),
            Container(key: _contactKey, child: const ContactSection()),
            _buildFooter(c),
          ],
        ),
      ),
      floatingActionButton: AnimatedOpacity(
        opacity: _scrollOffset > 400 ? 1.0 : 0.0,
        duration: const Duration(milliseconds: 300),
        child: FloatingActionButton.small(
          onPressed: () => _scrollController.animateTo(
            0,
            duration: const Duration(milliseconds: 700),
            curve: Curves.easeInOutCubic,
          ),
          backgroundColor: c.accent,
          foregroundColor: c.primary,
          child: const Icon(Icons.keyboard_arrow_up_rounded),
        ),
      ),
    );
  }

  Widget _buildMobileMenu(AppColorScheme c) {
    return PopupMenuButton<String>(
      icon: Icon(Icons.menu, color: c.text),
      color: c.secondary,
      onSelected: (val) {
        switch (val) {
          case 'about':
            _scrollToSection(_aboutKey);
            break;
          case 'skills':
            _scrollToSection(_skillsKey);
            break;
          case 'projects':
            _scrollToSection(_projectsKey);
            break;
          case 'certs':
            _scrollToSection(_certsKey);
            break;
          case 'contact':
            _scrollToSection(_contactKey);
            break;
          case 'resume':
            _openResume();
            break;
        }
      },
      itemBuilder: (_) => [
        PopupMenuItem(
            value: 'about',
            child: Text('About', style: TextStyle(color: c.text))),
        PopupMenuItem(
            value: 'skills',
            child: Text('Skills', style: TextStyle(color: c.text))),
        PopupMenuItem(
            value: 'projects',
            child: Text('Projects', style: TextStyle(color: c.text))),
        PopupMenuItem(
            value: 'certs',
            child: Text('Certifications', style: TextStyle(color: c.text))),
        PopupMenuItem(
            value: 'contact',
            child: Text('Contact', style: TextStyle(color: c.text))),
        PopupMenuItem(
            value: 'resume',
            child: Text('Resume', style: TextStyle(color: c.accent))),
      ],
    );
  }

  Widget _buildFooter(AppColorScheme c) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 30),
      alignment: Alignment.center,
      child: Column(
        children: [
          Container(
              height: 1, color: c.textSecondary.withValues(alpha: 0.1)),
          const SizedBox(height: 24),
          Text(
            'Designed & Built by Harikrishanan R',
            style: TextStyle(
              color: c.textSecondary.withValues(alpha: 0.5),
              fontSize: 13,
              fontFamily: 'Roboto Mono',
            ),
          ),
        ],
      ),
    );
  }
}
