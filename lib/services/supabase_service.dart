import 'package:flutter_dotenv/flutter_dotenv.dart';

/// Centralized Local/Offline data service for the portfolio.
/// Serves structured profile data locally with fast loading and zero database dependencies.
class SupabaseService {
  SupabaseService._();
  static final SupabaseService instance = SupabaseService._();

  // ── In-memory cache ──────────────────────────────────────────────────────────
  Map<String, dynamic>? _heroData;
  Map<String, dynamic>? _aboutData;
  List<Map<String, dynamic>>? _skillsData;
  List<Map<String, dynamic>>? _projectsData;
  List<Map<String, dynamic>>? _certificatesData;
  Map<String, dynamic>? _contactData;
  Map<String, dynamic>? _siteSettings;
  List<Map<String, dynamic>>? _tickerData;

  // ── Hero Section ─────────────────────────────────────────────────────────────
  Future<Map<String, dynamic>?> getHeroData() async {
    if (_heroData != null) return _heroData;
    _heroData = {
      'greeting': 'Hi, my name is',
      'name': 'Harikrishnan R.',
      'subtitle': 'I build as a ',
      'description':
          'A passionate DevOps Engineer specializing in scalable AWS infrastructure, CI/CD pipelines with Jenkins, and containerized apps using Docker & ECS Fargate.',
      'cta_text': 'Check out my projects!',
      'roles': [
        'DevOps Engineer',
        'Cloud Architect',
        'CI/CD Specialist',
        'Docker & AWS Expert',
        'Infrastructure Builder',
      ],
      'resume_url': dotenv.env['RESUME_URL'] ??
          'https://drive.google.com/file/d/1GugnCFzKq0sIWZDrf7VohJOFUpcQ2TgT/view?usp=sharing',
    };
    return _heroData;
  }

  // ── About Me ─────────────────────────────────────────────────────────────────
  Future<Map<String, dynamic>?> getAboutData() async {
    if (_aboutData != null) return _aboutData;
    _aboutData = {
      'paragraphs': [
        "Hi! I'm Harikrishnan R, a passionate DevOps Engineer from India with hands-on expertise in cloud infrastructure, containerization, and CI/CD automation.",
        "I specialize in building and scaling infrastructure on AWS — architecting multi-region deployments, automating software delivery pipelines with Jenkins, and containerizing applications with Docker and ECS Fargate.",
        "My goal is to bridge the gap between development and operations by implementing robust DevOps practices that increase velocity, reliability, and security of software systems.",
      ],
      'location': 'India',
      'role': 'DevOps Engineer',
      'certification': 'L&T EduTech Certified',
      'image_url': dotenv.env['ABOUT_IMAGE_URL'] ??
          'https://images.unsplash.com/photo-1618401471353-b98aedd07871?q=80&w=600&auto=format&fit=crop',
    };
    return _aboutData;
  }

  // ── Skills ───────────────────────────────────────────────────────────────────
  Future<List<Map<String, dynamic>>> getSkillsData() async {
    if (_skillsData != null) return _skillsData!;
    _skillsData = [
      {
        'category': 'Cloud Platforms (AWS)',
        'icon': 'cloud_queue_rounded',
        'skills': ['EC2', 'ECR', 'ECS', 'Route 53', 'IAM', 'SSM'],
        'progress': 0.88,
        'color': '0xFF2997FF',
      },
      {
        'category': 'Containerization',
        'icon': 'layers_rounded',
        'skills': ['Docker', 'Docker Swarm', 'AWS ECS (Fargate)'],
        'progress': 0.92,
        'color': '0xFF00D4FF',
      },
      {
        'category': 'CI/CD Tools',
        'icon': 'settings_backup_restore_rounded',
        'skills': ['Jenkins', 'Pipeline-as-Code', 'Jenkinsfile'],
        'progress': 0.85,
        'color': '0xFF5E5CE6',
      },
      {
        'category': 'Security & Quality',
        'icon': 'security_rounded',
        'skills': ['SonarQube'],
        'progress': 0.75,
        'color': '0xFF30D158',
      },
      {
        'category': 'Version Control',
        'icon': 'fork_right_rounded',
        'skills': ['Git', 'GitHub'],
        'progress': 0.90,
        'color': '0xFFFF9F0A',
      },
      {
        'category': 'Operating Systems',
        'icon': 'terminal_rounded',
        'skills': ['Linux', 'Amazon Linux', 'Ubuntu'],
        'progress': 0.85,
        'color': '0xFFFF453A',
      },
    ];
    return _skillsData!;
  }

