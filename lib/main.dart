import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import '../theme/app_colors.dart';
import '../theme/app_theme.dart';
import 'screens/home_screen.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  // Load environment variables from the bundled .env file
  await dotenv.load(fileName: '.env');

  runApp(
    ThemeNotifierProvider(
      child: const PortfolioApp(),
    ),
  );
}

class PortfolioApp extends StatelessWidget {
  const PortfolioApp({super.key});

  @override
  Widget build(BuildContext context) {
    final notifier = ThemeNotifier.of(context);
    return MaterialApp(
      title: 'Harikrishnan Portfolio',
      debugShowCheckedModeBanner: false,
      themeMode: notifier.mode,
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      home: const HomeScreen(),
    );
  }
}
