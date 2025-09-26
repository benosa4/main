import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hive/hive.dart';

import '../models/models.dart';

final storageServiceProvider = Provider<StorageService>((ref) {
  return StorageService();
});

class StorageService {
  Future<void> init() async {
    // TODO: initialize Hive for mobile/web.
  }

  Future<List<Notebook>> loadNotebooks() async {
    // TODO: load from Hive boxes.
    return const [];
  }

  Future<void> saveNotebook(Notebook notebook) async {
    // TODO: persist notebook.
  }
}