  // ── Projects ─────────────────────────────────────────────────────────────────
  Future<List<Map<String, dynamic>>> getProjectsData() async {
    if (_projectsData != null) return _projectsData!;
    _projectsData = [
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
        'tech_stack': ['AWS EC2', 'ECR', 'ECS', 'Route 53', 'IAM', 'Docker', 'GitHub'],
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
        'tech_stack': ['Docker', 'Docker Swarm', 'AWS EC2', 'Amazon Linux'],
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
        'tech_stack': ['Jenkins', 'Docker', 'Trivy', 'AWS EC2', 'ECR', 'React'],
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
        'tech_stack': ['Jenkins', 'Docker', 'AWS EC2', 'ECR', 'Git', 'GitHub', 'React.js'],
      },
    ];
    return _projectsData!;
  }

  // ── Certificates ─────────────────────────────────────────────────────────────
  Future<List<Map<String, dynamic>>> getCertificatesData() async {
    if (_certificatesData != null) return _certificatesData!;
    _certificatesData = [
      {
        'title': 'Fundamentals of Agile Methodology with DevOps Integration',
        'issuer': 'L&T EduTech',
        'period': 'Aug 2023 – Nov 2023',
        'link': dotenv.env['CERT_AGILE_URL'] ?? '',
      },
      {
        'title': 'DevOps and Cloud',
        'issuer': 'L&T EduTech',
        'period': 'Jan 2024 – Apr 2024',
        'link': dotenv.env['CERT_DEVOPS_CLOUD_URL'] ?? '',
      },
      {
        'title': 'DevOps Container Services',
        'issuer': 'L&T EduTech',
        'period': 'Jun 2024 – Oct 2024',
        'link': dotenv.env['CERT_CONTAINER_URL'] ?? '',
      },
    ];
    return _certificatesData!;
  }

  // ── Contact Section ──────────────────────────────────────────────────────────
  Future<Map<String, dynamic>?> getContactData() async {
    if (_contactData != null) return _contactData;
    _contactData = {
      'heading': "What's Next?",
      'title': 'Get In Touch',
      'description':
          "I'm currently looking for new DevOps opportunities. Whether you have a question, a project, or just want to say hi — I'll do my best to get back to you!",
      'email': dotenv.env['CONTACT_EMAIL'] ?? 'rharikrishnanrajan@zohomail.in',
      'github_url': dotenv.env['GITHUB_URL'] ?? 'https://github.com/rharikrishnanrajan',
      'linkedin_url': dotenv.env['LINKEDIN_URL'] ?? 'https://www.linkedin.com/in/rharikrishnanrajan',
      'cta_text': '  Say Hello  ',
    };
    return _contactData;
  }

  // ── Site Settings ────────────────────────────────────────────────────────────
  Future<Map<String, dynamic>?> getSiteSettings() async {
    if (_siteSettings != null) return _siteSettings;
    _siteSettings = {
      'brand_name': 'Harikrishnan Portfolio',
      'resume_url': dotenv.env['RESUME_URL'] ??
          'https://drive.google.com/file/d/1GugnCFzKq0sIWZDrf7VohJOFUpcQ2TgT/view?usp=sharing',
      'footer_text': 'Designed & Built by Harikrishanan R',
    };
    return _siteSettings;
  }

  // ── Tech Stack Ticker ────────────────────────────────────────────────────────
  Future<List<Map<String, dynamic>>> getTickerData() async {
    if (_tickerData != null) return _tickerData!;
    _tickerData = [
      {'label': 'AWS', 'icon_name': 'aws', 'sort_order': 0},
      {'label': 'Docker', 'icon_name': 'docker', 'sort_order': 1},
      {'label': 'Linux', 'icon_name': 'linux', 'sort_order': 2},
      {'label': 'Git', 'icon_name': 'git', 'sort_order': 3},
      {'label': 'GitHub', 'icon_name': 'github', 'sort_order': 4},
      {'label': 'Jenkins', 'icon_name': 'settings_backup_restore_rounded', 'sort_order': 5},
      {'label': 'SonarQube', 'icon_name': 'shield_rounded', 'sort_order': 6},
      {'label': 'EC2', 'icon_name': 'cloud_queue_rounded', 'sort_order': 7},
      {'label': 'ECS', 'icon_name': 'layers_rounded', 'sort_order': 8},
      {'label': 'Route 53', 'icon_name': 'dns_rounded', 'sort_order': 9},
      {'label': 'IAM', 'icon_name': 'admin_panel_settings_rounded', 'sort_order': 10},
      {'label': 'Ubuntu', 'icon_name': 'terminal_rounded', 'sort_order': 11},
    ];
    return _tickerData!;
  }

  /// Clear all cached data (useful for pull-to-refresh)
  void clearCache() {
    _heroData = null;
    _aboutData = null;
    _skillsData = null;
    _projectsData = null;
    _certificatesData = null;
    _contactData = null;
    _siteSettings = null;
    _tickerData = null;
  }
}
