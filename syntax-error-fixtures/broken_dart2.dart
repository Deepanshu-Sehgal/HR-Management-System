class Counter {
  int count = 0

  void increment( {
    count++;
  }

  int get value {
    return count;
  }
}

void main() {
  final c = Counter();
  c.increment();
  print(c.value)
}
