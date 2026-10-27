import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:college_app/main.dart';

void main() {
  testWidgets('shows seeded students', (WidgetTester tester) async {
    await tester.pumpWidget(const CollegeApp());

    expect(find.text('Студенты колледжа'), findsOneWidget);
    expect(find.text('Alex River'), findsOneWidget);
    expect(find.text('Всего: 2'), findsOneWidget);
  });

  testWidgets('adds a student through the form', (WidgetTester tester) async {
    await tester.pumpWidget(const CollegeApp());

    await tester.enterText(find.widgetWithText(TextField, 'Имя'), 'Иван');
    await tester.enterText(
      find.widgetWithText(TextField, 'Специальность'),
      'Информатика',
    );
    await tester.enterText(
      find.widgetWithText(TextField, 'Год выпуска'),
      '2027',
    );
    await tester.tap(find.widgetWithText(FilledButton, 'Добавить'));
    await tester.pumpAndSettle();

    expect(find.text('Иван'), findsOneWidget);
    expect(find.text('Всего: 3'), findsOneWidget);
  });

  testWidgets('rejects incomplete input', (WidgetTester tester) async {
    await tester.pumpWidget(const CollegeApp());

    await tester.tap(find.widgetWithText(FilledButton, 'Добавить'));
    await tester.pump();

    expect(find.text('Заполните все поля, год — числом'), findsOneWidget);
  });
}
