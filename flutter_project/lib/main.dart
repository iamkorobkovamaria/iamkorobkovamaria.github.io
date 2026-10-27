import 'package:flutter/material.dart';

void main() {
  runApp(const CollegeApp());
}

class CollegeApp extends StatelessWidget {
  const CollegeApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'College App',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF4F46E5)),
        useMaterial3: true,
      ),
      home: const StudentsPage(),
    );
  }
}

/// A student record kept in memory for the demo.
class Student {
  Student({
    required this.name,
    required this.specialty,
    required this.graduationYear,
  });

  final String name;
  final String specialty;
  final int graduationYear;
}

class StudentsPage extends StatefulWidget {
  const StudentsPage({super.key});

  @override
  State<StudentsPage> createState() => _StudentsPageState();
}

class _StudentsPageState extends State<StudentsPage> {
  final _nameController = TextEditingController();
  final _specialtyController = TextEditingController();
  final _yearController = TextEditingController();

  final List<Student> _students = <Student>[
    Student(name: 'Alex River', specialty: 'Computer Science', graduationYear: 2028),
    Student(name: 'Sergey', specialty: 'IT', graduationYear: 2026),
  ];

  @override
  void dispose() {
    _nameController.dispose();
    _specialtyController.dispose();
    _yearController.dispose();
    super.dispose();
  }

  void _addStudent() {
    final name = _nameController.text.trim();
    final specialty = _specialtyController.text.trim();
    final year = int.tryParse(_yearController.text.trim());

    if (name.isEmpty || specialty.isEmpty || year == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Заполните все поля, год — числом')),
      );
      return;
    }

    setState(() {
      _students.add(
        Student(name: name, specialty: specialty, graduationYear: year),
      );
    });

    _nameController.clear();
    _specialtyController.clear();
    _yearController.clear();
    FocusScope.of(context).unfocus();
  }

  void _removeStudent(int index) {
    final removed = _students[index];
    setState(() => _students.removeAt(index));
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Удалён: ${removed.name}')),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Студенты колледжа'),
        backgroundColor: theme.colorScheme.primaryContainer,
        actions: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Center(
              child: Chip(
                label: Text('Всего: ${_students.length}'),
                visualDensity: VisualDensity.compact,
              ),
            ),
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _InputCard(
            nameController: _nameController,
            specialtyController: _specialtyController,
            yearController: _yearController,
            onAdd: _addStudent,
          ),
          const SizedBox(height: 16),
          if (_students.isEmpty)
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 32),
              child: Center(
                child: Text(
                  'Список пуст',
                  style: theme.textTheme.bodyLarge?.copyWith(
                    color: theme.colorScheme.outline,
                  ),
                ),
              ),
            )
          else
            ...List<Widget>.generate(_students.length, (index) {
              final student = _students[index];
              return Card(
                margin: const EdgeInsets.only(bottom: 12),
                child: ListTile(
                  leading: CircleAvatar(
                    child: Text(student.name.substring(0, 1).toUpperCase()),
                  ),
                  title: Text(student.name),
                  subtitle: Text(
                    '${student.specialty} · выпуск ${student.graduationYear}',
                  ),
                  trailing: IconButton(
                    icon: const Icon(Icons.delete_outline),
                    tooltip: 'Удалить',
                    onPressed: () => _removeStudent(index),
                  ),
                ),
              );
            }),
        ],
      ),
    );
  }
}

class _InputCard extends StatelessWidget {
  const _InputCard({
    required this.nameController,
    required this.specialtyController,
    required this.yearController,
    required this.onAdd,
  });

  final TextEditingController nameController;
  final TextEditingController specialtyController;
  final TextEditingController yearController;
  final VoidCallback onAdd;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text(
              'Добавить студента',
              style: Theme.of(context).textTheme.titleMedium,
            ),
            const SizedBox(height: 12),
            TextField(
              controller: nameController,
              textInputAction: TextInputAction.next,
              decoration: const InputDecoration(
                labelText: 'Имя',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: specialtyController,
              textInputAction: TextInputAction.next,
              decoration: const InputDecoration(
                labelText: 'Специальность',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: yearController,
              keyboardType: TextInputType.number,
              textInputAction: TextInputAction.done,
              onSubmitted: (_) => onAdd(),
              decoration: const InputDecoration(
                labelText: 'Год выпуска',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 16),
            FilledButton.icon(
              onPressed: onAdd,
              icon: const Icon(Icons.person_add_alt_1),
              label: const Text('Добавить'),
            ),
          ],
        ),
      ),
    );
  }
}
